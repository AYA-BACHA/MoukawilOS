from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.repositories.freelancers import AlreadyOnboarded, create_freelancer
from app.schemas.onboarding import OnboardingIn, OnboardingOut

router = APIRouter(tags=["onboarding"])


@router.post("/onboarding", response_model=OnboardingOut, status_code=201)
def onboarding(data: OnboardingIn, user_id: str = Depends(get_current_user_id)):
    try:
        freelancer_id = create_freelancer(user_id, data)
    except AlreadyOnboarded:
        raise HTTPException(status.HTTP_409_CONFLICT, "already onboarded")
    return OnboardingOut(freelancer_id=freelancer_id)