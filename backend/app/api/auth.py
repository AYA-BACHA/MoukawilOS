"""app/api/auth.py  (public: no token needed)"""
import logging

from fastapi import APIRouter, HTTPException

from app.core.supabase_auth import SupabaseError
from app.schemas.auth import SigninIn, SigninOut, SignupIn, SignupOut
from app.services import signin as signin_svc
from app.services import signup as signup_svc

log = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])

EMAIL_TAKEN = ("user_already_exists", "email_exists")
INVALID_CREDENTIALS = ("invalid_credentials",)


@router.post("/auth/signup", response_model=SignupOut, status_code=201)
def signup(data: SignupIn):
    try:
        return signup_svc.signup(data)
    except signup_svc.EmailTaken:
        raise HTTPException(409, "this email is already registered")
    except SupabaseError as e:
        if e.code in EMAIL_TAKEN:
            raise HTTPException(409, "this email is already registered")
        if e.code == "weak_password":
            raise HTTPException(422, e.message)
        if e.status == 429:
            raise HTTPException(429, "too many attempts, try again later")
        if e.status in (400, 422):
            raise HTTPException(422, e.message)
        log.error("supabase signup failed: %s %s %s", e.status, e.code, e.message)
        raise HTTPException(502, "authentication service unavailable")


@router.post("/auth/signin", response_model=SigninOut)
def signin(data: SigninIn):
    try:
        return signin_svc.signin(data)
    except SupabaseError as e:
        if e.code in INVALID_CREDENTIALS:
            raise HTTPException(401, "incorrect email or password")
        if e.code == "email_not_confirmed":
            raise HTTPException(403, "please confirm your email before signing in")
        if e.code == "user_banned":
            raise HTTPException(403, "this account has been suspended")
        if e.status == 429:
            raise HTTPException(429, "too many attempts, try again later")
        if e.status in (400, 422):
            raise HTTPException(422, e.message)
        log.error("supabase signin failed: %s %s %s", e.status, e.code, e.message)
        raise HTTPException(502, "authentication service unavailable")