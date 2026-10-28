from datetime import date

from app.core.db import pool
from app.schemas.manual_income import ManualIncomeIn, ManualIncomeOut

COLUMNS = "id, amount, received_date, note, created_at"


def _to_out(r) -> ManualIncomeOut:
    return ManualIncomeOut(id=r[0], amount=r[1], received_date=r[2],
                           note=r[3], created_at=r[4])


def create(freelancer_id: int, d: ManualIncomeIn) -> ManualIncomeOut:
    with pool.connection() as conn:
        r = conn.execute(
            f"""insert into public.manual_income_entries
                (freelancer_id, amount, received_date, note)
                values (%s, %s, %s, %s) returning {COLUMNS}""",
            (freelancer_id, d.amount, d.received_date, d.note),
        ).fetchone()
    return _to_out(r)


def get(freelancer_id: int, entry_id: int) -> ManualIncomeOut | None:
    with pool.connection() as conn:
        r = conn.execute(
            f"""select {COLUMNS} from public.manual_income_entries
                where id = %s and freelancer_id = %s""",
            (entry_id, freelancer_id),
        ).fetchone()
    return _to_out(r) if r else None


def list_all(freelancer_id: int, year: int | None, limit: int, offset: int):
    where = ["freelancer_id = %s"]
    params: list = [freelancer_id]
    if year:
        where.append("received_date >= %s and received_date < %s")
        params += [date(year, 1, 1), date(year + 1, 1, 1)]
    w = " and ".join(where)
    with pool.connection() as conn:
        total, amount = conn.execute(
            f"""select count(*), coalesce(sum(amount), 0)
                from public.manual_income_entries where {w}""", params,
        ).fetchone()
        rows = conn.execute(
            f"""select {COLUMNS} from public.manual_income_entries where {w}
                order by received_date desc, id desc limit %s offset %s""",
            (*params, limit, offset),
        ).fetchall()
    return [_to_out(r) for r in rows], total, amount


def update(freelancer_id: int, entry_id: int, d: ManualIncomeIn) -> ManualIncomeOut | None:
    with pool.connection() as conn:
        r = conn.execute(
            f"""update public.manual_income_entries
                set amount = %s, received_date = %s, note = %s
                where id = %s and freelancer_id = %s returning {COLUMNS}""",
            (d.amount, d.received_date, d.note, entry_id, freelancer_id),
        ).fetchone()
    return _to_out(r) if r else None


def delete(freelancer_id: int, entry_id: int) -> bool:
    with pool.connection() as conn:
        r = conn.execute(
            """delete from public.manual_income_entries
               where id = %s and freelancer_id = %s returning id""",
            (entry_id, freelancer_id),
        ).fetchone()
    return r is not None


def patch(freelancer_id: int, entry_id: int, changes: dict) -> ManualIncomeOut | None:
    allowed = ("amount", "received_date", "note")      # column names never come from the user
    sets = [f"{c} = %s" for c in changes if c in allowed]
    values = [v for c, v in changes.items() if c in allowed]
    if not sets:
        return get(freelancer_id, entry_id)
    with pool.connection() as conn:
        r = conn.execute(
            f"""update public.manual_income_entries set {', '.join(sets)}
                where id = %s and freelancer_id = %s returning {COLUMNS}""",
            (*values, entry_id, freelancer_id),
        ).fetchone()
    return _to_out(r) if r else None