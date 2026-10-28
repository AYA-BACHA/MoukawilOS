from app.core.db import pool
from app.schemas.profile import PreferencesUpdate, ProfileUpdate
from app.services.profile import completeness
from app.services.numbering import current_year, next_number , parse_number


# fixed whitelist: column names never come from user input
COLUMNS = [
    "first_name", "last_name", "address", "trade_address", "phone", "nif",
    "ai_number", "rib", "anae_card_number", "anae_card_issue_date",
    "activity_start_date",
]

class CounterLocked(Exception):
    pass


def get(fid: int) -> dict:
    with pool.connection() as conn:
        cur = conn.execute(
            f"select {', '.join(COLUMNS)}, past_years_status, "
            "onboarding_completed_at, last_invoice_number, last_invoice_year "
            "from public.freelancers where id = %s",
            (fid,),
        )
        row = cur.fetchone()
        names = [d.name for d in cur.description]
    data = dict(zip(names, row))
    last_number = data.pop("last_invoice_number") or 0
    last_year = data.pop("last_invoice_year")
    return {
        "profile": data,
        "completeness": completeness(data),
        "next_invoice_number": next_number(last_number, last_year, current_year()),
        "can_edit_invoice_counter": last_number == 0,
    }


def patch(fid: int, data: ProfileUpdate) -> dict:
    changes = data.model_dump(exclude_unset=True)
    confirmed = changes.pop("past_years_confirmed", None)
    new_counter = changes.pop("last_invoice_number", None)
    sets, values = [], []
    for col, val in changes.items():
        if col in COLUMNS:
            sets.append(f"{col} = %s")
            values.append(val)
    if confirmed is not None:
        sets.append("past_years_status = %s")
        values.append("confirmed" if confirmed else "unknown")
    if new_counter is not None:
        year, seq = parse_number(new_counter)
        sets += ["last_invoice_number = %s", "last_invoice_year = %s"]
        values += [seq, year]
    if sets:
        with pool.connection() as conn:
            if new_counter is not None:
                # lock the row so an invoice can't be issued in between
                row = conn.execute(
                    "select last_invoice_number from public.freelancers "
                    "where id = %s for update", (fid,),
                ).fetchone()
                if row is None or row[0]:      # counter already used
                    raise CounterLocked()
            conn.execute(
                f"update public.freelancers set {', '.join(sets)} where id = %s",
                (*values, fid),
            )

    res = get(fid)
    can_issue = res["completeness"]["can_issue_invoices"]
    current_completed_at = res["profile"].get("onboarding_completed_at")

    if can_issue and not current_completed_at:
        with pool.connection() as conn:
            conn.execute("update public.freelancers set onboarding_completed_at = now() where id = %s", (fid,))
        res = get(fid)
    elif not can_issue and current_completed_at:
        with pool.connection() as conn:
            conn.execute("update public.freelancers set onboarding_completed_at = null where id = %s", (fid,))
        res = get(fid)

    return res


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
