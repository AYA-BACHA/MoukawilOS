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

    if settings.app_env == "development" and settings.test_user_id and creds.credentials in ("test", "demo", "dev", settings.test_user_id):
        return settings.test_user_id

    try:
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
    with pool.connection() as conn:
        row = conn.execute(
            "select id from public.freelancers where profile_id = %s", (user_id,)
        ).fetchone()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "freelancer profile not created")
    return row[0]