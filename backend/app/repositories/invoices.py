from datetime import date, datetime
from decimal import ROUND_HALF_UP, Decimal
from zoneinfo import ZoneInfo

from psycopg.errors import UniqueViolation

from app.core.db import pool
from app.repositories import clients as clients_repo
from app.schemas.invoices import (
    InvoiceCreate, InvoiceOut, InvoiceUpdate, ItemOut, SnapshotOut, AuditEventOut
)
from app.services.profile import completeness
from psycopg.types.json import Jsonb


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
             i.cancellation_reason, i.note, i.created_at, i.payment_rail"""

FROM = """public.invoices i
          join public.clients c on c.id = i.client_id
          left join public.invoice_snapshots s on s.invoice_id = i.id"""



def _number(seq, year):
    return f"FAC-{year}-{seq:03d}" if seq else None

def _escape_like(text: str) -> str:
    """Make %, _ and \\ behave as normal characters in LIKE."""
    return (text.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_"))


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


def _credit_notes_by_invoice(conn, invoice_ids: list[int]) -> dict[int, list[dict]]:
    grouped: dict[int, list[dict]] = {i: [] for i in invoice_ids}
    if not invoice_ids:
        return grouped
    rows = conn.execute(
        '''select invoice_id, id, credit_note_number, amount, reason, issue_date
           from public.credit_notes
           where invoice_id = any(%s) order by id''',
        (invoice_ids,),
    ).fetchall()
    for r in rows:
        grouped[r[0]].append({
            "id": f"cn_{r[1]}",
            "credit_note_number": r[2],
            "amount": str(r[3]),
            "reason": r[4],
            "issue_date": r[5].isoformat() if r[5] else None,
        })
    return grouped


def _to_out(r, items: list[ItemOut], credit_notes: list[dict] | None = None) -> InvoiceOut:
    cns = credit_notes or []
    tot_cred = sum((Decimal(str(c["amount"])) for c in cns), Decimal("0.00"))
    return InvoiceOut(
        id=r[0], client_id=r[1], client_name=r[2], status=r[3],
        number=_number(r[4], r[5]), sequence_number=r[4], number_year=r[5],
        issue_date=r[6], due_date=r[7], currency=r[8], total=r[9],
        paid_at=r[10], cancelled_at=r[11], cancellation_reason=r[12],
        note=r[13], created_at=r[14], items=items, payment_rail=r[15],
        credit_notes=cns, has_credit_notes=len(cns) > 0, total_credited=tot_cred,
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


def _event(conn, invoice_id, freelancer_id, event_type, paid_at=None, details=None):
    conn.execute(
        """insert into public.invoice_audit_events
           (invoice_id, freelancer_id, event_type, paid_at, details)
           values (%s,%s,%s,%s,%s)""",
        (invoice_id, freelancer_id, event_type, paid_at, Jsonb(details or {})),
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


# ---------------- read ----------------
def get(freelancer_id: int, invoice_id: int) -> InvoiceOut | None:
    with pool.connection() as conn:
        r = conn.execute(
            f"select {COLUMNS} from {FROM} where i.id = %s and i.freelancer_id = %s",
            (invoice_id, freelancer_id),
        ).fetchone()
        if not r:
            return None
        items = _items_by_invoice(conn, [r[0]])[r[0]]
        cns = _credit_notes_by_invoice(conn, [invoice_id])[invoice_id]
        out = _to_out(r, items, cns)
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
        rows = conn.execute(
            f"select count(*) over(), {COLUMNS} from {FROM} where {w} "
            f"order by coalesce(i.issue_date, i.created_at::date) desc, i.id desc "
            f"limit %s offset %s",
            (*params, limit, offset),
        ).fetchall()
        if not rows:
            if offset > 0:
                total = conn.execute(f"select count(*) from {FROM} where {w}", params).fetchone()[0]
            else:
                total = 0
            return [], total
        total = rows[0][0]
        unwrapped = [r[1:] for r in rows]
        items = _items_by_invoice(conn, [r[0] for r in unwrapped])
        cns = _credit_notes_by_invoice(conn, [r[0] for r in unwrapped])
        return [_to_out(r, items[r[0]], cns[r[0]]) for r in unwrapped], total
    


# ---------------- drafts ----------------
def create(freelancer_id: int, d: InvoiceCreate) -> InvoiceOut:
    with pool.connection() as conn:
        c = conn.execute(
            "select name from public.clients where id = %s and freelancer_id = %s and archived_at is null",
            (d.client_id, freelancer_id),
        ).fetchone()
        if c is None:
            raise ClientInvalid()
        client_name = c[0]

        total = Decimal("0")
        item_rows = []
        for it in d.items:
            line = _money(it.quantity * it.unit_price)
            total += line
            item_rows.append((it.description, it.quantity, it.unit, it.unit_price, line))

        row = conn.execute(
            """insert into public.invoices
               (freelancer_id, client_id, due_date, note, currency, total, status)
               values (%s,%s,%s,%s,%s,%s,'draft')
               returning id, created_at""",
            (freelancer_id, d.client_id, d.due_date, d.note, d.currency, total),
        ).fetchone()
        new_id, created_at = row[0], row[1]

        inserted_items = []
        for it in item_rows:
            r = conn.execute(
                """insert into public.invoice_items
                   (invoice_id, description, quantity, unit, unit_price, line_total)
                   values (%s,%s,%s,%s,%s,%s) returning id""",
                (new_id, it[0], it[1], it[2], it[3], it[4]),
            ).fetchone()
            inserted_items.append(ItemOut(
                id=r[0], description=it[0], quantity=it[1],
                unit=it[2], unit_price=it[3], line_total=it[4],
            ))

        return InvoiceOut(
            id=new_id,
            client_id=d.client_id,
            client_name=client_name,
            status="draft",
            number=None,
            sequence_number=None,
            number_year=None,
            issue_date=None,
            due_date=d.due_date,
            currency=d.currency,
            total=total,
            paid_at=None,
            cancelled_at=None,
            cancellation_reason=None,
            note=d.note,
            created_at=created_at,
            items=inserted_items,
            payment_rail=None,
            credit_notes=[],
            has_credit_notes=False,
            total_credited=Decimal("0.00"),
            snapshot=None,
            audit_log=[],
        )


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
            f_row = cur.fetchone()
            if not f_row:
                return None
            f = dict(zip([d.name for d in cur.description], f_row))

            report = completeness(f)
            if not report["can_issue_invoices"]:
                raise ProfileIncomplete(report["missing_for_invoicing"])

            # 2. Combine invoice check, item count, and client lookup in 1 query
            inv_row = conn.execute(
                """select i.status, i.client_id, i.total,
                          (select count(*) from public.invoice_items where invoice_id = i.id),
                          t.code, c.name, c.address, c.rc, c.nif, c.nis
                   from public.invoices i
                   join public.clients c on c.id = i.client_id
                   join public.client_types t on t.id = c.client_type_id
                   where i.id = %s and i.freelancer_id = %s and c.archived_at is null
                   for update of i""",
                (invoice_id, freelancer_id),
            ).fetchone()

            if inv_row is None:
                exists = conn.execute("select id from public.invoices where id=%s and freelancer_id=%s", (invoice_id, freelancer_id)).fetchone()
                if not exists:
                    return None
                raise ClientInvalid()

            inv_status, client_id, inv_total, n_items, c_type, c_name, c_addr, c_rc, c_nif, c_nis = inv_row

            if inv_status != "draft":
                raise InvalidState("invoice already issued")
            if n_items == 0:
                raise InvalidState("add at least one item before issuing")

            # 3. next number: counter (restarts each year), never below highest used
            counter = f["last_invoice_number"] if f["last_invoice_year"] == year else 0
            highest = conn.execute(
                """select coalesce(max(sequence_number), 0) from public.invoices
                   where freelancer_id=%s and number_year=%s""",
                (freelancer_id, year),
            ).fetchone()[0]
            seq = max(counter, highest) + 1

            # 4. snapshot (immutable)
            conn.execute(
                """insert into public.invoice_snapshots
                   (invoice_id, seller_name, seller_address, seller_nif, seller_ai,
                    seller_card_number, seller_rib, client_type, client_name,
                    client_address, client_rc, client_nif, client_nis)
                   values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (invoice_id, f"{f['first_name']} {f['last_name']}",
                 f["trade_address"], f["nif"], f["ai_number"],
                 f["anae_card_number"], f["rib"],
                 c_type, c_name, c_addr, c_rc, c_nif, c_nis),
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
            _event(conn, invoice_id, freelancer_id, "issued", details={
                "number": _number(seq, year),
                "issue_date": today.isoformat(),
                "total": str(inv_total),
            })
    except UniqueViolation as exc:
        raise NumberTaken() from exc
    return get(freelancer_id, invoice_id)


# ---------------- status changes ----------------
def _transition(freelancer_id, invoice_id, allowed, fn):
    with pool.connection() as conn:
        row = conn.execute(
             """select status, issue_date, paid_at, payment_rail from public.invoices
               where id=%s and freelancer_id=%s for update""",
            (invoice_id, freelancer_id),
        ).fetchone()
        if row is None:
            return None
        if row[0] not in allowed:
            raise InvalidState(f"not allowed from status '{row[0]}'")
        fn(conn, row)

        # Retrieve updated invoice and relations within the same connection
        r = conn.execute(
            f"select {COLUMNS} from {FROM} where i.id = %s and i.freelancer_id = %s",
            (invoice_id, freelancer_id),
        ).fetchone()
        if not r:
            return None
        items = _items_by_invoice(conn, [r[0]])[r[0]]
        cns = _credit_notes_by_invoice(conn, [invoice_id])[invoice_id]
        out = _to_out(r, items, cns)
        out.snapshot = _snapshot(conn, invoice_id)
        out.audit_log = _audit_log(conn, invoice_id)
        return out


class InvalidPaymentDate(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        
def mark_paid(freelancer_id, invoice_id, paid_at: date, payment_rail: str | None = None):
    def run(conn, row):
        if paid_at > _today():
            raise InvalidPaymentDate(
                "PAYMENT_DATE_IN_FUTURE",
                "The payment date cannot be in the future.")
        if paid_at < row[1]:
            raise InvalidPaymentDate(
                "PAYMENT_DATE_BEFORE_ISSUE_DATE",
                "The payment date cannot be before the invoice issue date.")
        conn.execute(
            """update public.invoices
               set status='paid', paid_at=%s, payment_rail=%s where id=%s""",
            (paid_at, payment_rail, invoice_id),
        )
        _event(conn, invoice_id, freelancer_id, "paid", details={
            "paid_at": paid_at.isoformat(),
            "payment_rail": payment_rail,
        })
    return _transition(freelancer_id, invoice_id, {"issued"}, run)


def revert_payment(freelancer_id, invoice_id):
    removed = {}

    def run(conn, row):
        removed["paid_at"] = row[2]
        conn.execute(
            """update public.invoices
               set status='issued', paid_at=null, payment_rail=null where id=%s""",
            (invoice_id,),
        )
        _event(conn, invoice_id, freelancer_id, "unpaid", row[2], details={
            "removed_paid_at": row[2].isoformat(),
            "removed_payment_rail": row[3],
        })  # the removed date
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
        _event(conn, invoice_id, freelancer_id, "cancelled",
               details={"reason": reason})
    return _transition(freelancer_id, invoice_id, {"issued"}, run)   # not from paid


def create_credit_note(freelancer_id: int, invoice_id: int, reason: str, credit_amount: Decimal) -> dict:
    today = _today()
    year = today.year
    with pool.connection() as conn:
        inv = conn.execute(
            """select i.id, i.status, i.sequence_number, i.number_year, i.total,
                      coalesce((select sum(c.amount) from public.credit_notes c where c.invoice_id = i.id), 0)
               from public.invoices i
               where i.id = %s and i.freelancer_id = %s
               for update of i""",
            (invoice_id, freelancer_id),
        ).fetchone()
        if inv is None:
            return None
        if inv[1] not in ("issued", "paid"):
            raise InvalidState(f"Cannot issue credit note for invoice in status '{inv[1]}'. Must be issued or paid.")

        already_credited = Decimal(str(inv[5]))
        invoice_total = Decimal(str(inv[4]))

        if already_credited + credit_amount > invoice_total:
            raise InvalidState(
                f"Credit amount {credit_amount:,.2f} exceeds remaining balance ({invoice_total - already_credited:,.2f} DZD)"
            )

        # Get next sequence number for this freelancer & year
        seq_row = conn.execute(
            """select coalesce(max(sequence_number), 0) from public.credit_notes
               where freelancer_id = %s and number_year = %s""",
            (freelancer_id, year),
        ).fetchone()
        next_seq = seq_row[0] + 1
        credit_note_num = f"AV-{year}-{next_seq:03d}"

        cn_row = conn.execute(
            """insert into public.credit_notes (
                   freelancer_id, invoice_id, credit_note_number, sequence_number,
                   number_year, amount, reason, issue_date
               ) values (%s, %s, %s, %s, %s, %s, %s, %s)
               returning id, created_at""",
            (freelancer_id, invoice_id, credit_note_num, next_seq, year, credit_amount, reason, today),
        ).fetchone()
        cn_id = cn_row[0]

        orig_num = _number(inv[2], inv[3]) or f"FAC-{inv[0]}"

        return {
            "id": f"cn_{cn_id}",
            "credit_note_number": credit_note_num,
            "original_invoice_id": str(invoice_id),
            "original_invoice_number": orig_num,
            "amount": credit_amount,
            "issue_date": today.isoformat(),
        }


