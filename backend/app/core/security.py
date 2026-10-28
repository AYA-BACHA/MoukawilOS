from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.core.config import settings
from app.core.db import pool

bearer = HTTPBearer(auto_error=False)


@lru_cache
def _jwks() -> PyJWKClient:
    """Created on first use (not at import), so a missing SUPABASE_URL is reported
    by settings.check_required() at startup instead of crashing the import.
    Public keys are fetched once and cached by the client."""
    return PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")


def get_current_user_id(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> str:
    """Verify the Supabase token and return the user id (auth.users.id)."""
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing token")
    try:
        key = _jwks().get_signing_key_from_jwt(creds.credentials)
        payload = jwt.decode(
            creds.credentials,
            key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
    except jwt.PyJWKClientConnectionError as exc:      # Supabase unreachable: not the user's fault
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE,
                            "authentication service unavailable") from exc
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