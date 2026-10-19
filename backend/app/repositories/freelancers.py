from datetime import date
from psycopg.errors import UniqueViolation

from app.core.db import pool
from app.schemas.onboarding import OnboardingIn


class AlreadyOnboarded(Exception):
    pass


def create_freelancer(user_id: str, data: OnboardingIn) -> int:
    try:
        with pool.connection() as conn:  # one transaction: commit or rollback
            row = conn.execute(
                """
                insert into public.freelancers
                  (profile_id, first_name, last_name, address, trade_address,
                   phone, nif, ai_number, rib, anae_card_number,
                   anae_card_issue_date, activity_start_date,
                   last_invoice_number, last_invoice_year,
                   past_years_status, onboarding_completed_at)
                values
                  (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                   %s, %s, %s, now())
                returning id
                """,
                (
                    user_id, data.first_name, data.last_name, data.address,
                    data.trade_address, data.phone, data.nif, data.ai_number,
                    data.rib, data.anae_card_number, data.anae_card_issue_date,
                    data.activity_start_date, data.last_invoice_number,
                    date.today().year if data.last_invoice_number > 0 else None,
                    "confirmed" if data.past_years_confirmed else "unknown",
                ),
            ).fetchone()
            freelancer_id = row[0]
            conn.execute(
                "insert into public.user_preferences (freelancer_id) values (%s)",
                (freelancer_id,),
            )
            return freelancer_id
    except UniqueViolation as exc:
        raise AlreadyOnboarded() from exc