from fastapi import APIRouter, Depends

from app.core.security import get_current_freelancer_id
from app.repositories import profile as repo
from app.schemas.profile import PreferencesUpdate, ProfileUpdate

from fastapi import HTTPException

router = APIRouter(tags=["profile"])


@router.get("/profile")
def read_profile(fid: int = Depends(get_current_freelancer_id)):
    return repo.get(fid)



@router.patch("/profile")
def update_profile(data: ProfileUpdate, fid: int = Depends(get_current_freelancer_id)):
    try:
        return repo.patch(fid, data)
    except repo.CounterLocked:
        raise HTTPException(409, "invoice counter can no longer be changed")


@router.get("/preferences")
def read_preferences(fid: int = Depends(get_current_freelancer_id)):
    return repo.get_preferences(fid)


@router.patch("/preferences")
def update_preferences(data: PreferencesUpdate,
                       fid: int = Depends(get_current_freelancer_id)):
    return repo.patch_preferences(fid, data)