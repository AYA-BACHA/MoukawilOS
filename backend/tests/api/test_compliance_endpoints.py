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
