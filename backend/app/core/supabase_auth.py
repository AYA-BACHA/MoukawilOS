"""app/core/supabase_auth.py

Thin HTTP client for the Supabase Auth (GoTrue) REST API.
Needs in settings: supabase_url, supabase_anon_key, supabase_service_role_key
(the service role key is a SECRET: backend only, never sent to the frontend).
"""
import logging

import httpx

from app.core.config import settings

log = logging.getLogger(__name__)
TIMEOUT = 10.0


class SupabaseError(Exception):
    def __init__(self, status: int, code: str | None, message: str):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


def _headers(key: str) -> dict:
    return {"apikey": key, "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"}


def sign_up(email: str, password: str) -> dict:
    """Public sign-up. Sends the confirmation email if it is enabled in Supabase.

    Returns the raw body:
      - confirmation OFF: {access_token, refresh_token, expires_in, user: {...}}
      - confirmation ON : the user object itself ({id, email, identities, ...})
    """
    r = httpx.post(
        f"{settings.supabase_url}/auth/v1/signup",
        headers=_headers(settings.supabase_anon_key),
        json={"email": email, "password": password},
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        try:
            body = r.json()
        except ValueError:
            body = {}
        raise SupabaseError(
            r.status_code,
            body.get("error_code") or body.get("code"),
            body.get("msg") or body.get("message") or "sign-up failed",
        )
    return r.json()


def delete_user(user_id: str) -> None:
    """Best effort: used to undo a sign-up when the freelancer row failed."""
    try:
        r = httpx.delete(
            f"{settings.supabase_url}/auth/v1/admin/users/{user_id}",
            headers=_headers(settings.supabase_service_role_key),
            timeout=TIMEOUT,
        )
        if r.status_code >= 400:
            log.error("could not delete auth user %s: %s %s", user_id, r.status_code, r.text)
    except httpx.HTTPError:
        log.exception("could not delete auth user %s", user_id)


def sign_in(email: str, password: str) -> dict:
    """Password grant sign-in.

    Returns the raw body: {access_token, token_type, expires_in, expires_at,
    refresh_token, user: {...}}
    """
    r = httpx.post(
        f"{settings.supabase_url}/auth/v1/token?grant_type=password",
        headers=_headers(settings.supabase_anon_key),
        json={"email": email, "password": password},
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        try:
            body = r.json()
        except ValueError:
            body = {}
        raise SupabaseError(
            r.status_code,
            body.get("error_code") or body.get("code"),
            body.get("msg") or body.get("message") or "sign-in failed",
        )
    return r.json()