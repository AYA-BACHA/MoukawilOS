import os
import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import get_current_user_id
from app.main import app

DEMO_TOKEN = "moukawil_eval_secure_token_abc123"


@pytest.fixture
def auth_client(client):
    """Client with dependency overrides removed so security.py executes for real."""
    old = app.dependency_overrides.pop(get_current_user_id, None)
    try:
        yield client
    finally:
        if old:
            app.dependency_overrides[get_current_user_id] = old


def test_demo_auth_disabled_by_default(auth_client):
    """When enable_demo_mode is False, demo tokens are strictly rejected."""
    original_mode = settings.enable_demo_mode
    original_token = settings.demo_auth_token
    try:
        settings.enable_demo_mode = False
        settings.demo_auth_token = DEMO_TOKEN

        res = auth_client.get(
            "/dashboard/summary",
            headers={"Authorization": f"Bearer {DEMO_TOKEN}"},
        )
        assert res.status_code == 401
        assert res.json()["detail"] == "invalid token"
    finally:
        settings.enable_demo_mode = original_mode
        settings.demo_auth_token = original_token


def test_arbitrary_strings_rejected_in_production(auth_client):
    """Production rejects arbitrary strings ('demo', 'test', 'dev', etc.)."""
    original_mode = settings.enable_demo_mode
    original_env = settings.app_env
    try:
        settings.enable_demo_mode = False
        settings.app_env = "production"

        for bad_token in ["demo", "test", "dev", "bearer", "attacker_secret"]:
            res = auth_client.get(
                "/dashboard/summary",
                headers={"Authorization": f"Bearer {bad_token}"},
            )
            assert res.status_code == 401
            assert res.json()["detail"] == "invalid token"
    finally:
        settings.enable_demo_mode = original_mode
        settings.app_env = original_env


def test_missing_demo_token_configuration_rejected(auth_client):
    """When enable_demo_mode is True but demo_auth_token is empty, all tokens are rejected."""
    original_mode = settings.enable_demo_mode
    original_token = settings.demo_auth_token
    try:
        settings.enable_demo_mode = True
        settings.demo_auth_token = ""

        res = auth_client.get(
            "/dashboard/summary",
            headers={"Authorization": f"Bearer {DEMO_TOKEN}"},
        )
        assert res.status_code == 401
        assert res.json()["detail"] == "invalid token"
    finally:
        settings.enable_demo_mode = original_mode
        settings.demo_auth_token = original_token


def test_valid_demo_token_grants_guest_access(auth_client):
    """Exact configured demo token allows guest access to seeded demo summary and alerts."""
    original_mode = settings.enable_demo_mode
    original_token = settings.demo_auth_token
    try:
        settings.enable_demo_mode = True
        settings.demo_auth_token = DEMO_TOKEN

        headers = {"Authorization": f"Bearer {DEMO_TOKEN}"}
        res = auth_client.get("/dashboard/summary", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "collected_da" in data
        assert "ceiling_da" in data
        assert "percent_of_ceiling" in data

        alerts_res = auth_client.get("/compliance/alerts", headers=headers)
        assert alerts_res.status_code == 200
        alerts_data = alerts_res.json()
        assert "items" in alerts_data
        assert isinstance(alerts_data["items"], list)
    finally:
        settings.enable_demo_mode = original_mode
        settings.demo_auth_token = original_token


def test_demo_tenant_isolation_reads(auth_client):
    """Guest requests cannot read other users' clients or invoices (returns 404)."""
    original_mode = settings.enable_demo_mode
    original_token = settings.demo_auth_token
    try:
        settings.enable_demo_mode = True
        settings.demo_auth_token = DEMO_TOKEN
        headers = {"Authorization": f"Bearer {DEMO_TOKEN}"}

        # Non-existent or non-owned client ID
        res = auth_client.get("/clients/999999", headers=headers)
        assert res.status_code == 404
        assert res.json()["detail"] == "client not found"

        # Non-existent or non-owned invoice ID
        res = auth_client.get("/invoices/999999", headers=headers)
        assert res.status_code == 404
        assert res.json()["detail"] == "invoice not found"
    finally:
        settings.enable_demo_mode = original_mode
        settings.demo_auth_token = original_token


def test_demo_tenant_isolation_writes(auth_client):
    """Guest requests cannot modify or reference other users' records."""
    original_mode = settings.enable_demo_mode
    original_token = settings.demo_auth_token
    try:
        settings.enable_demo_mode = True
        settings.demo_auth_token = DEMO_TOKEN
        headers = {"Authorization": f"Bearer {DEMO_TOKEN}"}

        # Cannot update foreign client
        res = auth_client.put(
            "/clients/999999",
            json={"client_type": "B2C", "name": "Fake", "address": "Nowhere"},
            headers=headers,
        )
        assert res.status_code == 404

        # Cannot delete foreign invoice
        del_res = auth_client.delete("/invoices/999999", headers=headers)
        assert del_res.status_code == 404

        # Cannot issue foreign invoice
        issue_res = auth_client.post("/invoices/999999/issue", headers=headers)
        assert issue_res.status_code in (404, 422)

        # Cannot create invoice for foreign or non-existent client
        res = auth_client.post(
            "/invoices",
            json={
                "client_id": 999999,
                "items": [{"description": "Audit", "quantity": "1", "unit_price": "5000"}],
            },
            headers=headers,
        )
        assert res.status_code == 422
        assert "client not found or archived" in res.text
    finally:
        settings.enable_demo_mode = original_mode
        settings.demo_auth_token = original_token


def test_real_supabase_jwt_unaffected_by_demo_mode(auth_client):
    """Real Supabase JWTs authenticate normally regardless of demo mode state."""
    original_mode = settings.enable_demo_mode
    original_token = settings.demo_auth_token
    original_secret = settings.supabase_jwt_secret
    try:
        settings.enable_demo_mode = True
        settings.demo_auth_token = DEMO_TOKEN
        test_secret = "super-secret-supabase-jwt-key-for-testing"
        settings.supabase_jwt_secret = test_secret

        user_jwt = jwt.encode(
            {"sub": "00000000-0000-0000-0000-000000001234", "aud": "authenticated"},
            test_secret,
            algorithm="HS256",
        )

        # An un-onboarded real user gets 404 'freelancer profile not created',
        # proving get_current_user_id successfully extracted the real UUID
        # rather than falling back to demo_user_id!
        res = auth_client.get(
            "/dashboard/summary",
            headers={"Authorization": f"Bearer {user_jwt}"},
        )
        assert res.status_code == 404
        assert res.json()["detail"] == "freelancer profile not created"
    finally:
        settings.enable_demo_mode = original_mode
        settings.demo_auth_token = original_token
        settings.supabase_jwt_secret = original_secret
