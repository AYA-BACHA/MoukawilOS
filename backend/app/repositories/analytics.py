from decimal import Decimal
from typing import Any, Dict, List
from app.core.db import pool


def get_turnover_aggregates(freelancer_id: int, year: int) -> Dict[str, Any]:
    with pool.connection() as conn:
        # 1. Collected turnover (PAID invoices in this year)
        paid_row = conn.execute(
            """
            select coalesce(sum(total), 0)
            from public.invoices
            where freelancer_id = %s
              and status = 'paid'
              and (number_year = %s or extract(year from coalesce(paid_at, issue_date)) = %s)
            """,
            (freelancer_id, year, year),
        ).fetchone()
        collected = Decimal(str(paid_row[0]))

        # 2. Pending receivables (ISSUED invoices in this year)
        issued_row = conn.execute(
            """
            select coalesce(sum(total), 0)
            from public.invoices
            where freelancer_id = %s
              and status = 'issued'
              and (number_year = %s or extract(year from issue_date) = %s)
            """,
            (freelancer_id, year, year),
        ).fetchone()
        pending = Decimal(str(issued_row[0]))

        # 3. Total Credit Notes in this year
        credits_row = conn.execute(
            """
            select coalesce(sum(amount), 0)
            from public.credit_notes
            where freelancer_id = %s and number_year = %s
            """,
            (freelancer_id, year),
        ).fetchone()
        credit_notes = Decimal(str(credits_row[0]))

        # 4. Consecutive prior years exceeding 5,000,000 DZD
        prior_consecutive = 0
        for prior_year in range(year - 1, year - 4, -1):
            prior_paid = conn.execute(
                """
                select coalesce(sum(total), 0)
                from public.invoices
                where freelancer_id = %s
                  and status = 'paid'
                  and (number_year = %s or extract(year from coalesce(paid_at, issue_date)) = %s)
                """,
                (freelancer_id, prior_year, prior_year),
            ).fetchone()[0]
            prior_credits = conn.execute(
                """
                select coalesce(sum(amount), 0)
                from public.credit_notes
                where freelancer_id = %s and number_year = %s
                """,
                (freelancer_id, prior_year),
            ).fetchone()[0]
            prior_net = Decimal(str(prior_paid)) - Decimal(str(prior_credits))
            if prior_net > Decimal("5000000.00"):
                prior_consecutive += 1
            else:
                break

    return {
        "collected": collected,
        "pending": pending,
        "credit_notes": credit_notes,
        "prior_consecutive": prior_consecutive,
    }


def get_completed_obligation_codes(freelancer_id: int, year: int) -> List[str]:
    with pool.connection() as conn:
        rows = conn.execute(
            """
            select ot.code
            from public.obligation_completions oc
            join public.obligation_types ot on ot.id = oc.obligation_type_id
            where oc.freelancer_id = %s and oc.period_year = %s
            """,
            (freelancer_id, year),
        ).fetchall()
    return [r[0] for r in rows]
