from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.security import get_current_freelancer_id
from app.repositories import manual_income as repo
from app.schemas.manual_income import ManualIncomeIn, ManualIncomeOut, ManualIncomePage , ManualIncomePatch
from app.services import compliance as svc

router = APIRouter(prefix="/manual-income", tags=["manual-income"])


def _check_date(d: date):
    if d > svc.today_dz():
        raise HTTPException(400, {
            "code": "RECEIVED_DATE_IN_FUTURE",
            "message": "The received date cannot be in the future.",
        })


def _nf():
    return HTTPException(404, "entry not found")


@router.post("", response_model=ManualIncomeOut, status_code=201)
def create_entry(data: ManualIncomeIn, fid: int = Depends(get_current_freelancer_id)):
    _check_date(data.received_date)
    return repo.create(fid, data)


@router.get("", response_model=ManualIncomePage)
def list_entries(
    year: int | None = Query(None, ge=2020, le=2100),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    fid: int = Depends(get_current_freelancer_id),
):
    items, total, amount = repo.list_all(fid, year, limit, offset)
    return {"items": items, "total": total, "limit": limit,
            "offset": offset, "total_amount_da": amount}


@router.get("/{entry_id}", response_model=ManualIncomeOut)
def get_entry(entry_id: int, fid: int = Depends(get_current_freelancer_id)):
    row = repo.get(fid, entry_id)
    if row is None:
        raise _nf()
    return row


@router.put("/{entry_id}", response_model=ManualIncomeOut)
def update_entry(entry_id: int, data: ManualIncomeIn,
                 fid: int = Depends(get_current_freelancer_id)):
    _check_date(data.received_date)
    row = repo.update(fid, entry_id, data)
    if row is None:
        raise _nf()
    return row


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, fid: int = Depends(get_current_freelancer_id)):
    if not repo.delete(fid, entry_id):
        raise _nf()
    return Response(status_code=204)


@router.patch("/{entry_id}", response_model=ManualIncomeOut)
def patch_entry(entry_id: int, data: ManualIncomePatch,
                fid: int = Depends(get_current_freelancer_id)):
    changes = data.model_dump(exclude_unset=True)
    if "received_date" in changes:
        _check_date(changes["received_date"])
    row = repo.patch(fid, entry_id, changes)
    if row is None:
        raise _nf()
    return row