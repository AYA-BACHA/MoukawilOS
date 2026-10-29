"""
Integration Test Suite for Compliance, Analytics, and Credit Note Endpoints
Tests:
- GET /api/analytics/turnover & GET /analytics/turnover
- GET /api/compliance/calendar & GET /compliance/calendar
- POST /api/compliance/simulate & POST /compliance/simulate
- POST /api/invoices/{id}/credit-note
"""

from datetime import date
from decimal import Decimal
import pytest

from app.core.security import get_current_freelancer_id
from app.main import app
from app.repositories import compliance as repo
from app.services import compliance as svc


def test_turnover_analytics_endpoint(client, complete, cid):
    """
    Test GET /api/analytics/turnover:
    Creates and pays an invoice, then verifies calculation metrics in API response.
    """
    today_str = date.today().isoformat()
    # Create, issue, and pay an invoice of 200,000 DZD
    inv_res = client.post("/invoices", json={
        "client_id": cid,
        "items": [{"description": "Audit prestation", "quantity": 1, "unit_price": 200000.00}]
    })
    assert inv_res.status_code == 201
    inv_id = inv_res.json()["id"]

    issue_res = client.post(f"/invoices/{inv_id}/issue")
    assert issue_res.status_code == 200

    pay_res = client.post(f"/invoices/{inv_id}/pay", json={"paid_at": today_str})
    assert pay_res.status_code == 200

    # Test with /api prefix
    res = client.get("/api/analytics/turnover?year=2026")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True

    data = body["data"]
    assert data["fiscal_year"] == 2026
    assert data["currency"] == "DZD"
    assert Decimal(str(data["statutory_ceiling"])) == Decimal("5000000.00")
    assert Decimal(str(data["collected_turnover"])) == Decimal("200000.00")
    assert Decimal(str(data["net_turnover"])) == Decimal("200000.00")
    assert Decimal(str(data["ceiling_percentage"])) == Decimal("4.00")
    assert data["is_near_ceiling"] is False
    assert data["is_ceiling_exceeded"] is False

    # Test route without /api prefix
    res_root = client.get("/analytics/turnover?year=2026")
    assert res_root.status_code == 200
    assert Decimal(str(res_root.json()["data"]["collected_turnover"])) == Decimal("200000.00")


def test_compliance_calendar_endpoint(client, complete):
    """
    Test GET /api/compliance/calendar and check statutory obligations list.
    """
    res = client.get("/api/compliance/calendar?year=2026")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True

    obligations = body["data"]
    assert len(obligations) >= 3

    codes = [ob["code"] for ob in obligations]
    assert "G12_PROVISIONAL" in codes or "G12" in codes
    assert "CASNOS_ANNUAL" in codes or "CASNOS_PAYMENT" in codes
    assert "G12_BIS_REGULARISATION" in codes or "G12_BIS" in codes

    for ob in obligations:
        assert ob["due_date"] is not None
        assert ob["legal_reference"] is not None
        assert ob["status"] in ("upcoming", "pending", "due_soon", "completed", "overdue")


def test_compliance_tax_simulator_endpoint(client):
    """
    Test POST /api/compliance/simulate against the documented example in docs/api.md.
    Input: 4,500,000 DZD, regime forfait.
    Expected: IFU 22,500 DZD, CASNOS 24,000 DZD, Total 46,500 DZD, Net 4,453,500 DZD.
    """
    payload = {
        "annual_turnover": 4500000.00,
        "casnos_regime": "forfait",
    }
    res = client.post("/api/compliance/simulate", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True

    data = body["data"]
    assert Decimal(str(data["annual_turnover"])) == Decimal("4500000.00")
    assert Decimal(str(data["ifu"]["final_tax"])) == Decimal("22500.00")
    assert Decimal(str(data["ifu"]["statutory_floor"])) == Decimal("10000.00")
    assert Decimal(str(data["casnos"]["annual_contribution"])) == Decimal("24000.00")
    assert Decimal(str(data["total_statutory_charges"])) == Decimal("46500.00")
    assert Decimal(str(data["net_income_after_charges"])) == Decimal("4453500.00")
    assert Decimal(str(data["effective_charge_rate_pct"])) == Decimal("1.03")

    ceiling = data["ceiling_status"]
    assert Decimal(str(ceiling["percentage"])) == Decimal("90.00")
    assert ceiling["is_exceeded"] is False
    assert ceiling["warning"] is not None


def test_issue_credit_note_lifecycle(client, complete, cid):
    """
    Test POST /api/invoices/{id}/credit-note:
    1. Create, issue, and pay an invoice.
    2. Successfully create a credit note (201 Created).
    3. Assert formatting AV-YYYY-NNN and linkage to invoice.
    4. Assert rejection (409) if credit amount exceeds balance.
    5. Assert net turnover deduction in /api/analytics/turnover.
    """
    today_str = date.today().isoformat()
    # 1. Create and issue invoice of 100,000 DZD
    inv_res = client.post("/invoices", json={
        "client_id": cid,
        "items": [{"description": "Service consulting", "quantity": 1, "unit_price": 100000.00}]
    })
    inv_id = inv_res.json()["id"]
    issue_res = client.post(f"/invoices/{inv_id}/issue")
    assert issue_res.status_code == 200
    pay_res = client.post(f"/invoices/{inv_id}/pay", json={"paid_at": today_str})
    assert pay_res.status_code == 200

    # 2. Issue valid credit note (30,000 DZD)
    cn_payload = {
        "reason": "Remise commerciale exceptionnelle accordée pour réconciliation comptable",
        "credit_amount": 30000.00,
    }
    cn_res = client.post(f"/api/invoices/{inv_id}/credit-note", json=cn_payload)
    assert cn_res.status_code == 201
    cn_body = cn_res.json()
    assert cn_body["success"] is True

    cn_data = cn_body["data"]
    assert cn_data["credit_note_number"].startswith("AV-2026-")
    assert str(cn_data["original_invoice_id"]) == str(inv_id)
    assert Decimal(str(cn_data["amount"])) == Decimal("30000.00")

    # 3. Reject credit note with amount exceeding remaining balance (100k - 30k = 70k left)
    excessive_payload = {
        "reason": "Montant invalide excessif",
        "credit_amount": 80000.00,
    }
    rej_res = client.post(f"/api/invoices/{inv_id}/credit-note", json=excessive_payload)
    assert rej_res.status_code == 409

    # 4. Verify turnover net deduction (100,000 - 30,000 = 70,000 DZD)
    turnover_res = client.get("/api/analytics/turnover?year=2026")
    assert turnover_res.status_code == 200
    t_data = turnover_res.json()["data"]
    assert Decimal(str(t_data["collected_turnover"])) == Decimal("100000.00")
    assert Decimal(str(t_data["total_credit_notes"])) == Decimal("30000.00")
    assert Decimal(str(t_data["net_turnover"])) == Decimal("70000.00")


def test_compliance_alerts_endpoint_and_timing(client, complete):
    """
    Test GET /compliance/alerts and /api/compliance/alerts:
    Verifies response schema, items list, and Server-Timing execution header.
    """
    res = client.get("/compliance/alerts")
    assert res.status_code == 200
    body = res.json()
    assert "items" in body
    assert "total" in body
    assert body["total"] == len(body["items"])
    assert "Server-Timing" in res.headers
    assert "compliance_alerts;dur=" in res.headers["Server-Timing"]

    # Verify route with /api prefix
    res_api = client.get("/api/compliance/alerts")
    assert res_api.status_code == 200
    assert res_api.json()["total"] == body["total"]


def test_compliance_alerts_tenant_isolation(client, complete):
    """
    Test tenant isolation across distinct freelancers:
    Verifies that requests for different freelancers return isolated datasets,
    and querying one freelancer does not leak or alter subsequent responses for another.
    """
    try:
        # Authenticated context 1: Freelancer A (fid=2001)
        app.dependency_overrides[get_current_freelancer_id] = lambda: 2001
        res_a1 = client.get("/compliance/alerts")
        assert res_a1.status_code == 200
        alerts_a1 = res_a1.json()["items"]

        # Authenticated context 2: Freelancer B (fid=837, distinct profile dates & alerts)
        app.dependency_overrides[get_current_freelancer_id] = lambda: 837
        res_b = client.get("/compliance/alerts")
        assert res_b.status_code == 200
        alerts_b = res_b.json()["items"]

        # Assert freelancers have distinct alert datasets
        assert [x["code"] for x in alerts_a1] != [x["code"] for x in alerts_b]

        # Query Freelancer A again: verify Freelancer B's data did not contaminate Freelancer A
        app.dependency_overrides[get_current_freelancer_id] = lambda: 2001
        res_a2 = client.get("/compliance/alerts")
        assert res_a2.status_code == 200
        assert res_a2.json()["items"] == alerts_a1
    finally:
        app.dependency_overrides.pop(get_current_freelancer_id, None)


def test_paid_turnover_by_years_parity_with_individual_queries():
    """
    Parity test for repo.paid_turnover_by_years vs repo.paid_turnover across:
    - Multiple years (2020 through 2028)
    - Zero-activity years (returns Decimal('0'))
    - Deduplication of input years
    - Empty input handling
    """
    years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028]
    for fid in [2001, 837]:
        single_results = {yr: repo.paid_turnover(fid, yr) for yr in years}
        batch_results = repo.paid_turnover_by_years(fid, years)
        assert batch_results == single_results

        # Zero/empty input
        assert repo.paid_turnover_by_years(fid, []) == {}

        # Duplicate inputs
        dup_results = repo.paid_turnover_by_years(fid, [2026, 2026, 2025, 2025])
        assert dup_results == {2025: single_results[2025], 2026: single_results[2026]}


def test_get_ceilings_by_years_parity_with_get_rules():
    """
    Parity test for repo.get_ceilings_by_years vs repo.get_rules(("CEILING",), date(yr, 12, 31)):
    - Historical years before enactment (2020..2022 -> None)
    - Statutory years (2023..2028 -> Decimal('5000000.000000'))
    - Empty and deduplicated inputs
    """
    years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028]
    expected_ceilings = {}
    for yr in years:
        r = repo.get_rules(("CEILING",), date(yr, 12, 31))
        expected_ceilings[yr] = r["CEILING"]["value"] if "CEILING" in r else None

    batch_ceilings = repo.get_ceilings_by_years(years)
    assert batch_ceilings == expected_ceilings
    assert repo.get_ceilings_by_years([]) == {}
    assert repo.get_ceilings_by_years([2026, 2026]) == {2026: expected_ceilings[2026]}


def test_compliance_alerts_parity_with_unoptimized_calculation(client, complete):
    """
    Explicit parity test comparing the optimized compliance alerts response against
    the baseline multi-query calculation path on identical live data.
    """
    def unoptimized_calculation(fid, today):
        card_date, start_date = repo.get_dates(fid)
        items = (
            svc.build_calendar(repo.obligation_defs(date(today.year, 1, 1)), repo.completions(fid), card_date, start_date, today.year, today)
            + svc.build_calendar(repo.obligation_defs(date(today.year + 1, 1, 1)), repo.completions(fid), card_date, start_date, today.year + 1, today)
        )
        rules = repo.get_rules(("REMINDER_DAYS",), today)
        reminder = int(rules["REMINDER_DAYS"]["value"]) if "REMINDER_DAYS" in rules else svc.DEFAULT_REMINDER_DAYS
        _, activity_start = repo.get_dates(fid)
        if activity_start is None:
            items = [i for i in items if i["status"] != "overdue"]
        years = {i["period_year"] for i in items if i["code"] in svc.AMOUNT_CODES}
        amounts = {}
        for y in sorted(years):
            r = repo.get_rules(svc.RULE_CODES, min(today, date(y, 12, 31)))
            s = svc.build_summary(y, repo.paid_turnover(fid, y), r)
            amounts[y] = {"G12": s["ifu_estimate_da"], "G12_BIS": s["ifu_estimate_da"], "CASNOS_PAYMENT": s["casnos_flat_da"]}
        alerts = svc.build_alerts(items, reminder, amounts)
        y = today.year
        cap_rules = repo.get_rules(svc.CAP_RULE_CODES, today)
        strikes = int(cap_rules["CEILING_STRIKES"]["value"]) if "CEILING_STRIKES" in cap_rules else 3
        turnover, ceilings = {}, {}
        for yr in range(y - strikes, y + 1):
            r = cap_rules if yr == y else repo.get_rules(("CEILING",), date(yr, 12, 31))
            turnover[yr] = repo.paid_turnover(fid, yr)
            ceilings[yr] = r["CEILING"]["value"] if "CEILING" in r else None
        n = svc.consecutive_years_over(turnover, ceilings, y, strikes)
        cap = svc.build_cap_alert(y, turnover[y], cap_rules, n)
        if cap:
            alerts.insert(0, cap)
        return {"items": alerts, "total": len(alerts)}

    for test_on in [None, "2026-06-15", "2026-12-25"]:
        query = f"?on={test_on}" if test_on else ""
        res = client.get(f"/compliance/alerts{query}")
        assert res.status_code == 200
        actual = res.json()

        today_date = date.fromisoformat(test_on) if test_on else svc.today_dz()
        with repo.pool.connection() as conn:
            from tests.api.conftest import TEST_USER_ID
            fid = conn.execute("select id from public.freelancers where profile_id = %s", (TEST_USER_ID,)).fetchone()[0]

        expected = unoptimized_calculation(fid, today_date)
        for item in expected["items"]:
            if item.get("due_date") is not None:
                item["due_date"] = str(item["due_date"])
            if item.get("amount_da") is not None:
                item["amount_da"] = str(item["amount_da"])

        assert actual["total"] == expected["total"]
        assert len(actual["items"]) == len(expected["items"])
        for act_item, exp_item in zip(actual["items"], expected["items"]):
            assert act_item["id"] == exp_item["id"]
            assert act_item["code"] == exp_item["code"]
            assert act_item["severity"] == exp_item["severity"]
            assert act_item["due_date"] == exp_item["due_date"]
            assert act_item["amount_da"] == exp_item["amount_da"]
