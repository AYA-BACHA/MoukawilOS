from app.core.db import pool
from app.schemas.profile import PreferencesUpdate, ProfileUpdate
from app.services.profile import completeness
from app.services.numbering import current_year, next_number

# fixed whitelist: column names never come from user input
COLUMNS = [
    "first_name", "last_name", "address", "trade_address", "phone", "nif",
    "ai_number", "rib", "anae_card_number", "anae_card_issue_date",
    "activity_start_date",
]




def get(fid: int) -> dict:
    with pool.connection() as conn:
        cur = conn.execute(
            f"select {', '.join(COLUMNS)}, past_years_status, onboarding_completed_at "
            "from public.freelancers where id = %s",
            (fid,),
        )
        row = cur.fetchone()
        names = [d.name for d in cur.description]
        counter = conn.execute(
            "select last_invoice_number, last_invoice_year "
            "from public.freelancers where id = %s", (fid,),
        ).fetchone()
    profile = dict(zip(names, row))
    return {
        "profile": profile,
        "completeness": completeness(profile),
        "next_invoice_number": next_number(counter[0], counter[1], current_year()),
    }


def patch(fid: int, data: ProfileUpdate) -> dict:
    changes = data.model_dump(exclude_unset=True)
    confirmed = changes.pop("past_years_confirmed", None)
    sets, values = [], []
    for col, val in changes.items():
        if col in COLUMNS:
            sets.append(f"{col} = %s")
            values.append(val)
    if confirmed is not None:
        sets.append("past_years_status = %s")
        values.append("confirmed" if confirmed else "unknown")
    if sets:
        with pool.connection() as conn:
            conn.execute(
                f"update public.freelancers set {', '.join(sets)} where id = %s",
                (*values, fid),
            )
    result = get(fid)
    # onboarding is complete once the invoicing fields are all filled
    if result["completeness"]["can_issue_invoices"]:
        with pool.connection() as conn:
            conn.execute(
                "update public.freelancers set onboarding_completed_at = now() "
                "where id = %s and onboarding_completed_at is null",
                (fid,),
            )
    else:
        with pool.connection() as conn:
            conn.execute(
                "update public.freelancers set onboarding_completed_at = null "
                "where id = %s",
                (fid,),
            )
    return get(fid)


def get_preferences(fid: int) -> dict:
    with pool.connection() as conn:
        row = conn.execute(
            "select language, theme from public.user_preferences "
            "where freelancer_id = %s",
            (fid,),
        ).fetchone()
    return {"language": row[0], "theme": row[1]}


def patch_preferences(fid: int, data: PreferencesUpdate) -> dict:
    changes = data.model_dump(exclude_none=True)
    if changes:
        sets = ", ".join(f"{c} = %s" for c in changes if c in ("language", "theme"))
        with pool.connection() as conn:
            conn.execute(
                f"update public.user_preferences set {sets} where freelancer_id = %s",
                (*changes.values(), fid),
            )
    return get_preferences(fid)