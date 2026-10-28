"""app/services/invoices.py

Business rules only: validation, state machine, numbering, money maths,
"today", audit event content. All SQL lives in app/repositories/invoices.py.
The service owns each transaction and passes `conn` to the repo.
"""
from datetime import date, datetime
from decimal import ROUND_HALF_UP, Decimal
from zoneinfo import ZoneInfo

from app.repositories import clients as clients_repo
from app.repositories import invoices as repo
from app.repositories.invoices import NumberTaken  # noqa: F401  (re-exported for the router)
from app.schemas.invoices import InvoiceCreate, InvoiceOut, InvoiceUpdate
from app.services.profile import completeness

TZ = ZoneInfo("Africa/Algiers")
CENT = Decimal("0.01")


# ---------------- domain errors ----------------
class InvalidState(Exception):
    pass


class ClientInvalid(Exception):
    pass


class ProfileIncomplete(Exception):
    def __init__(self, missing):
        self.missing = missing


class InvalidPaymentDate(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message


# ---------------- small pure helpers ----------------
def _today() -> date:
    return datetime.now(TZ).date()


def _money(x: Decimal) -> Decimal:
    return x.quantize(CENT, rounding=ROUND_HALF_UP)


def _number(seq, year):
    return f"FAC-{year}-{seq:03d}" if seq else None


def _price(items) -> tuple[list[dict], Decimal]:
    """Compute each line total and the invoice total."""
    lines, total = [], Decimal("0")
    for it in items:
        line = _money(it.quantity * it.unit_price)
        total += line
        lines.append(dict(description=it.description, quantity=it.quantity,
                          unit=it.unit, unit_price=it.unit_price, line_total=line))
    return lines, total


def _next_sequence(counter_number: int, counter_year: int | None,
                   highest_used: int, year: int) -> int:
    """Counter restarts each year, and never goes below the highest number used."""
    counter = counter_number if counter_year == year else 0
    return max(counter, highest_used) + 1


def _check_client(freelancer_id: int, client_id: int) -> None:
    c = clients_repo.get(freelancer_id, client_id)
    if c is None or c.archived_at is not None:
        raise ClientInvalid()


def _lock_in_status(conn, freelancer_id, invoice_id, allowed: set[str]):
    """Lock the invoice and check the state machine. None if not found."""
    inv = repo.lock_invoice(conn, freelancer_id, invoice_id)
    if inv is None:
        return None
    if inv["status"] not in allowed:
        raise InvalidState(f"not allowed from status '{inv['status']}'")
    return inv


# ---------------- read ----------------
def get(freelancer_id: int, invoice_id: int) -> InvoiceOut | None:
    return repo.get(freelancer_id, invoice_id)


def list_invoices(freelancer_id: int, status, client_id, q, date_from, date_to,
                  limit: int, offset: int):
    return repo.list_all(freelancer_id, status, client_id, q,
                         date_from, date_to, limit, offset)


# ---------------- drafts ----------------
def create(freelancer_id: int, d: InvoiceCreate) -> InvoiceOut:
    _check_client(freelancer_id, d.client_id)
    lines, total = _price(d.items)
    with repo.transaction() as conn:
        new_id = repo.insert_draft(conn, freelancer_id, d)
        repo.replace_items(conn, new_id, lines)
        repo.set_total(conn, new_id, total)
    return repo.get(freelancer_id, new_id)


def update_draft(freelancer_id: int, invoice_id: int, d: InvoiceUpdate) -> InvoiceOut | None:
    _check_client(freelancer_id, d.client_id)
    lines, total = _price(d.items)
    with repo.transaction() as conn:
        inv = repo.lock_invoice(conn, freelancer_id, invoice_id)
        if inv is None:
            return None
        if inv["status"] != "draft":
            raise InvalidState("only drafts can be edited")
        repo.replace_items(conn, invoice_id, lines)
        repo.update_draft_header(conn, invoice_id, d, total)
    return repo.get(freelancer_id, invoice_id)


def delete_draft(freelancer_id: int, invoice_id: int) -> bool:
    with repo.transaction() as conn:
        inv = repo.lock_invoice(conn, freelancer_id, invoice_id)
        if inv is None:
            return False
        if inv["status"] != "draft":
            raise InvalidState("only drafts can be deleted, cancel it instead")
        repo.delete_invoice(conn, invoice_id)
    return True


# ---------------- issue ----------------
def issue(freelancer_id: int, invoice_id: int) -> InvoiceOut | None:
    today = _today()
    year = today.year
    with repo.transaction() as conn:
        # 1. lock the freelancer: serializes numbering
        f = repo.lock_freelancer(conn, freelancer_id)

        report = completeness(f)
        if not report["can_issue_invoices"]:
            raise ProfileIncomplete(report["missing_for_invoicing"])

        inv = repo.lock_invoice(conn, freelancer_id, invoice_id)
        if inv is None:
            return None
        if inv["status"] != "draft":
            raise InvalidState("invoice already issued")
        if repo.count_items(conn, invoice_id) == 0:
            raise InvalidState("add at least one item before issuing")

        # 2. next number
        seq = _next_sequence(
            f["last_invoice_number"], f["last_invoice_year"],
            repo.highest_sequence(conn, freelancer_id, year), year,
        )

        # 3. immutable snapshot of seller and client
        client = repo.get_active_client(conn, freelancer_id, inv["client_id"])
        if client is None:
            raise ClientInvalid()
        seller = dict(
            name=f"{f['first_name']} {f['last_name']}",
            address=f["trade_address"], nif=f["nif"], ai=f["ai_number"],
            card_number=f["anae_card_number"], rib=f["rib"],
        )
        repo.insert_snapshot(conn, invoice_id, seller, client)

        # 4. issue + advance the counter + audit
        repo.mark_issued(conn, invoice_id, seq, year, today)   # may raise NumberTaken
        repo.set_freelancer_counter(conn, freelancer_id, seq, year)
        repo.add_event(conn, invoice_id, freelancer_id, "issued", details={
            "number": _number(seq, year),
            "issue_date": today.isoformat(),
            "total": str(inv["total"]),
        })
    return repo.get(freelancer_id, invoice_id)


# ---------------- status changes ----------------
def mark_paid(freelancer_id: int, invoice_id: int, paid_at: date,
              payment_rail: str | None = None) -> InvoiceOut | None:
    with repo.transaction() as conn:
        inv = _lock_in_status(conn, freelancer_id, invoice_id, {"issued"})
        if inv is None:
            return None
        if paid_at > _today():
            raise InvalidPaymentDate(
                "PAYMENT_DATE_IN_FUTURE",
                "The payment date cannot be in the future.")
        if paid_at < inv["issue_date"]:
            raise InvalidPaymentDate(
                "PAYMENT_DATE_BEFORE_ISSUE_DATE",
                "The payment date cannot be before the invoice issue date.")
        repo.mark_paid(conn, invoice_id, paid_at, payment_rail)
        repo.add_event(conn, invoice_id, freelancer_id, "paid", details={
            "paid_at": paid_at.isoformat(),
            "payment_rail": payment_rail,
        })
    return repo.get(freelancer_id, invoice_id)


def revert_payment(freelancer_id: int, invoice_id: int) -> InvoiceOut | None:
    with repo.transaction() as conn:
        inv = _lock_in_status(conn, freelancer_id, invoice_id, {"paid"})
        if inv is None:
            return None
        removed_paid_at = inv["paid_at"]
        repo.mark_unpaid(conn, invoice_id)
        repo.add_event(conn, invoice_id, freelancer_id, "unpaid", removed_paid_at,
                       details={
                           "removed_paid_at": removed_paid_at.isoformat(),
                           "removed_payment_rail": inv["payment_rail"],
                       })
    out = repo.get(freelancer_id, invoice_id)
    if out and removed_paid_at.year < _today().year:
        out.warning = ("This payment belongs to a previous year, "
                       "it may no longer match your declaration.")
    return out


def cancel(freelancer_id: int, invoice_id: int, reason: str) -> InvoiceOut | None:
    with repo.transaction() as conn:
        inv = _lock_in_status(conn, freelancer_id, invoice_id, {"issued"})  # not from paid
        if inv is None:
            return None
        repo.mark_cancelled(conn, invoice_id, reason)
        repo.add_event(conn, invoice_id, freelancer_id, "cancelled",
                       details={"reason": reason})
    return repo.get(freelancer_id, invoice_id)