from datetime import date
from decimal import Decimal

from app.core.db import pool


def get_rules(codes, on_date: date) -> dict:
    """Newest value of each rule that is valid on the given date."""
    with pool.connection() as conn:
        rows = conn.execute(
            """select d.code, r.value, r.source
               from public.rule_definitions d
               join lateral (
                 select value, source from public.rules
                 where rule_definition_id = d.id and valid_from <= %s
                 order by valid_from desc limit 1
               ) r on true
               where d.code = any(%s)""",
            (on_date, list(codes)),
        ).fetchall()
    return {r[0]: {"value": r[1], "source": r[2]} for r in rows}


def get_ceilings_by_years(years: list[int]) -> dict[int, Decimal | None]:
    """Historical CEILING rule values for the given years in a single batched query."""
    if not years:
        return {}
    unique_years = sorted(set(years))
    with pool.connection() as conn:
        rows = conn.execute(
            """select y.yr, r.value
               from unnest(%s::int[]) as y(yr)
               left join public.rule_definitions d on d.code = 'CEILING'
               left join lateral (
                 select value from public.rules
                 where rule_definition_id = d.id and valid_from <= make_date(y.yr, 12, 31)
                 order by valid_from desc limit 1
               ) r on true""",
            (unique_years,),
        ).fetchall()
    return {r[0]: Decimal(str(r[1])) if r[1] is not None else None for r in rows}


def paid_turnover(freelancer_id: int, year: int) -> Decimal:
    """Collected turnover: paid invoices (by paid_at) + manual income (by received_date)."""
    start, end = date(year, 1, 1), date(year + 1, 1, 1)
    with pool.connection() as conn:
        return conn.execute(
            """select
                 (select coalesce(sum(total), 0) from public.invoices
                   where freelancer_id = %s and status = 'paid'
                     and paid_at >= %s and paid_at < %s)
               + (select coalesce(sum(amount), 0) from public.manual_income_entries
                   where freelancer_id = %s
                     and received_date >= %s and received_date < %s)""",
            (freelancer_id, start, end, freelancer_id, start, end),
        ).fetchone()[0]


def paid_turnover_by_years(freelancer_id: int, years: list[int]) -> dict[int, Decimal]:
    """Collected turnover for multiple years in a single batched query."""
    if not years:
        return {}
    unique_years = sorted(set(years))
    with pool.connection() as conn:
        rows = conn.execute(
            """select y.yr,
                      coalesce(inv.tot, 0) + coalesce(man.tot, 0) as total
               from unnest(%s::int[]) as y(yr)
               left join (
                   select extract(year from paid_at)::int as yr, sum(total) as tot
                   from public.invoices
                   where freelancer_id = %s and status = 'paid'
                     and extract(year from paid_at)::int = any(%s)
                   group by 1
               ) inv on inv.yr = y.yr
               left join (
                   select extract(year from received_date)::int as yr, sum(amount) as tot
                   from public.manual_income_entries
                   where freelancer_id = %s
                     and extract(year from received_date)::int = any(%s)
                   group by 1
               ) man on man.yr = y.yr""",
            (unique_years, freelancer_id, unique_years, freelancer_id, unique_years),
        ).fetchall()
    return {r[0]: Decimal(str(r[1])) for r in rows}


def get_dates(freelancer_id: int):
    with pool.connection() as conn:
        row = conn.execute(
            """select anae_card_issue_date, activity_start_date
               from public.freelancers where id = %s""",
            (freelancer_id,),
        ).fetchone()
    return row if row else (None, None)


from typing import get_args
from app.core.lookups import InvoiceStatus


def obligation_defs(on_date: date) -> list[dict]:
    """Latest definition of each obligation in force on the given date."""
    with pool.connection() as conn:
        rows = conn.execute(
            """select distinct on (t.id)
                      t.code, d.start_month, d.start_day, d.end_month, d.end_day,
                      d.year_offset, d.days_after_card_date, d.anchor_activity_start,
                      d.official_link, d.note, d.verified
               from public.obligation_definitions d
               join public.obligation_types t on t.id = d.obligation_type_id
               where d.effective_from <= %s
               order by t.id, d.effective_from desc""",
            (on_date,),
        ).fetchall()
    keys = ["code", "start_month", "start_day", "end_month", "end_day",
            "year_offset", "days", "anchor_start", "official_link", "note", "verified"]
    return [dict(zip(keys, r)) for r in rows]


def invoice_stats(freelancer_id: int, year: int):
    """Invoice counts by status for the year (Algiers time), and the total still
    owed: every issued, unpaid invoice whatever year it was issued in.
    Paid and cancelled invoices are never pending."""
    with pool.connection() as conn:
        rows = conn.execute(
            """select status, count(*)
               from public.invoices
               where freelancer_id = %s
                 and coalesce(issue_date, (created_at at time zone 'Africa/Algiers')::date) >= %s
                 and coalesce(issue_date, (created_at at time zone 'Africa/Algiers')::date) < %s
               group by status""",
            (freelancer_id, date(year, 1, 1), date(year + 1, 1, 1)),
        ).fetchall()
        pending = conn.execute(
            """select coalesce(sum(total), 0) from public.invoices
               where freelancer_id = %s and status = 'issued'""",
            (freelancer_id,),
        ).fetchone()[0]
    counts = {s: 0 for s in get_args(InvoiceStatus)}
    for status, n in rows:
        counts[status] = n
    return counts, pending

def completions(freelancer_id: int) -> set[tuple[str, int]]:
    with pool.connection() as conn:
        rows = conn.execute(
            """select t.code, c.period_year
               from public.obligation_completions c
               join public.obligation_types t on t.id = c.obligation_type_id
               where c.freelancer_id = %s""",
            (freelancer_id,),
        ).fetchall()
    return {(r[0], r[1]) for r in rows}


def complete(freelancer_id: int, code: str, year: int) -> bool:
    with pool.connection() as conn:
        t = conn.execute(
            "select id from public.obligation_types where code = %s", (code,)
        ).fetchone()
        if t is None:
            return False
        conn.execute(
            """insert into public.obligation_completions
               (freelancer_id, obligation_type_id, period_year)
               values (%s, %s, %s) on conflict do nothing""",
            (freelancer_id, t[0], year),
        )
    return True


def uncomplete(freelancer_id: int, code: str, year: int) -> bool:
    with pool.connection() as conn:
        t = conn.execute(
            "select id from public.obligation_types where code = %s", (code,)
        ).fetchone()
        if t is None:
            return False
        conn.execute(
            """delete from public.obligation_completions
               where freelancer_id = %s and obligation_type_id = %s
                 and period_year = %s""",
            (freelancer_id, t[0], year),
        )
    return True