"""app/schemas/auth.py"""
from typing import Annotated
from pydantic import BaseModel, Field, StringConstraints

try:
    import email_validator  # noqa: F401
    from pydantic import EmailStr
except Exception:
    EmailStr = Annotated[str, StringConstraints(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")]  # type: ignore

from app.schemas.onboarding import OnboardingIn


class SignupIn(OnboardingIn):
    """Same profile fields as onboarding (first and last name required, the rest
    optional) plus the login credentials.

    - minimal signup: first_name, last_name, email, password
    - full signup   : everything, so the profile is complete right away
    """
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class SessionOut(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "bearer"


class SignupOut(BaseModel):
    freelancer_id: int
    # True when the profile is complete enough to issue invoices
    onboarding_completed: bool
    # True when Supabase sent a confirmation email: no session until it is clicked
    email_confirmation_required: bool
    session: SessionOut | None = None

class SigninIn(BaseModel):
    email: EmailStr
    password: str


class SigninOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
