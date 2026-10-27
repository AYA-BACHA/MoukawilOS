from fastapi import APIRouter, Depends

from app.core.security import get_current_freelancer_id, get_current_user_id

router = APIRouter(tags=["me"])


@router.get("/me")
def me(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id}


@router.get("/me/freelancer")
def me_freelancer(freelancer_id: int = Depends(get_current_freelancer_id)):
    return {"freelancer_id": freelancer_id}