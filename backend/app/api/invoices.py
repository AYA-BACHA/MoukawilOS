from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.security import get_current_freelancer_id
from app.repositories import invoices as repo
from app.schemas.invoices import (
    CancelRequest, InvoiceCreate, InvoiceOut, InvoiceUpdate, InvoicePage ,
     PayRequest,
)

from fastapi import Query
from datetime import date
from app.core.lookups import InvoiceStatus

router = APIRouter(prefix="/invoices", tags=["invoices"])


def _nf():
    return HTTPException(status.HTTP_404_NOT_FOUND, "invoice not found")


def _guard(fn):
    """Run a repo call and map domain errors to HTTP errors."""
    try:
        r = fn()
    except repo.ClientInvalid:
        raise HTTPException(422, "client not found or archived")
    except repo.InvalidState as e:
        raise HTTPException(409, str(e))
    except repo.ProfileIncomplete as e:
        raise HTTPException(422, {"code": "profile_incomplete", "missing": e.missing})
    except repo.NumberTaken:
        raise HTTPException(409, "this invoice number already exists, retry")
    except repo.InvalidPaymentDate as e:
        raise HTTPException(400, {"code": e.code, "message": e.message})
    if r is None:
        raise _nf()
    return r


@router.post("", response_model=InvoiceOut, status_code=201)
def create_invoice(data: InvoiceCreate, fid: int = Depends(get_current_freelancer_id)):
    return _guard(lambda: repo.create(fid, data))

@router.get("", response_model=InvoicePage)
def list_invoices(
    status_: InvoiceStatus | None = Query(None, alias="status"),
    client_id: int | None = None,
    q: str | None = Query(None, max_length=100),
    date_from: date | None = Query(None, alias="from"),
    date_to: date | None = Query(None, alias="to"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    fid: int = Depends(get_current_freelancer_id),
):
    items, total = repo.list_all(fid, status_, client_id, q, date_from, date_to, limit, offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, fid: int = Depends(get_current_freelancer_id)):
    return _guard(lambda: repo.get(fid, invoice_id))


@router.put("/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, data: InvoiceUpdate,
                   fid: int = Depends(get_current_freelancer_id)):
    return _guard(lambda: repo.update_draft(fid, invoice_id, data))


@router.delete("/{invoice_id}", status_code=204)
def delete_invoice(invoice_id: int, fid: int = Depends(get_current_freelancer_id)):
    _guard(lambda: repo.delete_draft(fid, invoice_id) or None)
    return Response(status_code=204)


@router.post("/{invoice_id}/issue", response_model=InvoiceOut)
def issue_invoice(invoice_id: int, fid: int = Depends(get_current_freelancer_id)):
    return _guard(lambda: repo.issue(fid, invoice_id))


@router.post("/{invoice_id}/pay", response_model=InvoiceOut)
def pay_invoice(invoice_id: int, data: PayRequest,
                fid: int = Depends(get_current_freelancer_id)):
    return _guard(lambda: repo.mark_paid(fid, invoice_id, data.paid_at, data.payment_rail))


@router.post("/{invoice_id}/revert-payment", response_model=InvoiceOut)
def revert_payment(invoice_id: int, fid: int = Depends(get_current_freelancer_id)):
    return _guard(lambda: repo.revert_payment(fid, invoice_id))


@router.post("/{invoice_id}/cancel", response_model=InvoiceOut)
def cancel_invoice(invoice_id: int, data: CancelRequest,
                   fid: int = Depends(get_current_freelancer_id)):
    return _guard(lambda: repo.cancel(fid, invoice_id, data.reason))