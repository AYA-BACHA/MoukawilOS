"""app/repositories/invoices.py

SQL only. No business rules, no validation, no "today", no money maths.
Functions that take `conn` run inside a transaction owned by the service.
"""
from datetime import date

from psycopg.errors import UniqueViolation
from psycopg.types.json import Jsonb

from app.core.db import pool
from app.schemas.invoices import (
    AuditEventOut, InvoiceCreate, InvoiceOut, ItemOut, SnapshotOut,
)


class NumberTaken(Exception):
    """The (freelancer, year, sequence) unique index was violated."""


def transaction():
    """`with transaction() as conn:` commits on success, rolls back on error."""
    return pool.connection()


COLUMNS = """i.id, i.client_id, coalesce(s.client_name, c.name), i.status,
             i.sequence_number, i.number_year, i.issue_date, i.due_date,
             i.currency, i.total, i.paid_at, i.cancelled_at,
             i.cancellation_reason, i.note, i.created_at, i.payment_rail"""

FROM = """public.invoices i
          join public.clients c on c.id = i.client_id
          left join public.invoice_snapshots s on s.invoice_id = i.id"""


# ---------------- mapping helpers ----------------
def _number(seq, year):
    return f"FAC-{year}-{seq:03d}" if seq else None


def _escape_like(text: str) -> str:
    """Make %, _ and \\ behave as normal characters in LIKE."""
    return (text.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_"))


def _to_out(r, items: list[ItemOut]) -> InvoiceOut:
    return InvoiceOut(
        id=r[0], client_id=r[1], client_name=r[2], status=r[3],
        number=_number(r[4], r[5]), sequence_number=r[4], number_year=r[5],
        issue_date=r[6], due_date=r[7], currency=r[8], total=r[9],
        paid_at=r[10], cancelled_at=r[11], cancellation_reason=r[12],
        note=r[13], created_at=r[14], items=items, payment_rail=r[15],
    )


def _items_by_invoice(conn, invoice_ids: list[int]) -> dict[int, list[ItemOut]]:
    """Load the items of many invoices with ONE query."""
    grouped: dict[int, list[ItemOut]] = {i: [] for i in invoice_ids}
    if not invoice_ids:
        return grouped
    rows = conn.execute(
        """select invoice_id, id, description, quantity, unit, unit_price, line_total
           from public.invoice_items
           where invoice_id = any(%s) order by id""",
        (invoice_ids,),
    ).fetchall()
    for r in rows:
        grouped[r[0]].append(ItemOut(
            id=r[1], description=r[2], quantity=r[3],
            unit=r[4], unit_price=r[5], line_total=r[6],
        ))
    return grouped


def _snapshot(conn, invoice_id) -> SnapshotOut | None:
    r = conn.execute(
        """select seller_name, seller_address, seller_nif, seller_ai,
                  seller_card_number, seller_rib, client_type, client_name,
                  client_address, client_rc, client_nif, client_nis
           from public.invoice_snapshots where invoice_id = %s""",
        (invoice_id,),
    ).fetchone()
    if r is None:          # drafts have no snapshot
        return None
    return SnapshotOut(
        seller_name=r[0], seller_address=r[1], seller_nif=r[2], seller_ai=r[3],
        seller_card_number=r[4], seller_rib=r[5], client_type=r[6],
        client_name=r[7], client_address=r[8], client_rc=r[9],
        client_nif=r[10], client_nis=r[11],
    )


def _audit_log(conn, invoice_id) -> list[AuditEventOut]:
    rows = conn.execute(
        """select id, event_type, details, created_at
           from public.invoice_audit_events
           where invoice_id = %s order by created_at, id""",
        (invoice_id,),
    ).fetchall()
    return [AuditEventOut(id=r[0], event_type=r[1], details=r[2] or {},
                          created_at=r[3]) for r in rows]


# ---------------- reads (own connection) ----------------
def get(freelancer_id: int, invoice_id: int) -> InvoiceOut | None:
    with pool.connection() as conn:
        r = conn.execute(
            f"select {COLUMNS} from {FROM} where i.id = %s and i.freelancer_id = %s",
            (invoice_id, freelancer_id),
        ).fetchone()
        if not r:
            return None
        out = _to_out(r, _items_by_invoice(conn, [r[0]])[r[0]])
        out.snapshot = _snapshot(conn, invoice_id)
        out.audit_log = _audit_log(conn, invoice_id)
        return out


def list_all(freelancer_id: int, status: str | None, client_id: int | None,
             q: str | None, date_from: date | None, date_to: date | None,
             limit: int, offset: int) -> tuple[list[InvoiceOut], int]:
    where = ["i.freelancer_id = %s"]
    params: list = [freelancer_id]
    if status:
        where.append("i.status = %s"); params.append(status)
    if client_id:
        where.append("i.client_id = %s"); params.append(client_id)
    if date_from:
        where.append("i.issue_date >= %s"); params.append(date_from)
    if date_to:
        where.append("i.issue_date <= %s"); params.append(date_to)
    if q and q.strip():
        like = f"%{_escape_like(q.strip())}%"
        where.append(
            "(coalesce(s.client_name, c.name) ilike %s or "
            "('FAC-' || i.number_year || '-' || "
            " case when i.sequence_number < 1000 "
            "      then lpad(i.sequence_number::text, 3, '0') "
            "      else i.sequence_number::text end) ilike %s)"
        )
        params += [like, like]
    w = " and ".join(where)
    with pool.connection() as conn:
        total = conn.execute(
            f"select count(*) from {FROM} where {w}", params).fetchone()[0]
        rows = conn.execute(
            f"select {COLUMNS} from {FROM} where {w} "
            f"order by coalesce(i.issue_date, i.created_at::date) desc, i.id desc "
            f"limit %s offset %s",
            (*params, limit, offset),
        ).fetchall()
        items = _items_by_invoice(conn, [r[0] for r in rows])
        return [_to_out(r, items[r[0]]) for r in rows], total


# ---------------- locking reads (inside a service transaction) ----------------
def lock_freelancer(conn, freelancer_id: int) -> dict | None:
    """Row lock on the freelancer: serializes invoice numbering."""
    cur = conn.execute(
        """select first_name, last_name, trade_address, nif, ai_number,
                  rib, anae_card_number, anae_card_issue_date,
                  last_invoice_number, last_invoice_year
           from public.freelancers where id=%s for update""",
        (freelancer_id,),
    )
    row = cur.fetchone()
    return dict(zip([d.name for d in cur.description], row)) if row else None


def lock_invoice(conn, freelancer_id: int, invoice_id: int) -> dict | None:
    row = conn.execute(
        """select status, client_id, total, issue_date, paid_at, payment_rail
           from public.invoices
           where id=%s and freelancer_id=%s for update""",
        (invoice_id, freelancer_id),
    ).fetchone()
    if row is None:
        return None
    return dict(status=row[0], client_id=row[1], total=row[2],
                issue_date=row[3], paid_at=row[4], payment_rail=row[5])


def count_items(conn, invoice_id: int) -> int:
    return conn.execute(
        "select count(*) from public.invoice_items where invoice_id=%s",
        (invoice_id,),
    ).fetchone()[0]


def highest_sequence(conn, freelancer_id: int, year: int) -> int:
    return conn.execute(
        """select coalesce(max(sequence_number), 0) from public.invoices
           where freelancer_id=%s and number_year=%s""",
        (freelancer_id, year),
    ).fetchone()[0]


def get_active_client(conn, freelancer_id: int, client_id: int) -> dict | None:
    r = conn.execute(
        """select t.code, c.name, c.address, c.rc, c.nif, c.nis
           from public.clients c
           join public.client_types t on t.id = c.client_type_id
           where c.id=%s and c.freelancer_id=%s and c.archived_at is null""",
        (client_id, freelancer_id),
    ).fetchone()
    if r is None:
        return None
    return dict(type=r[0], name=r[1], address=r[2], rc=r[3], nif=r[4], nis=r[5])


# ---------------- writes (inside a service transaction) ----------------
def insert_draft(conn, freelancer_id: int, d: InvoiceCreate) -> int:
    return conn.execute(
        """insert into public.invoices
           (freelancer_id, client_id, due_date, note, currency)
           values (%s,%s,%s,%s,%s) returning id""",
        (freelancer_id, d.client_id, d.due_date, d.note, d.currency),
    ).fetchone()[0]


def update_draft_header(conn, invoice_id: int, d, total) -> None:
    conn.execute(
        """update public.invoices
           set client_id=%s, due_date=%s, note=%s, currency=%s, total=%s
           where id=%s""",
        (d.client_id, d.due_date, d.note, d.currency, total, invoice_id),
    )


def set_total(conn, invoice_id: int, total) -> None:
    conn.execute("update public.invoices set total=%s where id=%s", (total, invoice_id))


def replace_items(conn, invoice_id: int, lines: list[dict]) -> None:
    """`lines` already priced by the service (each has line_total)."""
    conn.execute("delete from public.invoice_items where invoice_id = %s", (invoice_id,))
    for ln in lines:
        conn.execute(
            """insert into public.invoice_items
               (invoice_id, description, quantity, unit, unit_price, line_total)
               values (%s,%s,%s,%s,%s,%s)""",
            (invoice_id, ln["description"], ln["quantity"], ln["unit"],
             ln["unit_price"], ln["line_total"]),
        )


def delete_invoice(conn, invoice_id: int) -> None:
    conn.execute("delete from public.invoices where id=%s", (invoice_id,))


def insert_snapshot(conn, invoice_id: int, seller: dict, client: dict) -> None:
    conn.execute(
        """insert into public.invoice_snapshots
           (invoice_id, seller_name, seller_address, seller_nif, seller_ai,
            seller_card_number, seller_rib, client_type, client_name,
            client_address, client_rc, client_nif, client_nis)
           values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (invoice_id, seller["name"], seller["address"], seller["nif"],
         seller["ai"], seller["card_number"], seller["rib"],
         client["type"], client["name"], client["address"],
         client["rc"], client["nif"], client["nis"]),
    )


def mark_issued(conn, invoice_id: int, seq: int, year: int, issue_date: date) -> None:
    try:
        conn.execute(
            """update public.invoices
               set status='issued', sequence_number=%s, number_year=%s, issue_date=%s
               where id=%s""",
            (seq, year, issue_date, invoice_id),
        )
    except UniqueViolation as exc:
        raise NumberTaken() from exc


def set_freelancer_counter(conn, freelancer_id: int, seq: int, year: int) -> None:
    conn.execute(
        """update public.freelancers
           set last_invoice_number=%s, last_invoice_year=%s where id=%s""",
        (seq, year, freelancer_id),
    )


def mark_paid(conn, invoice_id: int, paid_at: date, payment_rail: str | None) -> None:
    conn.execute(
        """update public.invoices
           set status='paid', paid_at=%s, payment_rail=%s where id=%s""",
        (paid_at, payment_rail, invoice_id),
    )


def mark_unpaid(conn, invoice_id: int) -> None:
    conn.execute(
        """update public.invoices
           set status='issued', paid_at=null, payment_rail=null where id=%s""",
        (invoice_id,),
    )


def mark_cancelled(conn, invoice_id: int, reason: str) -> None:
    conn.execute(
        """update public.invoices
           set status='cancelled', cancelled_at=now(), cancellation_reason=%s
           where id=%s""",
        (reason, invoice_id),
    )


def add_event(conn, invoice_id: int, freelancer_id: int, event_type: str,
              paid_at: date | None = None, details: dict | None = None) -> None:
    conn.execute(
        """insert into public.invoice_audit_events
           (invoice_id, freelancer_id, event_type, paid_at, details)
           values (%s,%s,%s,%s,%s)""",
        (invoice_id, freelancer_id, event_type, paid_at, Jsonb(details or {})),
    )