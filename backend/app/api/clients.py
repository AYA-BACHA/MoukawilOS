from fastapi import APIRouter, Depends, HTTPException, status , Query

from app.core.security import get_current_freelancer_id
from app.repositories import clients as repo
from app.schemas.clients import ClientCreate, ClientOut, ClientUpdate , ClientPage
from fastapi import Query


router = APIRouter(prefix="/clients", tags=["clients"])


def _not_found():
    return HTTPException(status.HTTP_404_NOT_FOUND, "client not found")


@router.post("", response_model=ClientOut, status_code=201)
def create_client(data: ClientCreate, fid: int = Depends(get_current_freelancer_id)):
    try:
        return repo.create(fid, data)
    except repo.DuplicateNif:
        raise HTTPException(status.HTTP_409_CONFLICT, "a client with this NIF already exists")


@router.get("")
def list_clients(
    archived: bool = False,
    q: str | None = Query(None, max_length=100),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    fid: int = Depends(get_current_freelancer_id),
):
    items, total = repo.list_all(fid, archived, q, limit, offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}

@router.get("/{client_id}", response_model=ClientOut)
def get_client(client_id: int, fid: int = Depends(get_current_freelancer_id)):
    c = repo.get(fid, client_id)
    if c is None:
        raise _not_found()
    return c


@router.put("/{client_id}", response_model=ClientOut)
def update_client(client_id: int, data: ClientUpdate,
                  fid: int = Depends(get_current_freelancer_id)):
    try:
        c = repo.update(fid, client_id, data)
    except repo.DuplicateNif:
        raise HTTPException(status.HTTP_409_CONFLICT, "a client with this NIF already exists")
    if c is None:
        raise _not_found()
    return c


@router.post("/{client_id}/archive", response_model=ClientOut)
def archive_client(client_id: int, fid: int = Depends(get_current_freelancer_id)):
    c = repo.set_archived(fid, client_id, True)
    if c is None:
        raise _not_found()
    return c


@router.post("/{client_id}/restore", response_model=ClientOut)
def restore_client(client_id: int, fid: int = Depends(get_current_freelancer_id)):
    c = repo.set_archived(fid, client_id, False)
    if c is None:
        raise _not_found()
    return c


