import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.core.config import settings
from app.core.db import pool

bearer = HTTPBearer(auto_error=False)

# Public keys are fetched once and cached
_jwks = PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")


def get_current_user_id(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> str:
    """Verify the Supabase token and return the user id (auth.users.id)."""
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing token")

    # Explicit, opt-in guest demo mode (requires enable_demo_mode=True and exact token match)
    if (
        settings.enable_demo_mode
        and (creds.credentials == "demo" or (settings.demo_auth_token and creds.credentials == settings.demo_auth_token))
    ):
        return settings.demo_user_id

    if settings.app_env == "development" and settings.test_user_id and creds.credentials in ("test", "demo", "dev", settings.test_user_id):
        return settings.test_user_id

    try:
        header = jwt.get_unverified_header(creds.credentials)
        alg = header.get("alg", "ES256")
        if alg == "HS256" and settings.supabase_jwt_secret:
            payload = jwt.decode(
                creds.credentials,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
        else:
            key = _jwks.get_signing_key_from_jwt(creds.credentials)
            payload = jwt.decode(
                creds.credentials,
                key.key,
                algorithms=["ES256"],
                audience="authenticated",
            )
    except jwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token") from exc
    return payload["sub"]


def get_current_freelancer_id(user_id: str = Depends(get_current_user_id)) -> int:
    """Return the freelancer id of the logged-in user (404 if onboarding not done)."""
    if pool.closed:
        try:
            pool.open(wait=True, timeout=10)
        except Exception as exc:
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "database pool unavailable") from exc
    with pool.connection() as conn:
        row = conn.execute(
            "select id from public.freelancers where profile_id = %s", (user_id,)
        ).fetchone()
        if (
            row is None
            and not os.getenv("PYTEST_CURRENT_TEST")
            and (
                (settings.enable_demo_mode and user_id == settings.demo_user_id)
                or settings.app_env == "development"
            )
        ):
            # In demo mode or development, fallback to the populated demo freelancer (Sara Benali)
            row = conn.execute(
                "select id from public.freelancers order by (select count(*) from public.invoices where freelancer_id = public.freelancers.id) desc limit 1"
            ).fetchone()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "freelancer profile not created")
    return row[0]
