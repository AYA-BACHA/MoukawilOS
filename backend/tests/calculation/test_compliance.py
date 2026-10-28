
from datetime import date
from decimal import Decimal

import pytest

from app.services.compliance import (
    amount_for,
    build_alerts,
    build_cap_alert,
    build_calendar,
    build_summary,
    ceiling_level,
    consecutive_years_over,
)

D = lambda x: None if x is None else Decimal(str(x))  # noqa: E731


# ---------------------------------------------------------------- ceiling_level
class TestCeilingLevel:
    def test_no_ceiling_rule_is_none(self):
        assert ceiling_level(D(1000), None, D("0.8"), D("0.95")) is None

    def test_zero_ceiling_is_treated_as_no_ceiling(self):
        """A falsy Decimal(0) ceiling -- `not ceiling` -- should also be None."""
        assert ceiling_level(D(1000), D(0), D("0.8"), D("0.95")) is None

    def test_exactly_at_ceiling_is_not_exceeded(self):
        assert ceiling_level(D(5_000_000), D(5_000_000), D("0.8"), D("0.95")) == "high"

    def test_over_ceiling_is_exceeded(self):
        assert ceiling_level(D(5_000_001), D(5_000_000), D("0.8"), D("0.95")) == "exceeded"

    def test_missing_both_thresholds_is_always_ok_unless_exceeded(self):
        """No WARN_LEVEL_1/2 rules configured -> never warns, even at 99%."""
        assert ceiling_level(D(4_999_999), D(5_000_000), None, None) == "ok"

    def test_missing_lower_threshold_does_not_fall_through_to_warning(self):
        """Only WARN_LEVEL_2 configured: below it, stays 'ok' even if it would
        have crossed a (missing) WARN_LEVEL_1."""
        assert ceiling_level(D(4_500_000), D(5_000_000), None, D("0.95")) == "ok"

    def test_only_upper_threshold_configured_still_fires(self):
        assert ceiling_level(D(4_800_000), D(5_000_000), None, D("0.95")) == "high"

    @pytest.mark.parametrize("ratio,expected", [
        (D("0.79"), "ok"), (D("0.80"), "warning"), (D("0.94"), "warning"), (D("0.95"), "high"),
    ])
    def test_threshold_boundaries_are_inclusive(self, ratio, expected):
        ceiling = D(1_000_000)
        assert ceiling_level(ceiling * ratio, ceiling, D("0.8"), D("0.95")) == expected


# ---------------------------------------------------------------- consecutive_years_over
class TestConsecutiveYearsOver:
    def test_no_years_over(self):
        turnover = {y: D(1_000_000) for y in (2024, 2025, 2026)}
        ceilings = {y: D(5_000_000) for y in (2024, 2025, 2026)}
        assert consecutive_years_over(turnover, ceilings, 2026, 3) == 0

    def test_current_year_over_counts_from_current_year(self):
        turnover = {2026: D(6_000_000)}
        ceilings = {2026: D(5_000_000)}
        assert consecutive_years_over(turnover, ceilings, 2026, 3) == 1

    def test_current_year_not_over_looks_back_to_prior_years(self):
        """If this year isn't over (yet), counting starts from last year instead."""
        turnover = {2025: D(6_000_000), 2026: D(1_000_000)}
        ceilings = {2025: D(5_000_000), 2026: D(5_000_000)}
        assert consecutive_years_over(turnover, ceilings, 2026, 3) == 1

    def test_a_gap_breaks_the_streak(self):
        turnover = {2024: D(6_000_000), 2025: D(1_000_000), 2026: D(6_000_000)}
        ceilings = {y: D(5_000_000) for y in (2024, 2025, 2026)}
        # 2026 is over (n=1), but 2025 is not -> stop there, 2024 never checked
        assert consecutive_years_over(turnover, ceilings, 2026, 5) == 1

    def test_capped_at_max_years_even_with_a_longer_streak(self):
        turnover = {y: D(6_000_000) for y in range(2020, 2027)}
        ceilings = {y: D(5_000_000) for y in range(2020, 2027)}
        assert consecutive_years_over(turnover, ceilings, 2026, 3) == 3

    def test_missing_ceiling_for_a_year_stops_the_count_safely(self):
        """No crash on a year with no ceiling rule on record -- just treated as not over."""
        turnover = {2025: D(6_000_000), 2026: D(6_000_000)}
        ceilings = {2026: D(5_000_000)}            # 2025's ceiling is simply absent
        assert consecutive_years_over(turnover, ceilings, 2026, 5) == 1

    def test_missing_turnover_for_a_year_defaults_to_zero(self):
        ceilings = {2025: D(5_000_000), 2026: D(5_000_000)}
        turnover = {2026: D(6_000_000)}             # 2025 never recorded at all
        assert consecutive_years_over(turnover, ceilings, 2026, 5) == 1


# ---------------------------------------------------------------- build_summary
class TestBuildSummary:
    FULL_RULES = {
        "CEILING": {"value": D(5_000_000), "source": "Law X"},
        "IFU_RATE": {"value": D("0.005"), "source": "Law Y"},
        "IFU_MIN": {"value": D(10_000), "source": "Law Z"},
        "CASNOS_FLAT": {"value": D(24_000), "source": "Decree W"},
    }

    def test_all_rules_present(self):
        s = build_summary(2026, D(2_000_000), self.FULL_RULES)
        assert s["ceiling_da"] == D("5000000.00")
        assert s["percent_of_ceiling"] == D("40.0")
        assert s["remaining_da"] == D("3000000.00")
        assert s["over_ceiling"] is False
        assert s["ifu_estimate_da"] == D("10000.00")       # 0.5% of 2M = 10,000, above the floor
        assert s["casnos_flat_da"] == D("24000.00")
        assert s["total_estimate_da"] == D("34000.00")
        assert s["missing_rules"] == []
        assert s["sources"] == {"CEILING": "Law X", "IFU_RATE": "Law Y",
                                 "IFU_MIN": "Law Z", "CASNOS_FLAT": "Decree W"}
        assert s["ifu_rate_percent"] == D("0.50")
        assert s["ifu_minimum_da"] == D("10000.00")
        assert s["ceiling_level"] == "ok"

    def test_missing_ifu_min_drops_the_floor_but_keeps_everything_else(self):
        rules = {k: v for k, v in self.FULL_RULES.items() if k != "IFU_MIN"}
        s = build_summary(2026, D(100_000), rules)
        assert s["missing_rules"] == ["IFU_MIN"]
        assert s["ifu_estimate_da"] == D("500.00")          # 0.5% of 100k, no floor to clamp to
        assert s["ifu_minimum_da"] is None
        assert s["ceiling_da"] == D("5000000.00")            # unaffected

    def test_missing_ceiling_blanks_only_ceiling_fields(self):
        rules = {k: v for k, v in self.FULL_RULES.items() if k != "CEILING"}
        s = build_summary(2026, D(2_000_000), rules)
        assert s["ceiling_da"] is None
        assert s["percent_of_ceiling"] is None
        assert s["remaining_da"] is None
        assert s["over_ceiling"] is False
        assert s["ceiling_level"] is None
        assert s["ifu_estimate_da"] == D("10000.00")         # tax math unaffected

    def test_missing_ifu_rate_blanks_ifu_and_total_but_keeps_casnos(self):
        rules = {k: v for k, v in self.FULL_RULES.items() if k != "IFU_RATE"}
        s = build_summary(2026, D(2_000_000), rules)
        assert s["ifu_estimate_da"] is None
        assert s["ifu_rate_percent"] is None
        assert s["casnos_flat_da"] == D("24000.00")
        assert s["total_estimate_da"] is None                # needs both ifu and casnos

    def test_missing_casnos_blanks_casnos_and_total_but_keeps_ifu(self):
        rules = {k: v for k, v in self.FULL_RULES.items() if k != "CASNOS_FLAT"}
        s = build_summary(2026, D(2_000_000), rules)
        assert s["casnos_flat_da"] is None
        assert s["ifu_estimate_da"] == D("10000.00")
        assert s["total_estimate_da"] is None

    def test_no_rules_at_all(self):
        s = build_summary(2022, D(0), {})
        assert s["missing_rules"] == ["CEILING", "IFU_RATE", "IFU_MIN", "CASNOS_FLAT"]
        assert s["sources"] == {}
        assert all(s[k] is None for k in
                   ("ceiling_da", "percent_of_ceiling", "remaining_da",
                    "ifu_estimate_da", "casnos_flat_da", "total_estimate_da",
                    "ifu_rate_percent", "ifu_minimum_da", "ceiling_level"))
        assert s["over_ceiling"] is False


# ---------------------------------------------------------------- build_cap_alert
class TestBuildCapAlert:
    def test_comfortable_turnover_returns_no_alert(self):
        rules = {"CEILING": {"value": D(5_000_000)}, "WARN_LEVEL_1": {"value": D("0.8")},
                 "WARN_LEVEL_2": {"value": D("0.95")}, "CEILING_STRIKES": {"value": D(3)}}
        assert build_cap_alert(2026, D(1_000_000), rules, 0) is None

    def test_warning_level_message_and_amount(self):
        rules = {"CEILING": {"value": D(5_000_000)}, "WARN_LEVEL_1": {"value": D("0.8")},
                 "WARN_LEVEL_2": {"value": D("0.95")}, "CEILING_STRIKES": {"value": D(3)}}
        a = build_cap_alert(2026, D(4_000_000), rules, 0)
        assert a["kind"] == "ceiling" and a["code"] == "CEILING" and a["id"] == "CEILING-2026"
        assert a["title"] == "Approaching Annual Turnover Ceiling"
        assert a["severity"] == "warning"
        assert a["amount_da"] == D("1000000.00")
        assert a["message"] == ("You have reached 80.0% of your 5,000,000 DA annual ceiling. "
                                 "1,000,000 DA remaining for 2026.")

    def test_high_level_is_critical_severity(self):
        rules = {"CEILING": {"value": D(5_000_000)}, "WARN_LEVEL_1": {"value": D("0.8")},
                 "WARN_LEVEL_2": {"value": D("0.95")}, "CEILING_STRIKES": {"value": D(3)}}
        a = build_cap_alert(2026, D(4_800_000), rules, 0)
        assert a["severity"] == "critical"
        assert a["title"] == "Annual Turnover Ceiling Almost Reached"

    def test_exceeded_below_strike_count(self):
        rules = {"CEILING": {"value": D(5_000_000)}, "WARN_LEVEL_1": {"value": D("0.8")},
                 "WARN_LEVEL_2": {"value": D("0.95")}, "CEILING_STRIKES": {"value": D(3)}}
        a = build_cap_alert(2026, D(6_000_000), rules, 1)
        assert a["title"] == "Annual Turnover Ceiling Exceeded"
        assert a["severity"] == "critical"
        assert a["amount_da"] == D("1000000.00")
        assert a["message"] == (
            "Your 2026 turnover is 6,000,000 DA, above the 5,000,000 DA annual ceiling "
            "by 1,000,000 DA. This is year 1 above the ceiling. After 3 consecutive "
            "years you must register in the commercial register.")

    def test_exceeded_at_strike_count_warns_about_registration(self):
        rules = {"CEILING": {"value": D(5_000_000)}, "WARN_LEVEL_1": {"value": D("0.8")},
                 "WARN_LEVEL_2": {"value": D("0.95")}, "CEILING_STRIKES": {"value": D(3)}}
        a = build_cap_alert(2026, D(6_000_000), rules, 3)
        assert "3 consecutive years above the ceiling" in a["message"]
        assert "commercial register" in a["message"]

    def test_strikes_defaults_to_three_when_rule_missing(self):
        rules = {"CEILING": {"value": D(5_000_000)}, "WARN_LEVEL_1": {"value": D("0.8")},
                 "WARN_LEVEL_2": {"value": D("0.95")}}          # no CEILING_STRIKES
        a = build_cap_alert(2026, D(6_000_000), rules, 3)
        assert "3 consecutive years" in a["message"]


# ---------------------------------------------------------------- build_calendar
def fixed_def(code, sm, sd, em, ed, year_offset=0, verified=False, note="", link=None):
    return {"code": code, "days": None, "anchor_start": False, "year_offset": year_offset,
            "start_month": sm, "start_day": sd, "end_month": em, "end_day": ed,
            "official_link": link, "note": note, "verified": verified}


def relative_def(code, days, anchor_start=True, verified=False, note="", link=None):
    return {"code": code, "days": days, "anchor_start": anchor_start, "year_offset": 0,
            "start_month": None, "start_day": None, "end_month": None, "end_day": None,
            "official_link": link, "note": note, "verified": verified}


class TestBuildCalendar:
    def test_hidden_codes_never_appear(self):
        defs = [relative_def("IFU_INSTALLMENT_1", 10), fixed_def("G12", 5, 1, 6, 30)]
        items = build_calendar(defs, set(), date(2025, 3, 1), date(2025, 3, 1),
                                2026, date(2026, 10, 28))
        assert [i["code"] for i in items] == ["G12"]

    def test_relative_deadline_with_no_anchor_date_is_skipped(self):
        defs = [relative_def("CASNOS_AFFILIATION", 10, anchor_start=True)]
        items = build_calendar(defs, set(), card_date=date(2025, 3, 1), activity_start=None,
                                year=2025, today=date(2026, 10, 28))
        assert items == []

    def test_relative_deadline_spanning_a_year_boundary(self):
        """Anchor in late Dec -> due date falls in January of the next year.
        It shows up in the calendar for the year it's DUE, but period_year
        still reflects the year the anchor event happened."""
        defs = [relative_def("CASNOS_AFFILIATION", 10, anchor_start=True)]
        activity_start = date(2025, 12, 25)      # + 10 days = 2026-01-04
        items_2026 = build_calendar(defs, set(), date(2025, 12, 25), activity_start,
                                     2026, date(2026, 10, 28))
        items_2025 = build_calendar(defs, set(), date(2025, 12, 25), activity_start,
                                     2025, date(2026, 10, 28))
        assert len(items_2026) == 1
        assert items_2026[0]["period_year"] == 2025
        assert items_2026[0]["end_date"] == date(2026, 1, 4)
        assert items_2025 == []

    def test_fixed_deadline_entirely_before_activity_start_is_skipped(self):
        defs = [fixed_def("CASNOS_PAYMENT", 6, 30, 6, 30)]
        items = build_calendar(defs, set(), None, date(2025, 8, 1), 2025, date(2026, 10, 28))
        assert items == []

    def test_g12_family_excluded_after_late_start_even_with_a_later_window(self):
        """Isolates the G12_FAMILY-specific check from the general
        end-before-activity-start check, using a synthetic wide window so
        the two checks don't overlap."""
        defs = [fixed_def("G12", 1, 1, 12, 31), fixed_def("CASNOS_PAYMENT", 1, 1, 12, 31)]
        activity_start = date(2026, 8, 15)       # after 30 June, but window still open
        items = build_calendar(defs, set(), None, activity_start, 2026, date(2026, 10, 28))
        codes = {i["code"] for i in items}
        assert "G12" not in codes                 # G12_FAMILY: excluded for late starters
        assert "CASNOS_PAYMENT" in codes           # not in G12_FAMILY: survives

    def test_status_transitions(self):
        defs = [fixed_def("G12", 5, 1, 6, 30)]
        def status_on(today):
            return build_calendar(defs, set(), None, None, 2026, today)[0]["status"]
        assert status_on(date(2026, 4, 30)) == "upcoming"
        assert status_on(date(2026, 5, 1)) == "open"
        assert status_on(date(2026, 6, 30)) == "open"
        assert status_on(date(2026, 7, 1)) == "overdue"

    def test_done_set_overrides_status_and_clears_days_left(self):
        defs = [fixed_def("G12", 5, 1, 6, 30)]
        items = build_calendar(defs, {("G12", 2026)}, None, None, 2026, date(2026, 7, 1))
        assert items[0]["status"] == "done"
        assert items[0]["days_left"] is None

    def test_items_are_sorted_by_end_date(self):
        defs = [fixed_def("CASNOS_PAYMENT", 6, 30, 6, 30), fixed_def("G12_BIS", 1, 20, 1, 20, year_offset=1)]
        items = build_calendar(defs, set(), None, None, 2026, date(2026, 10, 28))
        assert [i["code"] for i in items] == ["G12_BIS", "CASNOS_PAYMENT"]


# ---------------------------------------------------------------- build_alerts
def item(code, period_year, end_date, days_left, status="overdue", verified=False):
    return {"code": code, "period_year": period_year, "end_date": end_date,
            "status": status, "days_left": days_left, "verified": verified}


class TestBuildAlerts:
    def test_done_and_far_off_items_are_excluded_boundary_is_included(self):
        items = [
            item("G12", 2026, date(2026, 6, 30), 31, status="open"),         # excluded: 31 > 30
            item("G12_BIS", 2026, date(2026, 1, 20), 30, status="open"),     # included: == 30
            item("IFU_MINIMUM", 2026, date(2026, 6, 30), None, status="done"),  # excluded: done
        ]
        alerts = build_alerts(items, 30, {})
        assert [a["code"] for a in alerts] == ["G12_BIS"]

    @pytest.mark.parametrize("days_left,expected", [
        (-1, "overdue"), (0, "warning"), (7, "warning"), (8, "info"), (30, "info"),
    ])
    def test_severity_bands(self, days_left, expected):
        items = [item("G12", 2026, date(2026, 6, 30), days_left, status="open")]
        alerts = build_alerts(items, 30, {})
        assert alerts[0]["severity"] == expected

    def test_sorted_by_due_date(self):
        items = [
            item("CASNOS_PAYMENT", 2026, date(2026, 6, 30), 5, status="open"),
            item("G12_BIS", 2026, date(2026, 1, 20), 5, status="open"),
        ]
        alerts = build_alerts(items, 30, {})
        assert [a["code"] for a in alerts] == ["G12_BIS", "CASNOS_PAYMENT"]

    def test_amount_wiring_hit_and_miss(self):
        ifu_by_year = {2026: {"G12": D("15000.00")}}
        items = [
            item("G12", 2026, date(2026, 6, 30), 5, status="open"),
            item("CASNOS_AFFILIATION", 2026, date(2026, 6, 30), 5, status="open"),
        ]
        alerts = build_alerts(items, 30, ifu_by_year)
        by_code = {a["code"]: a for a in alerts}
        assert by_code["G12"]["amount_da"] == D("15000.00")
        assert by_code["CASNOS_AFFILIATION"]["amount_da"] is None

    def test_unknown_code_falls_back_to_generic_text(self):
        items = [item("SOME_FUTURE_CODE", 2026, date(2026, 6, 30), 5, status="open")]
        alerts = build_alerts(items, 30, {})
        assert alerts[0]["title"] == "SOME_FUTURE_CODE"
        assert alerts[0]["message"] == "Deadline is June 30, 2026."

    def test_message_date_formatting_has_no_leading_zero_on_day(self):
        items = [item("G12", 2026, date(2026, 1, 5), 5, status="open")]
        alerts = build_alerts(items, 30, {})
        assert "January 5, 2026" in alerts[0]["message"]

    def test_verified_flag_passes_through(self):
        items = [item("NIF_DECLARATION", 2026, date(2026, 6, 30), 5, status="open", verified=True)]
        alerts = build_alerts(items, 30, {})
        assert alerts[0]["verified"] is True


# ---------------------------------------------------------------- amount_for
class TestAmountFor:
    def test_hit(self):
        assert amount_for("G12", 2026, {2026: {"G12": D(15000)}}) == D(15000)

    def test_miss_unknown_code(self):
        assert amount_for("CASNOS_AFFILIATION", 2026, {2026: {"G12": D(15000)}}) is None

    def test_miss_unknown_year(self):
        assert amount_for("G12", 2099, {2026: {"G12": D(15000)}}) is None