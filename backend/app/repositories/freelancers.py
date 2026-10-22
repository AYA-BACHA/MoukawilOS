from psycopg.errors import UniqueViolation

from app.core.db import pool
from app.schemas.onboarding import OnboardingIn
from app.services.numbering import parse_number
from app.services.profile import completeness


class AlreadyOnboarded(Exception):
    pass


def create_freelancer(user_id: str, data: OnboardingIn) -> int:
    complete = completeness(data.model_dump())["can_issue_invoices"]

    # "FAC-2026-037" -> year 2026, sequence 37 (already validated by the schema)
    if data.last_invoice_number:
        last_year, last_seq = parse_number(data.last_invoice_number)
    else:
        last_year, last_seq = None, 0

    try:
        with pool.connection() as conn:
            fid = conn.execute(
                """
                insert into public.freelancers
                  (profile_id, first_name, last_name, address, trade_address,
                   phone, nif, ai_number, rib, anae_card_number,
                   anae_card_issue_date, activity_start_date,
                   last_invoice_number, last_invoice_year,
                   past_years_status, onboarding_completed_at)
                values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                        case when %s then now() end)
                returning id
                """,
                (
                    user_id, data.first_name, data.last_name, data.address,
                    data.trade_address, data.phone, data.nif, data.ai_number,
                    data.rib, data.anae_card_number, data.anae_card_issue_date,
                    data.activity_start_date, last_seq, last_year,
                    "confirmed" if data.past_years_confirmed else "unknown",
                    complete,
                ),
            ).fetchone()[0]
            conn.execute(
                "insert into public.user_preferences (freelancer_id) values (%s)",
                (fid,),
            )
            return fid
    except UniqueViolation as exc:
        raise AlreadyOnboarded() from exc