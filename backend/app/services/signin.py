"""app/services/signin.py"""
from app.core.supabase_auth import sign_in
from app.schemas.auth import SigninIn, SigninOut


def signin(data: SigninIn) -> SigninOut:
    session = sign_in(data.email, data.password)
    return SigninOut(
        access_token=session["access_token"],
        refresh_token=session["refresh_token"],
        token_type=session.get("token_type", "bearer"),
        expires_in=session["expires_in"],
    )