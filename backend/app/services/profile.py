REQUIRED_FOR_INVOICING = [
    "first_name", "last_name", "trade_address",
    "nif", "rib", "anae_card_number", "anae_card_issue_date",
]
OPTIONAL = ["ai_number", "phone", "address", "activity_start_date"]


def _empty(v) -> bool:
    return v is None or (isinstance(v, str) and not v.strip())


def completeness(profile: dict) -> dict:
    missing = [f for f in REQUIRED_FOR_INVOICING if _empty(profile.get(f))]
    missing_optional = [f for f in OPTIONAL if _empty(profile.get(f))]
    total = len(REQUIRED_FOR_INVOICING)
    return {
        "percent": round(100 * (total - len(missing)) / total),
        "missing_for_invoicing": missing,
        "missing_optional": missing_optional,
        "can_issue_invoices": not missing,
    }