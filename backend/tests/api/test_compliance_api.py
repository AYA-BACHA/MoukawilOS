"""Route tests for api/compliance.py.

The database is replaced by in-memory fakes, today's date is frozen, and the
login is overridden, so these tests need no database and no Supabase token.
"""
from datetime import date
from decimal import Decimal as D
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import compliance as compliance_api
from app.core.security import get_current_freelancer_id
from app.repositories import compliance as repo
from app.services import compliance as svc

SARA = date(2025, 10, 15)
KNOWN_CODES = {"G12", "G12_BIS", "IFU_MINIMUM", "CASNOS_PAYMENT",
               "CASNOS_AFFILIATION", "NIF_DECLARATION"}


@pytest.fixture
def api(monkeypatch, rules, defs, today):
    state = SimpleNamespace(
        rules=rules,
        turnover={2026: D("825500.00")},          # paid invoices + manual income, by year
        done=set(),
        card=SARA, start=SARA,
        counts={"draft": 6, "issued": 3, "paid": 4, "cancelled": 2},
        pending=D("224000.00"),
        completed=[], uncompleted=[],
    )

    app = FastAPI()
    app.include_router(compliance_api.router)
    app.dependency_overrides[get_current_freelancer_id] = lambda: 1

    monkeypatch.setattr(svc, "today_dz", lambda: today)
    monkeypatch.setattr(repo, "get_rules",
                        lambda codes, on: {c: state.rules[c] for c in codes if c in state.rules})
    monkeypatch.setattr(repo, "paid_turnover", lambda fid, year: state.turnover.get(year, D("0")))
    monkeypatch.setattr(repo, "get_dates", lambda fid: (state.card, state.start))
    monkeypatch.setattr(repo, "obligation_defs", lambda on: defs)
    monkeypatch.setattr(repo, "completions", lambda fid: set(state.done))
    monkeypatch.setattr(repo, "invoice_stats", lambda fid, year: (dict(state.counts), state.pending))

    def complete(fid, code, year):
        state.completed.append((code, year))
        return code in KNOWN_CODES

    def uncomplete(fid, code, year):
        state.uncompleted.append((code, year))
        return code in KNOWN_CODES

    monkeypatch.setattr(repo, "complete", complete)
    monkeypatch.setattr(repo, "uncomplete", uncomplete)
    return SimpleNamespace(client=TestClient(app), state=state)


def ids(response):
    return {a["id"]: a for a in response.json()["items"]}


def codes(response):
    return {i["code"]: i for i in response.json()["items"]}


# ----------------------------------------------------------------- login
def test_every_route_requires_login():
    app = FastAPI()
    app.include_router(compliance_api.router)          # no dependency override
    c = TestClient(app)
    for path in ("/compliance/calendar", "/compliance/alerts", "/dashboard/summary"):
        assert c.get(path).status_code in (401, 403)
    assert c.post("/obligations/G12/complete?period_year=2026").status_code in (401, 403)
    assert c.delete("/obligations/G12/complete?period_year=2026").status_code in (401, 403)


# -------------------------------------------------------------- calendar
class TestCalendar:
    def test_sara_2026(self, api):
        r = api.client.get("/compliance/calendar?year=2026")
        assert r.status_code == 200
        body = r.json()
        assert body["year"] == 2026 and body["total"] == 4
        assert set(codes(r)) == {"G12_BIS", "CASNOS_PAYMENT", "IFU_MINIMUM", "G12"}
        assert not any(c.startswith("IFU_INSTALLMENT") for c in codes(r))

    def test_year_defaults_to_the_current_year(self, api):
        assert api.client.get("/compliance/calendar").json()["year"] == 2026

    def test_amounts_use_the_figures_of_each_period_year(self, api):
        api.state.turnover = {2025: D("0"), 2026: D("4326500.00")}
        c = codes(api.client.get("/compliance/calendar?year=2026"))
        assert c["G12"]["amount_da"] == "21632.50"            # 2026 turnover
        assert c["G12_BIS"]["amount_da"] == "10000.00"        # regularises 2025: minimum
        assert c["CASNOS_PAYMENT"]["amount_da"] == "24000.00"
        assert c["IFU_MINIMUM"]["amount_da"] is None

    def test_amounts_follow_the_rules_in_the_database(self, api):
        api.state.rules["CASNOS_FLAT"]["value"] = D("30000")
        c = codes(api.client.get("/compliance/calendar?year=2026"))
        assert c["CASNOS_PAYMENT"]["amount_da"] == "30000.00"

    def test_done_obligations_are_flagged(self, api):
        api.state.done = {("G12", 2026)}
        c = codes(api.client.get("/compliance/calendar?year=2026"))
        assert c["G12"]["status"] == "done" and c["G12"]["days_left"] is None
        assert c["IFU_MINIMUM"]["status"] == "overdue"

    def test_2025_has_the_start_up_deadlines(self, api):
        c = codes(api.client.get("/compliance/calendar?year=2025"))
        assert set(c) == {"CASNOS_AFFILIATION", "NIF_DECLARATION"}
        assert c["NIF_DECLARATION"]["verified"] is True

    @pytest.mark.parametrize("year", ["1999", "2101", "abc"])
    def test_invalid_year(self, api, year):
        assert api.client.get(f"/compliance/calendar?year={year}").status_code == 422


# ---------------------------------------------------------------- alerts
class TestAlerts:
    def test_today_four_overdue_alerts_and_no_ceiling_alert(self, api):
        r = api.client.get("/compliance/alerts")
        assert r.status_code == 200
        a = ids(r)
        assert set(a) == {"G12_BIS-2025", "IFU_MINIMUM-2026", "G12-2026", "CASNOS_PAYMENT-2026"}
        assert all(x["severity"] == "overdue" for x in a.values())
        assert all(x["kind"] == "deadline" for x in a.values())

    def test_alert_amounts(self, api):
        api.state.turnover = {2025: D("0"), 2026: D("4326500.00")}
        a = ids(api.client.get("/compliance/alerts"))
        assert a["G12-2026"]["amount_da"] == "21632.50"
        assert a["G12_BIS-2025"]["amount_da"] == "10000.00"
        assert a["CASNOS_PAYMENT-2026"]["amount_da"] == "24000.00"

    def test_g12_bis_alert_in_december(self, api):
        a = ids(api.client.get("/compliance/alerts?on=2026-12-25"))["G12_BIS-2026"]
        assert a["title"] == "Statutory G12 bis Declaration Due"
        assert a["message"] == "Annual IFU regularisation deadline is January 20, 2027."
        assert a["severity"] == "info" and a["days_left"] == 26
        assert a["due_date"] == "2027-01-20"

    def test_g12_bis_alert_a_week_before_on_the_day_and_after(self, api):
        for day, severity, left in [("2027-01-13", "warning", 7),
                                    ("2027-01-20", "warning", 0),
                                    ("2027-01-21", "overdue", -1)]:
            a = ids(api.client.get(f"/compliance/alerts?on={day}"))["G12_BIS-2026"]
            assert (a["severity"], a["days_left"]) == (severity, left)

    def test_alert_amount_in_january_uses_last_year_turnover(self, api):
        api.state.turnover = {2026: D("4326500.00"), 2027: D("0")}
        a = ids(api.client.get("/compliance/alerts?on=2027-01-13"))["G12_BIS-2026"]
        assert a["amount_da"] == "21632.50"

    def test_marking_done_removes_the_alert_and_undoing_brings_it_back(self, api):
        assert "G12_BIS-2026" in ids(api.client.get("/compliance/alerts?on=2026-12-25"))
        api.state.done = {("G12_BIS", 2026)}
        assert "G12_BIS-2026" not in ids(api.client.get("/compliance/alerts?on=2026-12-25"))
        api.state.done = set()
        assert "G12_BIS-2026" in ids(api.client.get("/compliance/alerts?on=2026-12-25"))

    def test_casnos_alert_before_30_june(self, api):
        a = ids(api.client.get("/compliance/alerts?on=2027-05-31"))["CASNOS_PAYMENT-2027"]
        assert a["message"] == "Annual CASNOS contribution deadline is June 30, 2027."
        assert a["days_left"] == 30 and a["severity"] == "info"
        assert a["amount_da"] == "24000.00"

    def test_reminder_window_comes_from_the_rules(self, api):
        api.state.rules["REMINDER_DAYS"]["value"] = D("10")
        assert "G12_BIS-2026" not in ids(api.client.get("/compliance/alerts?on=2026-12-25"))   # 26 days
        api.state.rules["REMINDER_DAYS"]["value"] = D("30")
        assert "G12_BIS-2026" in ids(api.client.get("/compliance/alerts?on=2026-12-25"))

    def test_reminder_window_defaults_to_30_days_without_the_rule(self, api):
        del api.state.rules["REMINDER_DAYS"]
        assert "G12_BIS-2026" in ids(api.client.get("/compliance/alerts?on=2026-12-25"))

    def test_invalid_date(self, api):
        assert api.client.get("/compliance/alerts?on=not-a-date").status_code == 422


class TestCeilingAlert:
    def test_warning_comes_first(self, api):
        api.state.turnover = {2026: D("4326500.00")}
        r = api.client.get("/compliance/alerts")
        first = r.json()["items"][0]
        assert first["kind"] == "ceiling"
        assert first["severity"] == "warning"
        assert first["title"] == "Approaching Annual Turnover Ceiling"
        assert first["amount_da"] == "673500.00"
        assert first["due_date"] is None
        assert r.json()["total"] == 5            # ceiling + 4 deadlines

    def test_critical_near_the_ceiling(self, api):
        api.state.turnover = {2026: D("4825500.00")}
        first = api.client.get("/compliance/alerts").json()["items"][0]
        assert first["severity"] == "critical"
        assert first["title"] == "Annual Turnover Ceiling Almost Reached"

    def test_exceeded_first_year(self, api):
        api.state.turnover = {2026: D("5125500.00")}
        first = api.client.get("/compliance/alerts").json()["items"][0]
        assert first["title"] == "Annual Turnover Ceiling Exceeded"
        assert first["amount_da"] == "125500.00"
        assert "year 1 above the ceiling" in first["message"]

    def test_exceeded_second_year(self, api):
        api.state.turnover = {2025: D("5100000.00"), 2026: D("5125500.00")}
        first = api.client.get("/compliance/alerts").json()["items"][0]
        assert "year 2 above the ceiling" in first["message"]

    def test_three_consecutive_years_require_registration(self, api):
        api.state.turnover = {2024: D("5100000.00"), 2025: D("5100000.00"), 2026: D("5125500.00")}
        first = api.client.get("/compliance/alerts").json()["items"][0]
        assert "3 consecutive years above the ceiling" in first["message"]
        assert "commercial register" in first["message"]

    def test_a_gap_year_resets_the_count(self, api):
        api.state.turnover = {2024: D("5100000.00"), 2025: D("100.00"), 2026: D("5125500.00")}
        first = api.client.get("/compliance/alerts").json()["items"][0]
        assert "year 1 above the ceiling" in first["message"]

    def test_thresholds_come_from_the_rules(self, api):
        api.state.turnover = {2026: D("3000000.00")}          # 60%
        assert api.client.get("/compliance/alerts").json()["items"][0]["kind"] == "deadline"
        api.state.rules["WARN_LEVEL_1"]["value"] = D("0.5")
        assert api.client.get("/compliance/alerts").json()["items"][0]["kind"] == "ceiling"

    def test_no_ceiling_rule_no_ceiling_alert(self, api):
        del api.state.rules["CEILING"]
        api.state.turnover = {2026: D("9000000.00")}
        assert all(a["kind"] == "deadline" for a in api.client.get("/compliance/alerts").json()["items"])


# --------------------------------------------------------------- summary
class TestSummary:
    def test_dashboard_figures(self, api):
        api.state.turnover = {2026: D("4326500.00")}
        r = api.client.get("/dashboard/summary?year=2026")
        assert r.status_code == 200
        s = r.json()
        assert s["year"] == 2026
        assert s["collected_da"] == "4326500.00"
        assert s["ceiling_da"] == "5000000.00"
        assert s["percent_of_ceiling"] == "86.5"
        assert s["remaining_da"] == "673500.00"
        assert s["over_ceiling"] is False
        assert s["ceiling_level"] == "warning"
        assert s["ifu_estimate_da"] == "21632.50"
        assert s["casnos_flat_da"] == "24000.00"
        assert s["total_estimate_da"] == "45632.50"
        assert s["ifu_rate_percent"] == "0.50"
        assert s["ifu_minimum_da"] == "10000.00"
        assert s["missing_rules"] == []
        assert s["pending_da"] == "224000.00"
        assert s["invoice_counts"] == {"draft": 6, "issued": 3, "paid": 4, "cancelled": 2}

    def test_sources_only_list_the_legal_rules(self, api):
        s = api.client.get("/dashboard/summary").json()
        assert set(s["sources"]) == {"CEILING", "IFU_RATE", "IFU_MIN", "CASNOS_FLAT"}

    def test_year_defaults_to_the_current_year(self, api):
        assert api.client.get("/dashboard/summary").json()["year"] == 2026

    def test_another_year_uses_that_years_turnover(self, api):
        api.state.turnover = {2025: D("100000.00"), 2026: D("825500.00")}
        s = api.client.get("/dashboard/summary?year=2025").json()
        assert s["collected_da"] == "100000.00"
        assert s["ifu_estimate_da"] == "10000.00"

    def test_missing_rules_are_reported(self, api):
        del api.state.rules["IFU_RATE"]
        s = api.client.get("/dashboard/summary").json()
        assert s["ifu_estimate_da"] is None
        assert s["total_estimate_da"] is None
        assert s["missing_rules"] == ["IFU_RATE"]

    @pytest.mark.parametrize("year", ["1999", "2101", "abc"])
    def test_invalid_year(self, api, year):
        assert api.client.get(f"/dashboard/summary?year={year}").status_code == 422


# ----------------------------------------------------------- mark as done
class TestComplete:
    def test_mark_done(self, api):
        r = api.client.post("/obligations/G12_BIS/complete?period_year=2026")
        assert r.status_code == 204 and r.content == b""
        assert api.state.completed == [("G12_BIS", 2026)]

    def test_undo(self, api):
        r = api.client.delete("/obligations/G12_BIS/complete?period_year=2026")
        assert r.status_code == 204
        assert api.state.uncompleted == [("G12_BIS", 2026)]

    def test_unknown_code(self, api):
        assert api.client.post("/obligations/abc/complete?period_year=2026").status_code == 404
        assert api.client.delete("/obligations/abc/complete?period_year=2026").status_code == 404

    def test_period_year_is_required_and_bounded(self, api):
        assert api.client.post("/obligations/G12/complete").status_code == 422
        assert api.client.post("/obligations/G12/complete?period_year=1999").status_code == 422
        assert api.client.delete("/obligations/G12/complete?period_year=2101").status_code == 422
        assert api.state.completed == []