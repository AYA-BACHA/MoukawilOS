from datetime import date, datetime
from decimal import ROUND_HALF_UP, Decimal
from zoneinfo import ZoneInfo

from psycopg.errors import UniqueViolation

from app.core.db import pool
from app.repositories import clients as clients_repo
from app.schemas.invoices import (
    InvoiceCreate, InvoiceOut, InvoiceUpdate, ItemOut, SnapshotOut,
)
from app.services.profile import completeness

TZ = ZoneInfo("Africa/Algiers")
CENT = Decimal("0.01")


class InvalidState(Exception):
    pass


class ClientInvalid(Exception):
    pass


class ProfileIncomplete(Exception):
    def __init__(self, missing):
        self.missing = missing


class NumberTaken(Exception):
    pass


def _today() -> date:
    return datetime.now(TZ).date()


def _money(x: Decimal) -> Decimal:
    return x.quantize(CENT, rounding=ROUND_HALF_UP)


COLUMNS = """i.id, i.client_id, coalesce(s.client_name, c.name), i.status,
             i.sequence_number, i.number_year, i.issue_date, i.due_date,
             i.currency, i.total, i.paid_at, i.cancelled_at,
             i.cancellation_reason, i.note, i.created_at"""

FROM = """public.invoices i
          join public.clients c on c.id = i.client_id
          left join public.invoice_snapshots s on s.invoice_id = i.id"""


def _number(seq, year):
    return f"FAC-{year}-{seq:03d}" if seq else None


def _items(conn, invoice_id) -> list[ItemOut]:
    rows = conn.execute(
        """select id, description, quantity, unit, unit_price, line_total
           from public.invoice_items where invoice_id = %s order by id""",
        (invoice_id,),
    ).fetchall()
    return [ItemOut(id=r[0], description=r[1], quantity=r[2],
                    unit=r[3], unit_price=r[4], line_total=r[5]) for r in rows]


def _write_items(conn, invoice_id, items) -> Decimal:
    conn.execute("delete from public.invoice_items where invoice_id = %s", (invoice_id,))
    total = Decimal("0")
    for it in items:
        line = _money(it.quantity * it.unit_price)
        total += line
        conn.execute(
            """insert into public.invoice_items
               (invoice_id, description, quantity, unit, unit_price, line_total)
               values (%s,%s,%s,%s,%s,%s)""",
            (invoice_id, it.description, it.quantity, it.unit, it.unit_price, line),
        )
    return total


def _to_out(conn, r) -> InvoiceOut:
    return InvoiceOut(
        id=r[0], client_id=r[1], client_name=r[2], status=r[3],
        number=_number(r[4], r[5]), sequence_number=r[4], number_year=r[5],
        issue_date=r[6], due_date=r[7], currency=r[8], total=r[9],
        paid_at=r[10], cancelled_at=r[11], cancellation_reason=r[12],
        note=r[13], created_at=r[14], items=_items(conn, r[0]),
    )


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


def _check_client(freelancer_id, client_id):
    c = clients_repo.get(freelancer_id, client_id)
    if c is None or c.archived_at is not None:
        raise ClientInvalid()


def _event(conn, invoice_id, freelancer_id, event_type, paid_at=None):
    conn.execute(
        """insert into public.invoice_audit_events
           (invoice_id, freelancer_id, event_type, paid_at) values (%s,%s,%s,%s)""",
        (invoice_id, freelancer_id, event_type, paid_at),
    )


# ---------------- read ----------------
def get(freelancer_id: int, invoice_id: int) -> InvoiceOut | None:
    with pool.connection() as conn:
        r = conn.execute(
            f"select {COLUMNS} from {FROM} where i.id = %s and i.freelancer_id = %s",
            (invoice_id, freelancer_id),
        ).fetchone()
        if not r:
            return None
        out = _to_out(conn, r)
        out.snapshot = _snapshot(conn, invoice_id)
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
    if q:
        like = f"%{q.strip()}%"
        where.append(
            "(coalesce(s.client_name, c.name) ilike %s or "
            "('FAC-' || i.number_year || '-' || lpad(i.sequence_number::text, 3, '0')) ilike %s)"
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
        return [_to_out(conn, r) for r in rows], total


# ---------------- drafts ----------------
def create(freelancer_id: int, d: InvoiceCreate) -> InvoiceOut:
    _check_client(freelancer_id, d.client_id)
    with pool.connection() as conn:
        new_id = conn.execute(
            """insert into public.invoices
               (freelancer_id, client_id, due_date, note, currency)
               values (%s,%s,%s,%s,%s) returning id""",
            (freelancer_id, d.client_id, d.due_date, d.note, d.currency),
        ).fetchone()[0]
        total = _write_items(conn, new_id, d.items)
        conn.execute("update public.invoices set total=%s where id=%s", (total, new_id))
    return get(freelancer_id, new_id)


def update_draft(freelancer_id: int, invoice_id: int, d: InvoiceUpdate) -> InvoiceOut | None:
    _check_client(freelancer_id, d.client_id)
    with pool.connection() as conn:
        row = conn.execute(
            "select status from public.invoices where id=%s and freelancer_id=%s for update",
            (invoice_id, freelancer_id),
        ).fetchone()
        if row is None:
            return None
        if row[0] != "draft":
            raise InvalidState("only drafts can be edited")
        total = _write_items(conn, invoice_id, d.items)
        conn.execute(
            """update public.invoices
               set client_id=%s, due_date=%s, note=%s, currency=%s, total=%s
               where id=%s""",
            (d.client_id, d.due_date, d.note, d.currency, total, invoice_id),
        )
    return get(freelancer_id, invoice_id)


def delete_draft(freelancer_id: int, invoice_id: int) -> bool:
    with pool.connection() as conn:
        row = conn.execute(
            "select status from public.invoices where id=%s and freelancer_id=%s for update",
            (invoice_id, freelancer_id),
        ).fetchone()
        if row is None:
            return False
        if row[0] != "draft":
            raise InvalidState("only drafts can be deleted, cancel it instead")
        conn.execute("delete from public.invoices where id=%s", (invoice_id,))
    return True


# ---------------- issue ----------------
def issue(freelancer_id: int, invoice_id: int) -> InvoiceOut | None:
    today = _today()
    year = today.year
    try:
        with pool.connection() as conn:
            # 1. lock the freelancer: serializes numbering
            cur = conn.execute(
                """select first_name, last_name, trade_address, nif, ai_number,
                          rib, anae_card_number, anae_card_issue_date,
                          last_invoice_number, last_invoice_year
                   from public.freelancers where id=%s for update""",
                (freelancer_id,),
            )
            f = dict(zip([d.name for d in cur.description], cur.fetchone()))

            report = completeness(f)
            if not report["can_issue_invoices"]:
                raise ProfileIncomplete(report["missing_for_invoicing"])

            inv = conn.execute(
                """select status, client_id from public.invoices
                   where id=%s and freelancer_id=%s for update""",
                (invoice_id, freelancer_id),
            ).fetchone()
            if inv is None:
                return None
            if inv[0] != "draft":
                raise InvalidState("invoice already issued")

            n_items = conn.execute(
                "select count(*) from public.invoice_items where invoice_id=%s",
                (invoice_id,),
            ).fetchone()[0]
            if n_items == 0:
                raise InvalidState("add at least one item before issuing")

            # 2. next number: counter (restarts each year), never below the
            #    highest number already used this year
            counter = f["last_invoice_number"] if f["last_invoice_year"] == year else 0
            highest = conn.execute(
                """select coalesce(max(sequence_number), 0) from public.invoices
                   where freelancer_id=%s and number_year=%s""",
                (freelancer_id, year),
            ).fetchone()[0]
            seq = max(counter, highest) + 1

            # 3. snapshot (immutable)
            c = conn.execute(
                """select t.code, c.name, c.address, c.rc, c.nif, c.nis
                   from public.clients c
                   join public.client_types t on t.id = c.client_type_id
                   where c.id=%s""",
                (inv[1],),
            ).fetchone()
            conn.execute(
                """insert into public.invoice_snapshots
                   (invoice_id, seller_name, seller_address, seller_nif, seller_ai,
                    seller_card_number, seller_rib, client_type, client_name,
                    client_address, client_rc, client_nif, client_nis)
                   values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (invoice_id, f"{f['first_name']} {f['last_name']}",
                 f["trade_address"], f["nif"], f["ai_number"],
                 f["anae_card_number"], f["rib"],
                 c[0], c[1], c[2], c[3], c[4], c[5]),
            )

            # 4. issue + advance the counter
            conn.execute(
                """update public.invoices
                   set status='issued', sequence_number=%s, number_year=%s, issue_date=%s
                   where id=%s""",
                (seq, year, today, invoice_id),
            )
            conn.execute(
                """update public.freelancers
                   set last_invoice_number=%s, last_invoice_year=%s where id=%s""",
                (seq, year, freelancer_id),
            )
            _event(conn, invoice_id, freelancer_id, "issued")
    except UniqueViolation as exc:
        raise NumberTaken() from exc
    return get(freelancer_id, invoice_id)


# ---------------- status changes ----------------
def _transition(freelancer_id, invoice_id, allowed, fn):
    with pool.connection() as conn:
        row = conn.execute(
            """select status, issue_date, paid_at from public.invoices
               where id=%s and freelancer_id=%s for update""",
            (invoice_id, freelancer_id),
        ).fetchone()
        if row is None:
            return None
        if row[0] not in allowed:
            raise InvalidState(f"not allowed from status '{row[0]}'")
        fn(conn, row)
    return get(freelancer_id, invoice_id)


def mark_paid(freelancer_id, invoice_id, paid_at: date):
    def run(conn, row):
        if paid_at > _today():
            raise InvalidState("paid_at cannot be in the future")
        if paid_at < row[1]:
            raise InvalidState("paid_at cannot be before the issue date")
        conn.execute(
            "update public.invoices set status='paid', paid_at=%s where id=%s",
            (paid_at, invoice_id),
        )
        _event(conn, invoice_id, freelancer_id, "paid")
    return _transition(freelancer_id, invoice_id, {"issued"}, run)


def revert_payment(freelancer_id, invoice_id):
    removed = {}

    def run(conn, row):
        removed["paid_at"] = row[2]
        conn.execute(
            "update public.invoices set status='issued', paid_at=null where id=%s",
            (invoice_id,),
        )
        _event(conn, invoice_id, freelancer_id, "unpaid", row[2])  # the removed date
    out = _transition(freelancer_id, invoice_id, {"paid"}, run)
    if out and removed["paid_at"].year < _today().year:
        out.warning = ("This payment belongs to a previous year, "
                       "it may no longer match your declaration.")
    return out


def cancel(freelancer_id, invoice_id, reason: str):
    def run(conn, row):
        conn.execute(
            """update public.invoices
               set status='cancelled', cancelled_at=now(), cancellation_reason=%s
               where id=%s""",
            (reason, invoice_id),
        )
        _event(conn, invoice_id, freelancer_id, "cancelled")
    return _transition(freelancer_id, invoice_id, {"issued"}, run)   # not from paid