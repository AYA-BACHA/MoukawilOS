"""Unit tests for services/compliance.py: pure functions, no database, no network."""
from datetime import date
from decimal import Decimal as D

import pytest

from app.services import compliance as svc

SARA = date(2025, 10, 15)       # card date = activity start

import pytest

@pytest.fixture(autouse=True)
def _no_real_pool(monkeypatch):
      from app.core.db import pool
      monkeypatch.setattr(pool, "open", lambda *a, **k: None)
      monkeypatch.setattr(pool, "close", lambda *a, **k: None)


# ------------------------------------------------------------------ helpers
def calendar(defs, year, today, card=SARA, start=SARA, done=()):
    return svc.build_calendar(defs, set(done), card, start, year, today)


def by_code(items):
    return {i["code"]: i for i in items}


def item(code, days_left, status="upcoming", period=2026, end=None, verified=False):
    """A calendar item, only with the keys build_alerts reads."""
    return {"code": code, "status": status, "days_left": days_left,
            "end_date": end or date(2027, 1, 20), "period_year": period,
            "verified": verified}


# ------------------------------------------------------------------ summary
class TestSummary:
    def test_sara_figures(self, rules):
        s = svc.build_summary(2026, D("825500.00"), rules)
        assert s["collected_da"] == D("825500.00")
        assert s["ceiling_da"] == D("5000000.00")
        assert s["percent_of_ceiling"] == D("16.5")
        assert s["remaining_da"] == D("4174500.00")
        assert s["over_ceiling"] is False
        assert s["ifu_estimate_da"] == D("10000.00")      # 0.5% = 4,127.50 -> minimum applies
        assert s["casnos_flat_da"] == D("24000.00")
        assert s["total_estimate_da"] == D("34000.00")
        assert s["missing_rules"] == []
        assert s["ifu_rate_percent"] == D("0.50")
        assert s["ifu_minimum_da"] == D("10000.00")
        assert s["ceiling_level"] == "ok"

    def test_ifu_above_minimum(self, rules):
        s = svc.build_summary(2026, D("4326500.00"), rules)
        assert s["ifu_estimate_da"] == D("21632.50")
        assert s["total_estimate_da"] == D("45632.50")
        assert s["percent_of_ceiling"] == D("86.5")
        assert s["remaining_da"] == D("673500.00")
        assert s["ceiling_level"] == "warning"

    def test_rate_is_a_fraction_not_a_percent(self, rules):
        # guards against dividing by 100 twice: 4,000,000 x 0.5% = 20,000
        assert svc.build_summary(2026, D("4000000"), rules)["ifu_estimate_da"] == D("20000.00")

    def test_minimum_break_even_at_two_million(self, rules):
        assert svc.build_summary(2026, D("2000000"), rules)["ifu_estimate_da"] == D("10000.00")
        assert svc.build_summary(2026, D("2000100"), rules)["ifu_estimate_da"] == D("10000.50")

    def test_zero_turnover_still_pays_the_minimum(self, rules):
        s = svc.build_summary(2026, D("0"), rules)
        assert s["ifu_estimate_da"] == D("10000.00")
        assert s["percent_of_ceiling"] == D("0.0")
        assert s["remaining_da"] == D("5000000.00")

    def test_rounds_half_up_to_two_decimals(self, rules):
        # 4,000,001 x 0.005 = 20,000.005 -> 20,000.01
        assert svc.build_summary(2026, D("4000001"), rules)["ifu_estimate_da"] == D("20000.01")

    def test_over_the_ceiling(self, rules):
        s = svc.build_summary(2026, D("5125500.00"), rules)
        assert s["over_ceiling"] is True
        assert s["remaining_da"] == D("0.00")
        assert s["percent_of_ceiling"] == D("102.5")
        assert s["ceiling_level"] == "exceeded"

    def test_exactly_at_the_ceiling_is_not_over(self, rules):
        s = svc.build_summary(2026, D("5000000"), rules)
        assert s["over_ceiling"] is False
        assert s["remaining_da"] == D("0.00")
        assert s["ceiling_level"] == "high"

    def test_missing_rules_give_none_not_made_up_numbers(self):
        s = svc.build_summary(2026, D("825500"), {})
        assert s["ceiling_da"] is None
        assert s["percent_of_ceiling"] is None
        assert s["remaining_da"] is None
        assert s["ifu_estimate_da"] is None
        assert s["casnos_flat_da"] is None
        assert s["total_estimate_da"] is None
        assert s["over_ceiling"] is False
        assert s["ceiling_level"] is None
        assert s["missing_rules"] == ["CEILING", "IFU_RATE", "IFU_MIN", "CASNOS_FLAT"]

    def test_no_minimum_rule_means_no_floor(self, rules):
        del rules["IFU_MIN"]
        s = svc.build_summary(2026, D("1000000"), rules)
        assert s["ifu_estimate_da"] == D("5000.00")
        assert "IFU_MIN" in s["missing_rules"]

    def test_no_total_without_casnos(self, rules):
        del rules["CASNOS_FLAT"]
        s = svc.build_summary(2026, D("825500"), rules)
        assert s["ifu_estimate_da"] == D("10000.00")
        assert s["total_estimate_da"] is None

    def test_sources_list_only_the_four_legal_rules(self, rules):
        s = svc.build_summary(2026, D("1"), rules)
        assert set(s["sources"]) == {"CEILING", "IFU_RATE", "IFU_MIN", "CASNOS_FLAT"}


# ------------------------------------------------------------ ceiling level
class TestCeilingLevel:
    C, W1, W2 = D("5000000"), D("0.8"), D("0.95")

    @pytest.mark.parametrize("collected, expected", [
        ("0", "ok"),
        ("3999999", "ok"),
        ("4000000", "warning"),        # exactly 80%
        ("4749999", "warning"),
        ("4750000", "high"),           # exactly 95%
        ("5000000", "high"),           # exactly the ceiling is not "exceeded"
        ("5000001", "exceeded"),
    ])
    def test_boundaries(self, collected, expected):
        assert svc.ceiling_level(D(collected), self.C, self.W1, self.W2) == expected

    def test_no_ceiling_rule(self):
        assert svc.ceiling_level(D("1"), None, self.W1, self.W2) is None
        assert svc.ceiling_level(D("1"), D("0"), self.W1, self.W2) is None

    def test_no_thresholds_means_ok_until_exceeded(self):
        assert svc.ceiling_level(D("4999999"), self.C, None, None) == "ok"
        assert svc.ceiling_level(D("5000001"), self.C, None, None) == "exceeded"


# ------------------------------------------------- years above the ceiling
class TestConsecutiveYearsOver:
    C = {2023: D("5000000"), 2024: D("5000000"), 2025: D("5000000"), 2026: D("5000000")}

    def test_never_over(self):
        assert svc.consecutive_years_over({2026: D("1")}, self.C, 2026, 3) == 0

    def test_this_year_only(self):
        assert svc.consecutive_years_over({2026: D("6000000")}, self.C, 2026, 3) == 1

    def test_two_years_in_a_row(self):
        t = {2025: D("6000000"), 2026: D("6000000")}
        assert svc.consecutive_years_over(t, self.C, 2026, 3) == 2

    def test_three_years_in_a_row(self):
        t = {y: D("6000000") for y in (2024, 2025, 2026)}
        assert svc.consecutive_years_over(t, self.C, 2026, 3) == 3

    def test_count_stops_at_the_maximum(self):
        t = {y: D("6000000") for y in (2023, 2024, 2025, 2026)}
        assert svc.consecutive_years_over(t, self.C, 2026, 3) == 3

    def test_counts_from_last_year_when_this_year_is_not_over_yet(self):
        t = {2024: D("6000000"), 2025: D("6000000"), 2026: D("100")}
        assert svc.consecutive_years_over(t, self.C, 2026, 3) == 2

    def test_a_gap_breaks_the_streak(self):
        t = {2024: D("6000000"), 2025: D("100"), 2026: D("6000000")}
        assert svc.consecutive_years_over(t, self.C, 2026, 3) == 1

    def test_a_year_without_a_ceiling_rule_is_not_over(self):
        ceilings = {2026: D("5000000"), 2025: None}
        t = {2025: D("9000000"), 2026: D("6000000")}
        assert svc.consecutive_years_over(t, ceilings, 2026, 3) == 1

    def test_equal_to_the_ceiling_is_not_over(self):
        assert svc.consecutive_years_over({2026: D("5000000")}, self.C, 2026, 3) == 0


# ---------------------------------------------------------------- cap alert
class TestCapAlert:
    def test_no_alert_when_far_from_the_ceiling(self, rules):
        assert svc.build_cap_alert(2026, D("825500"), rules, 0) is None

    def test_no_alert_without_a_ceiling_rule(self, rules):
        del rules["CEILING"]
        assert svc.build_cap_alert(2026, D("9000000"), rules, 1) is None

    def test_warning_from_80_percent(self, rules):
        a = svc.build_cap_alert(2026, D("4326500"), rules, 0)
        assert a["kind"] == "ceiling"
        assert a["id"] == "CEILING-2026"
        assert a["severity"] == "warning"
        assert a["title"] == "Approaching Annual Turnover Ceiling"
        assert a["amount_da"] == D("673500.00")
        assert "86.5%" in a["message"]
        assert "673,500 DA remaining for 2026" in a["message"]
        assert a["due_date"] is None and a["days_left"] is None
        assert a["verified"] is False

    def test_critical_from_95_percent(self, rules):
        a = svc.build_cap_alert(2026, D("4825500"), rules, 0)
        assert a["severity"] == "critical"
        assert a["title"] == "Annual Turnover Ceiling Almost Reached"
        assert a["amount_da"] == D("174500.00")
        assert "96.5%" in a["message"]

    def test_exceeded_first_year(self, rules):
        a = svc.build_cap_alert(2026, D("5125500"), rules, 1)
        assert a["severity"] == "critical"
        assert a["title"] == "Annual Turnover Ceiling Exceeded"
        assert a["amount_da"] == D("125500.00")                # the excess
        assert "5,125,500 DA" in a["message"]
        assert "year 1 above the ceiling" in a["message"]
        assert "Check with ANAE" not in a["message"]            # no accusation after one year

    def test_exceeded_second_year(self, rules):
        a = svc.build_cap_alert(2026, D("5125500"), rules, 2)
        assert "year 2 above the ceiling" in a["message"]
        assert "Check with ANAE" not in a["message"]

    def test_exceeded_three_years_requires_registration(self, rules):
        a = svc.build_cap_alert(2026, D("5125500"), rules, 3)
        assert "3 consecutive years above the ceiling" in a["message"]
        assert "must register in the commercial register to continue" in a["message"]
        assert "Check with ANAE" in a["message"]

    def test_number_of_years_comes_from_the_rule(self, rules):
        rules["CEILING_STRIKES"]["value"] = D("2")
        a = svc.build_cap_alert(2026, D("5125500"), rules, 2)
        assert "Check with ANAE" in a["message"]

    def test_default_of_three_years_when_the_rule_is_missing(self, rules):
        del rules["CEILING_STRIKES"]
        assert "Check with ANAE" not in svc.build_cap_alert(2026, D("5125500"), rules, 2)["message"]
        assert "Check with ANAE" in svc.build_cap_alert(2026, D("5125500"), rules, 3)["message"]


# ----------------------------------------------------------------- calendar
class TestCalendar:
    def test_2026_for_sara(self, defs, today):
        items = calendar(defs, 2026, today)
        assert {i["code"] for i in items} == {"G12_BIS", "CASNOS_PAYMENT", "IFU_MINIMUM", "G12"}
        c = by_code(items)
        assert c["G12_BIS"]["period_year"] == 2025          # regularises last year
        assert c["G12_BIS"]["end_date"] == date(2026, 1, 20)
        assert c["G12_BIS"]["days_left"] == -278
        assert c["G12"]["period_year"] == 2026
        assert c["G12"]["end_date"] == date(2026, 6, 30)
        assert c["G12"]["days_left"] == -117
        assert all(i["status"] == "overdue" for i in items)
        assert [i["end_date"] for i in items] == sorted(i["end_date"] for i in items)

    def test_instalments_are_never_shown(self, defs, today):
        for year in (2025, 2026, 2027):
            codes = {i["code"] for i in calendar(defs, year, today)}
            assert not any(c.startswith("IFU_INSTALLMENT") for c in codes)

    def test_2025_for_sara_has_only_the_start_up_deadlines(self, defs, today):
        c = by_code(calendar(defs, 2025, today))
        assert set(c) == {"CASNOS_AFFILIATION", "NIF_DECLARATION"}
        assert c["CASNOS_AFFILIATION"]["end_date"] == date(2025, 10, 25)   # 10 days after start
        assert c["NIF_DECLARATION"]["end_date"] == date(2025, 11, 14)      # 30 days after card
        assert c["NIF_DECLARATION"]["verified"] is True
        assert c["CASNOS_AFFILIATION"]["verified"] is False

    def test_2027_is_all_upcoming(self, defs, today):
        items = calendar(defs, 2027, today)
        assert {i["code"] for i in items} == {"G12_BIS", "CASNOS_PAYMENT", "IFU_MINIMUM", "G12"}
        assert all(i["status"] == "upcoming" and i["days_left"] > 0 for i in items)
        assert by_code(items)["G12_BIS"]["period_year"] == 2026

    def test_before_the_activity_started_there_is_nothing(self, defs, today):
        assert calendar(defs, 2024, today) == []

    def test_done_is_matched_on_code_and_period_year(self, defs, today):
        items = calendar(defs, 2026, today, done={("G12", 2026), ("G12_BIS", 2025)})
        c = by_code(items)
        assert c["G12"]["status"] == "done" and c["G12"]["days_left"] is None
        assert c["G12_BIS"]["status"] == "done"
        assert c["IFU_MINIMUM"]["status"] == "overdue"
        # another period year does not mark this one
        items = calendar(defs, 2026, today, done={("G12_BIS", 2026)})
        assert by_code(items)["G12_BIS"]["status"] == "overdue"

    def test_open_window_and_due_today(self, defs):
        c = by_code(calendar(defs, 2026, date(2026, 6, 15)))
        assert c["G12"]["status"] == "open"
        assert c["IFU_MINIMUM"]["status"] == "open"
        assert c["CASNOS_PAYMENT"]["status"] == "upcoming"
        assert c["G12_BIS"]["status"] == "overdue"
        c = by_code(calendar(defs, 2026, date(2026, 6, 30)))
        assert c["G12"]["status"] == "open" and c["G12"]["days_left"] == 0   # due today, not late

    def test_first_year_started_after_30_june_has_no_g12(self, defs, today):
        start = date(2026, 8, 1)
        c26 = {i["code"] for i in calendar(defs, 2026, today, card=start, start=start)}
        assert c26 == {"NIF_DECLARATION", "CASNOS_AFFILIATION"}
        c27 = {i["code"] for i in calendar(defs, 2027, today, card=start, start=start)}
        assert c27 == {"G12_BIS", "G12", "IFU_MINIMUM", "CASNOS_PAYMENT"}

    def test_first_year_rule_holds_even_if_the_g12_window_ends_after_30_june(self, defs, today):
        # a G12 whose window runs to 30 September must still be hidden for someone who
        # started in August: first-year taxpayers file no G12 and pay no minimum
        for d in defs:
            if d["code"] in ("G12", "IFU_MINIMUM"):
                d["end_month"], d["end_day"] = 9, 30
        start = date(2026, 8, 1)
        codes = {i["code"] for i in calendar(defs, 2026, today, card=start, start=start)}
        assert "G12" not in codes and "IFU_MINIMUM" not in codes
        # but someone who started in May still gets them
        start = date(2026, 5, 1)
        codes = {i["code"] for i in calendar(defs, 2026, today, card=start, start=start)}
        assert {"G12", "IFU_MINIMUM"} <= codes

    def test_started_before_30_june_has_the_g12_that_year(self, defs, today):
        start = date(2025, 3, 1)
        c = {i["code"] for i in calendar(defs, 2025, today, card=start, start=start)}
        assert c == {"G12", "IFU_MINIMUM", "CASNOS_PAYMENT", "NIF_DECLARATION", "CASNOS_AFFILIATION"}

    def test_without_dates_only_the_fixed_deadlines_remain(self, defs, today):
        items = calendar(defs, 2026, today, card=None, start=None)
        assert {i["code"] for i in items} == {"G12", "IFU_MINIMUM", "G12_BIS", "CASNOS_PAYMENT"}

    def test_a_relative_deadline_can_fall_in_the_next_year(self, defs, today):
        nif = [d for d in defs if d["code"] == "NIF_DECLARATION"]
        card = date(2025, 12, 20)                          # + 30 days = 2026-01-19
        assert calendar(nif, 2025, today, card=card, start=card) == []
        c = by_code(calendar(nif, 2026, today, card=card, start=card))
        assert c["NIF_DECLARATION"]["end_date"] == date(2026, 1, 19)
        assert c["NIF_DECLARATION"]["period_year"] == 2025

    def test_no_definitions_no_items(self, today):
        assert calendar([], 2026, today) == []

    def test_every_item_has_the_keys_the_api_needs(self, defs, today):
        keys = {"code", "period_year", "start_date", "end_date", "status",
                "days_left", "official_link", "note", "verified", "amount_da"}
        for i in calendar(defs, 2026, today):
            assert set(i) == keys
            assert i["amount_da"] is None       # amounts are added later by the route


# ------------------------------------------------------------------- amounts
class TestAmountFor:
    A = {2026: {"G12": D("10000.00"), "CASNOS_PAYMENT": D("24000.00")}}

    def test_found(self):
        assert svc.amount_for("G12", 2026, self.A) == D("10000.00")

    def test_other_period_year_has_no_amount(self):
        assert svc.amount_for("G12", 2025, self.A) is None

    def test_code_without_amount(self):
        assert svc.amount_for("IFU_MINIMUM", 2026, self.A) is None


# -------------------------------------------------------------------- alerts
class TestAlerts:
    @pytest.mark.parametrize("days_left, expected", [
        (31, None),          # outside the 30-day window
        (30, "info"),
        (8, "info"),
        (7, "warning"),
        (1, "warning"),
        (0, "warning"),      # due today
        (-1, "overdue"),
        (-400, "overdue"),
    ])
    def test_severity_by_days_left(self, days_left, expected):
        alerts = svc.build_alerts([item("G12_BIS", days_left)], 30, {})
        if expected is None:
            assert alerts == []
        else:
            assert [a["severity"] for a in alerts] == [expected]

    def test_done_items_never_alert(self):
        assert svc.build_alerts([item("G12_BIS", None, status="done")], 30, {}) == []

    def test_the_window_comes_from_the_argument(self):
        assert svc.build_alerts([item("G12_BIS", 26)], 10, {}) == []
        assert len(svc.build_alerts([item("G12_BIS", 26)], 30, {})) == 1

    def test_g12_bis_text(self):
        a = svc.build_alerts([item("G12_BIS", 26)], 30, {})[0]
        assert a["title"] == "Statutory G12 bis Declaration Due"
        assert a["message"] == "Annual IFU regularisation deadline is January 20, 2027."
        assert a["id"] == "G12_BIS-2026"
        assert a["due_date"] == date(2027, 1, 20)
        assert a["period_year"] == 2026
        assert a["days_left"] == 26

    def test_other_titles(self):
        titles = {
            "G12": "Statutory G12 Declaration Due",
            "IFU_MINIMUM": "IFU Minimum Payment Due",
            "CASNOS_PAYMENT": "CASNOS Contribution Due",
            "CASNOS_AFFILIATION": "CASNOS Affiliation Due",
            "NIF_DECLARATION": "Tax ID Declaration Due",
        }
        for code, title in titles.items():
            assert svc.build_alerts([item(code, 5)], 30, {})[0]["title"] == title

    def test_unknown_code_still_gets_a_generic_alert(self):
        a = svc.build_alerts([item("SOMETHING_NEW", 5)], 30, {})[0]
        assert a["title"] == "SOMETHING_NEW"
        assert a["message"] == "Deadline is January 20, 2027."

    def test_amount_follows_the_period_year(self):
        amounts = {2026: {"G12_BIS": D("21632.50")}}
        assert svc.build_alerts([item("G12_BIS", 5, period=2026)], 30, amounts)[0]["amount_da"] == D("21632.50")
        assert svc.build_alerts([item("G12_BIS", 5, period=2025)], 30, amounts)[0]["amount_da"] is None

    def test_verified_flag_is_passed_through(self):
        assert svc.build_alerts([item("NIF_DECLARATION", 5, verified=True)], 30, {})[0]["verified"] is True
        assert svc.build_alerts([item("G12", 5)], 30, {})[0]["verified"] is False

    def test_sorted_by_due_date(self):
        items = [item("G12", 5, end=date(2026, 12, 1)), item("CASNOS_PAYMENT", 3, end=date(2026, 11, 1))]
        assert [a["code"] for a in svc.build_alerts(items, 30, {})] == ["CASNOS_PAYMENT", "G12"]


class TestAlertsForSara:
    """Calendar + alerts together, like GET /compliance/alerts does."""

    @staticmethod
    def alerts(defs, today, done=(), reminder=30):
        items = (calendar(defs, today.year, today, done=done)
                 + calendar(defs, today.year + 1, today, done=done))
        return svc.build_alerts(items, reminder, {})

    def test_today_four_overdue_alerts(self, defs, today):
        a = self.alerts(defs, today)
        assert {x["id"] for x in a} == {
            "G12_BIS-2025", "IFU_MINIMUM-2026", "G12-2026", "CASNOS_PAYMENT-2026"}
        assert all(x["severity"] == "overdue" for x in a)

    def test_in_december_the_january_g12_bis_appears(self, defs):
        a = by_code_alert(self.alerts(defs, date(2026, 12, 25)))
        x = a["G12_BIS-2026"]
        assert x["severity"] == "info" and x["days_left"] == 26
        assert x["message"] == "Annual IFU regularisation deadline is January 20, 2027."

    def test_one_week_before_on_the_day_and_after(self, defs):
        for day, severity, left in [(date(2027, 1, 13), "warning", 7),
                                    (date(2027, 1, 20), "warning", 0),
                                    (date(2027, 1, 21), "overdue", -1)]:
            x = by_code_alert(self.alerts(defs, day))["G12_BIS-2026"]
            assert (x["severity"], x["days_left"]) == (severity, left)

    def test_marking_it_done_removes_the_alert(self, defs):
        day = date(2026, 12, 25)
        assert "G12_BIS-2026" in by_code_alert(self.alerts(defs, day))
        assert "G12_BIS-2026" not in by_code_alert(self.alerts(defs, day, done={("G12_BIS", 2026)}))

    def test_casnos_alert_a_month_before_30_june(self, defs):
        x = by_code_alert(self.alerts(defs, date(2027, 5, 31)))["CASNOS_PAYMENT-2027"]
        assert x["severity"] == "info" and x["days_left"] == 30
        assert x["message"] == "Annual CASNOS contribution deadline is June 30, 2027."


def by_code_alert(alerts):
    return {a["id"]: a for a in alerts}