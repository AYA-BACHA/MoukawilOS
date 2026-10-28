"""Step 1: dashboard summary, calculations, calendar, alerts, obligations."""
from datetime import date
from decimal import Decimal

import pytest

from tests.conftest import FROZEN_TODAY, make_token

D = lambda x: None if x is None else Decimal(str(x))  # noqa: E731


# ---------------------------------------------------------------- auth on these routes
class TestAuth:
    def test_no_token(self, app_client):
        assert app_client.get("/dashboard/summary").status_code == 401

    def test_garbage_token(self, app_client):
        r = app_client.get("/dashboard/summary", headers={"Authorization": "Bearer abc.def.ghi"})
        assert r.status_code == 401

    def test_expired_token(self, app_client):
        r = app_client.get("/dashboard/summary",
                           headers={"Authorization": f"Bearer {make_token('x', exp_in=-10)}"})
        assert r.status_code == 401

    def test_user_without_freelancer_is_404(self, app_client, db):
        import uuid
        uid = str(uuid.uuid4())
        db.execute("insert into auth.users (id, email) values (%s,%s)", (uid, "a@b.dz"))
        r = app_client.get("/dashboard/summary", headers={"Authorization": f"Bearer {make_token(uid)}"})
        assert r.status_code == 404


# ---------------------------------------------------------------- summary maths
class TestSummary:
    def test_zero_turnover(self, make_user):
        u = make_user()
        r = u.get("/dashboard/summary?year=2026")
        assert r.status_code == 200, r.text
        s = r.json()
        assert D(s["collected_da"]) == 0
        assert D(s["ceiling_da"]) == 5_000_000
        assert D(s["percent_of_ceiling"]) == 0
        assert D(s["remaining_da"]) == 5_000_000
        assert D(s["ifu_rate_percent"]) == D("0.50")
        assert D(s["ifu_minimum_da"]) == 10_000
        assert D(s["ifu_estimate_da"]) == 10_000          # minimum applies even at 0
        assert D(s["casnos_flat_da"]) == 24_000
        assert D(s["total_estimate_da"]) == 34_000
        assert s["ceiling_level"] == "ok" and s["over_ceiling"] is False
        assert s["missing_rules"] == []
        assert s["invoice_counts"] == {"draft": 0, "issued": 0, "paid": 0, "cancelled": 0}
        assert D(s["pending_da"]) == 0

    def test_collected_is_paid_invoices_plus_manual_income(self, make_user):
        u = make_user()
        u.sql_paid_invoice(2_000_000, date(2026, 3, 10))
        u.sql_income(500_000, date(2026, 1, 5))
        s = u.get("/dashboard/summary?year=2026").json()
        assert D(s["collected_da"]) == 2_500_000
        assert D(s["percent_of_ceiling"]) == D("50.0")
        assert D(s["remaining_da"]) == 2_500_000
        assert D(s["ifu_estimate_da"]) == 12_500            # 0.5 %
        assert D(s["total_estimate_da"]) == 36_500

    def test_year_is_the_payment_year_not_the_issue_year(self, make_user):
        u = make_user()
        # issued Dec 2025, paid Jan 2026 -> counts in 2026 only
        u.sql_paid_invoice(1_000_000, paid_at=date(2026, 1, 5), issue_date=date(2025, 12, 20))
        assert D(u.get("/dashboard/summary?year=2026").json()["collected_da"]) == 1_000_000
        assert D(u.get("/dashboard/summary?year=2025").json()["collected_da"]) == 0

    def test_only_paid_counts(self, make_user, db):
        u = make_user()
        u.sql_issued_invoice(700_000, date(2026, 5, 1))
        cid = u.sql_client()
        db.execute("insert into invoices (freelancer_id, client_id, total) values (%s,%s,900000)", (u.fid, cid))
        s = u.get("/dashboard/summary?year=2026").json()
        assert D(s["collected_da"]) == 0
        assert D(s["pending_da"]) == 700_000
        assert s["invoice_counts"]["issued"] == 1 and s["invoice_counts"]["draft"] == 1

    @pytest.mark.parametrize("amount,level,over", [
        (3_999_999, "ok", False),
        (4_000_000, "warning", False),     # 80 %
        (4_749_999, "warning", False),
        (4_750_000, "high", False),        # 95 %
        (5_000_000, "high", False),        # equal to the ceiling is not "over"
        (5_000_001, "exceeded", True),
    ])
    def test_ceiling_levels(self, make_user, amount, level, over):
        u = make_user()
        u.sql_paid_invoice(amount, date(2026, 6, 1))
        s = u.get("/dashboard/summary?year=2026").json()
        assert s["ceiling_level"] == level
        assert s["over_ceiling"] is over
        if over:
            assert D(s["remaining_da"]) == 0

    def test_rounding_half_up(self, make_user):
        u = make_user()
        u.sql_paid_invoice(D("3333333.33"), date(2026, 6, 1))     # 16666.6665 -> 16666.67
        s = u.get("/dashboard/summary?year=2026").json()
        assert D(s["ifu_estimate_da"]) == D("16666.67")

    def test_rate_above_minimum_is_not_clamped(self, make_user):
        u = make_user()
        u.sql_paid_invoice(4_000_000, date(2026, 6, 1))
        assert D(u.get("/dashboard/summary?year=2026").json()["ifu_estimate_da"]) == 20_000

    def test_rules_are_applied_as_of_the_year(self, make_user):
        """IFU_MIN only exists from 2025-01-01: 2024 has no minimum."""
        u = make_user()
        u.sql_paid_invoice(100_000, date(2024, 6, 1))
        s = u.get("/dashboard/summary?year=2024").json()
        assert s["missing_rules"] == ["IFU_MIN"]
        assert D(s["ifu_estimate_da"]) == 500                    # no minimum clamp
        assert s["ifu_minimum_da"] is None

    def test_year_without_any_rule_does_not_crash(self, make_user):
        u = make_user()
        r = u.get("/dashboard/summary?year=2022")
        assert r.status_code == 200, r.text
        s = r.json()
        assert s["ceiling_da"] is None and s["ceiling_level"] is None
        assert s["ifu_estimate_da"] is None and s["total_estimate_da"] is None
        assert s["over_ceiling"] is False
        assert set(s["missing_rules"]) == {"CEILING", "IFU_RATE", "IFU_MIN", "CASNOS_FLAT"}

    def test_year_validation(self, make_user):
        u = make_user()
        assert u.get("/dashboard/summary?year=2019").status_code == 422
        assert u.get("/dashboard/summary?year=2101").status_code == 422
        assert u.get("/dashboard/summary?year=abc").status_code == 422

    def test_default_year_is_current(self, make_user):
        assert make_user().get("/dashboard/summary").json()["year"] == 2026

    def test_future_year_does_not_crash(self, make_user):
        r = make_user().get("/dashboard/summary?year=2030")
        assert r.status_code == 200 and D(r.json()["ceiling_da"]) == 5_000_000

    def test_tenant_isolation(self, make_user):
        a, b = make_user(), make_user()
        a.sql_paid_invoice(2_000_000, date(2026, 3, 1))
        assert D(b.get("/dashboard/summary?year=2026").json()["collected_da"]) == 0
        assert D(a.get("/dashboard/summary?year=2026").json()["collected_da"]) == 2_000_000

    def test_json_money_is_a_string(self, make_user):
        """Frontend contract: Decimals are serialised as strings."""
        s = make_user().get("/dashboard/summary?year=2026").json()
        assert isinstance(s["collected_da"], str) and isinstance(s["ceiling_da"], str)
        assert isinstance(s["over_ceiling"], bool)


# ---------------------------------------------------------------- calendar
def _by_code(items):
    return {i["code"]: i for i in items}


class TestCalendar:
    def test_2026_full_profile(self, make_user):
        u = make_user()
        c = u.get("/compliance/calendar?year=2026").json()
        codes = [i["code"] for i in c["items"]]
        # instalments are hidden; NIF / CASNOS affiliation fell in 2025
        assert codes == ["G12_BIS", "IFU_MINIMUM", "G12", "CASNOS_PAYMENT"] or \
            sorted(codes) == sorted(["G12_BIS", "IFU_MINIMUM", "G12", "CASNOS_PAYMENT"]), codes
        assert c["total"] == 4 and c["year"] == 2026
        by = _by_code(c["items"])
        assert by["G12_BIS"]["period_year"] == 2025 and by["G12_BIS"]["end_date"] == "2026-01-20"
        assert by["G12"]["start_date"] == "2026-05-01" and by["G12"]["end_date"] == "2026-06-30"
        assert by["IFU_MINIMUM"]["start_date"] == "2026-01-01"
        assert by["CASNOS_PAYMENT"]["end_date"] == "2026-06-30"
        assert all(i["status"] == "overdue" for i in c["items"])      # today is 28 Oct
        assert by["G12"]["days_left"] == (date(2026, 6, 30) - FROZEN_TODAY).days   # negative
        assert [i["end_date"] for i in c["items"]] == sorted(i["end_date"] for i in c["items"])

    def test_2025_has_relative_deadlines(self, make_user):
        u = make_user()
        by = _by_code(u.get("/compliance/calendar?year=2025").json()["items"])
        assert by["NIF_DECLARATION"]["end_date"] == "2025-03-31"        # card + 30 d
        assert by["CASNOS_AFFILIATION"]["end_date"] == "2025-03-11"     # activity start + 10 d
        assert "G12_BIS" not in by            # Jan 2025 is before activity start

    def test_amounts_attached(self, make_user):
        u = make_user()
        u.sql_paid_invoice(4_000_000, date(2026, 2, 1))     # 2026 turnover
        u.sql_paid_invoice(2_000_000, date(2025, 8, 1))     # 2025 turnover
        by = _by_code(u.get("/compliance/calendar?year=2026").json()["items"])
        assert D(by["G12"]["amount_da"]) == 20_000                     # period 2026
        assert D(by["G12_BIS"]["amount_da"]) == 10_000                 # period 2025: 0.5 % = 10 000
        assert D(by["CASNOS_PAYMENT"]["amount_da"]) == 24_000
        assert by["IFU_MINIMUM"]["amount_da"] is None

    def test_activity_started_after_30_june_has_no_g12(self, make_user):
        p = {"first_name": "A", "last_name": "B", "anae_card_issue_date": "2026-08-01",
             "activity_start_date": "2026-08-01"}
        u = make_user(p)
        codes = {i["code"] for i in u.get("/compliance/calendar?year=2026").json()["items"]}
        assert "G12" not in codes and "IFU_MINIMUM" not in codes
        assert "CASNOS_PAYMENT" not in codes            # 30 June before the start
        assert {"NIF_DECLARATION", "CASNOS_AFFILIATION"} <= codes
        codes27 = {i["code"] for i in u.get("/compliance/calendar?year=2027").json()["items"]}
        assert "G12_BIS" in codes27                     # period 2026 final return

    def test_minimal_profile_without_dates(self, make_user):
        u = make_user({"first_name": "A", "last_name": "B"})
        r = u.get("/compliance/calendar?year=2026")
        assert r.status_code == 200
        codes = {i["code"] for i in r.json()["items"]}
        assert codes == {"G12_BIS", "IFU_MINIMUM", "G12", "CASNOS_PAYMENT"}   # relative ones skipped

    def test_status_transitions(self, make_user, monkeypatch):
        import app.services.compliance as comp
        u = make_user()
        for today, expect in [(date(2026, 4, 30), "upcoming"), (date(2026, 5, 1), "open"),
                              (date(2026, 6, 30), "open"), (date(2026, 7, 1), "overdue")]:
            monkeypatch.setattr(comp, "today_dz", lambda t=today: t)
            g12 = _by_code(u.get("/compliance/calendar?year=2026").json()["items"])["G12"]
            assert g12["status"] == expect, (today, g12)
        assert g12["days_left"] == -1

    def test_year_bounds(self, make_user):
        u = make_user()
        assert u.get("/compliance/calendar?year=2019").status_code == 422
        assert u.get("/compliance/calendar?year=2101").status_code == 422


# ---------------------------------------------------------------- completion
class TestCompletion:
    def test_complete_and_undo(self, make_user):
        u = make_user()
        assert u.post("/obligations/G12/complete?period_year=2026").status_code == 204
        assert u.post("/obligations/G12/complete?period_year=2026").status_code == 204   # idempotent
        g12 = _by_code(u.get("/compliance/calendar?year=2026").json()["items"])["G12"]
        assert g12["status"] == "done" and g12["days_left"] is None
        assert u.delete("/obligations/G12/complete?period_year=2026").status_code == 204
        g12 = _by_code(u.get("/compliance/calendar?year=2026").json()["items"])["G12"]
        assert g12["status"] == "overdue"

    def test_undo_when_never_completed_is_204(self, make_user):
        assert make_user().delete("/obligations/G12/complete?period_year=2026").status_code == 204

    def test_unknown_code(self, make_user):
        u = make_user()
        assert u.post("/obligations/NOPE/complete?period_year=2026").status_code == 404
        assert u.delete("/obligations/NOPE/complete?period_year=2026").status_code == 404

    def test_period_year_required_and_bounded(self, make_user):
        u = make_user()
        assert u.post("/obligations/G12/complete").status_code == 422
        assert u.post("/obligations/G12/complete?period_year=1999").status_code == 422

    def test_completion_is_per_user(self, make_user):
        a, b = make_user(), make_user()
        a.post("/obligations/G12/complete?period_year=2026")
        g12 = _by_code(b.get("/compliance/calendar?year=2026").json()["items"])["G12"]
        assert g12["status"] == "overdue"

    def test_completing_the_period_year_not_the_calendar_year(self, make_user):
        """G12_BIS shown in the 2026 calendar belongs to period 2025."""
        u = make_user()
        u.post("/obligations/G12_BIS/complete?period_year=2026")      # wrong period
        by = _by_code(u.get("/compliance/calendar?year=2026").json()["items"])
        assert by["G12_BIS"]["status"] == "overdue"
        u.post("/obligations/G12_BIS/complete?period_year=2025")
        by = _by_code(u.get("/compliance/calendar?year=2026").json()["items"])
        assert by["G12_BIS"]["status"] == "done"


# ---------------------------------------------------------------- alerts
class TestAlerts:
    def test_overdue_alerts_for_full_profile(self, make_user):
        u = make_user()
        r = u.get("/compliance/alerts")
        assert r.status_code == 200, r.text
        a = r.json()
        assert a["total"] == len(a["items"]) == 4
        assert {x["code"] for x in a["items"]} == {"G12_BIS", "IFU_MINIMUM", "G12", "CASNOS_PAYMENT"}
        assert all(x["severity"] == "overdue" and x["days_left"] < 0 for x in a["items"])
        assert [x["due_date"] for x in a["items"]] == sorted(x["due_date"] for x in a["items"])
        assert all(x["kind"] == "deadline" for x in a["items"])
        assert all(x["verified"] is False for x in a["items"])

    def test_done_items_disappear(self, make_user):
        u = make_user()
        u.post("/obligations/G12/complete?period_year=2026")
        u.post("/obligations/CASNOS_PAYMENT/complete?period_year=2026")
        codes = {x["code"] for x in u.get("/compliance/alerts").json()["items"]}
        assert codes == {"G12_BIS", "IFU_MINIMUM"}

    @pytest.mark.parametrize("on,sev,days", [
        ("2026-12-21", "info", 30),        # exactly 30 days -> included
        ("2026-12-20", None, None),        # 31 days -> not yet
        ("2027-01-13", "warning", 7),
        ("2027-01-14", "warning", 6),
        ("2027-01-20", "warning", 0),      # due today
        ("2027-01-21", "overdue", -1),
    ])
    def test_reminder_window_and_severity(self, make_user, on, sev, days):
        u = make_user()
        for code, y in [("G12_BIS", 2025), ("G12", 2026), ("IFU_MINIMUM", 2026), ("CASNOS_PAYMENT", 2026)]:
            u.post(f"/obligations/{code}/complete?period_year={y}")
        items = u.get(f"/compliance/alerts?on={on}").json()["items"]
        bis = [x for x in items if x["code"] == "G12_BIS" and x["period_year"] == 2026]
        if sev is None:
            assert bis == []
        else:
            assert len(bis) == 1 and bis[0]["severity"] == sev and bis[0]["days_left"] == days

    def test_january_deadline_visible_in_december(self, make_user):
        u = make_user()
        ids = {x["id"] for x in u.get("/compliance/alerts?on=2026-12-25").json()["items"]}
        assert "G12_BIS-2026" in ids

    def test_cap_alert_warning_comes_first(self, make_user):
        u = make_user()
        u.sql_paid_invoice(4_000_000, date(2026, 2, 1))
        items = u.get("/compliance/alerts").json()["items"]
        first = items[0]
        assert first["kind"] == "ceiling" and first["code"] == "CEILING"
        assert first["severity"] == "warning" and D(first["amount_da"]) == 1_000_000
        assert first["due_date"] is None and first["days_left"] is None

    def test_cap_alert_high_is_critical(self, make_user):
        u = make_user()
        u.sql_paid_invoice(4_800_000, date(2026, 2, 1))
        first = u.get("/compliance/alerts").json()["items"][0]
        assert first["severity"] == "critical" and "Almost Reached" in first["title"]

    def test_cap_alert_exceeded_first_year(self, make_user):
        u = make_user()
        u.sql_paid_invoice(5_100_000, date(2026, 2, 1))
        first = u.get("/compliance/alerts").json()["items"][0]
        assert first["severity"] == "critical" and "Exceeded" in first["title"]
        assert D(first["amount_da"]) == 100_000
        assert "year 1 above" in first["message"]

    def test_cap_alert_three_strikes(self, make_user):
        u = make_user()
        for y in (2024, 2025, 2026):
            u.sql_paid_invoice(6_000_000, date(y, 2, 1))
        first = u.get("/compliance/alerts").json()["items"][0]
        assert "3 consecutive years" in first["message"] and "commercial register" in first["message"]

    def test_no_cap_alert_when_comfortable(self, make_user):
        u = make_user()
        u.sql_paid_invoice(1_000_000, date(2026, 2, 1))
        assert all(x["kind"] == "deadline" for x in u.get("/compliance/alerts").json()["items"])

    @pytest.mark.xfail(strict=True, reason='no activity_start_date: past fixed deadlines are all reported overdue')
    def test_minimal_profile_gets_overdue_alerts_for_dates_it_never_had(self, make_user):
        """Profile without activity_start_date: every past fixed deadline looks overdue."""
        u = make_user({"first_name": "A", "last_name": "B"})
        codes = {x["code"] for x in u.get("/compliance/alerts").json()["items"]}
        assert codes == set(), f"new user without dates is told these are overdue: {codes}"