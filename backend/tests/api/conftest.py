import os
from concurrent.futures import ThreadPoolExecutor  # noqa: F401

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient

load_dotenv()

from app.core.db import pool  # noqa: E402
from app.core.security import get_current_user_id  # noqa: E402
from app.main import app  # noqa: E402

TEST_USER_ID = os.getenv("TEST_USER_ID")

pytestmark = pytest.mark.skipif(not TEST_USER_ID, reason="TEST_USER_ID not set")

COMPLETE_PROFILE = {
    "trade_address": "Alger centre",
    "nif": "123456789012345",
    "rib": "12345678963258741023",
    "anae_card_number": "26-123456",
    "anae_card_issue_date": "2026-03-10",
}


def wipe(user_id: str):
    """Delete every row of the test user. Test data only."""
    with pool.connection() as conn:
        row = conn.execute(
            "select id from public.freelancers where profile_id = %s", (user_id,)
        ).fetchone()
        if row is None:
            return
        fid = row[0]
        conn.execute("alter table public.invoice_audit_events disable trigger audit_append_only")
        conn.execute("alter table public.invoice_items disable trigger items_frozen")
        conn.execute("alter table public.invoice_snapshots disable trigger snapshots_immutable")
        inv = "select id from public.invoices where freelancer_id = %s"
        conn.execute("delete from public.invoice_audit_events where freelancer_id = %s", (fid,))
        conn.execute(f"delete from public.invoice_snapshots where invoice_id in ({inv})", (fid,))
        conn.execute(f"delete from public.invoice_items where invoice_id in ({inv})", (fid,))
        conn.execute("delete from public.invoices where freelancer_id = %s", (fid,))
        conn.execute("delete from public.clients where freelancer_id = %s", (fid,))
        conn.execute("delete from public.obligation_completions where freelancer_id = %s", (fid,))
        conn.execute("delete from public.manual_income_entries where freelancer_id = %s", (fid,))
        conn.execute("delete from public.user_preferences where freelancer_id = %s", (fid,))
        conn.execute("delete from public.freelancers where id = %s", (fid,))
        conn.execute("alter table public.invoice_audit_events enable trigger audit_append_only")
        conn.execute("alter table public.invoice_items enable trigger items_frozen")
        conn.execute("alter table public.invoice_snapshots enable trigger snapshots_immutable")


@pytest.fixture(scope="session")
def client():
    if not TEST_USER_ID:
        pytest.skip("TEST_USER_ID not set")
    app.dependency_overrides[get_current_user_id] = lambda: TEST_USER_ID
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def fresh(client):
    """Clean slate + a minimal (incomplete) freelancer before every test."""
    wipe(TEST_USER_ID)
    r = client.post("/onboarding", json={"first_name": "Sara", "last_name": "Test"})
    assert r.status_code == 201, r.text
    yield
    wipe(TEST_USER_ID)


@pytest.fixture
def complete(client):
    r = client.patch("/profile", json=COMPLETE_PROFILE)
    assert r.status_code == 200 and r.json()["completeness"]["can_issue_invoices"]


@pytest.fixture
def cid(client):
    r = client.post("/clients", json={
        "client_type": "B2C", "name": "Client Particulier", "address": "Blida"})
    assert r.status_code == 201
    return r.json()["id"]


@pytest.fixture
def blank(client):
    """Test user with NO freelancer row (to test onboarding itself)."""
    wipe(TEST_USER_ID)
    yield