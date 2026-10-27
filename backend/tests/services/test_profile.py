from app.services.profile import completeness

FULL = {
    "first_name": "Sara", "last_name": "Test", "trade_address": "Alger",
    "nif": "123456789012345", "rib": "12345678901234567890",
    "anae_card_number": "26-123456", "anae_card_issue_date": "2026-03-10",
}


def test_empty_profile_cannot_issue():
    r = completeness({})
    assert r["percent"] == 0
    assert r["can_issue_invoices"] is False
    assert len(r["missing_for_invoicing"]) == 7


def test_full_profile_can_issue():
    r = completeness(FULL)
    assert r["percent"] == 100
    assert r["can_issue_invoices"] is True


def test_ai_number_is_optional():
    r = completeness({**FULL, "ai_number": None})
    assert r["can_issue_invoices"] is True


def test_blank_string_counts_as_missing():
    r = completeness({**FULL, "nif": "   "})
    assert r["can_issue_invoices"] is False
    assert r["missing_for_invoicing"] == ["nif"]