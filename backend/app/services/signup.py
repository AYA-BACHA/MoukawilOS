"""app/services/signup.py

One call = auth account + freelancer row (+ preferences row, done by
create_freelancer). If the second step fails, the auth account is removed so
nobody is left with a login that has no user behind it.
"""
import logging

from app.core import supabase_auth as sb
from app.repositories.freelancers import AlreadyOnboarded, create_freelancer
from app.schemas.auth import SessionOut, SignupIn, SignupOut
from app.schemas.onboarding import OnboardingIn
from app.services.profile import completeness

log = logging.getLogger(__name__)


class EmailTaken(Exception):
    pass


def signup(data: SignupIn) -> SignupOut:
    # profile part only: the password never goes past this function
    profile = OnboardingIn(**data.model_dump(exclude={"email", "password"}))

    body = sb.sign_up(str(data.email).lower(), data.password)   # may raise SupabaseError
    user = body.get("user", body)

    # With email confirmation ON, Supabase hides "email already used" by returning
    # a fake user with no identities instead of an error.
    if user.get("identities") == []:
        raise EmailTaken()
    user_id = user["id"]

    try:
        freelancer_id = create_freelancer(user_id, profile)
    except AlreadyOnboarded:
        # This auth user already has a freelancer (e.g. an unconfirmed account
        # signing up again). Do NOT delete it: it belongs to someone.
        raise EmailTaken()
    except Exception:
        try:
            sb.delete_user(user_id)  # undo: no half-created account
        except Exception:            # never let the cleanup hide the original error
            log.exception("rollback failed: auth user %s was left behind", user_id)
        raise

    session = None
    if "access_token" in body:       # confirmation OFF: the user is logged in
        session = SessionOut(
            access_token=body["access_token"],
            refresh_token=body["refresh_token"],
            expires_in=body["expires_in"],
        )
    return SignupOut(
        freelancer_id=freelancer_id,
        onboarding_completed=completeness(profile.model_dump())["can_issue_invoices"],
        email_confirmation_required=session is None,
        session=session,
    )