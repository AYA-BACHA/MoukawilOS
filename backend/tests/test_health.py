from datetime import datetime
from fastapi.testclient import TestClient

from app.core.db import get_db
from app.main import app


def test_health():
    r = TestClient(app).get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "timestamp" in data
    # Ensure timestamp is valid ISO format
    datetime.fromisoformat(data["timestamp"])


def test_api_health_alias():
    r = TestClient(app).get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_health_database_failure():
    class FailingConnection:
        def execute(self, query):
            raise RuntimeError("Database connection timed out during SELECT 1")

    app.dependency_overrides[get_db] = lambda: FailingConnection()
    try:
        r = TestClient(app).get("/health")
        assert r.status_code == 503
        data = r.json()
        assert data["status"] == "unhealthy"
        assert data["database"] == "disconnected"
        assert "Database connection timed out" in data["error"]
    finally:
        app.dependency_overrides.clear()


def test_health_pool_unavailable():
    app.dependency_overrides[get_db] = lambda: None
    try:
        r = TestClient(app).get("/health")
        assert r.status_code == 503
        data = r.json()
        assert data["status"] == "unhealthy"
        assert data["database"] == "disconnected"
        assert "unavailable" in data["error"].lower()
    finally:
        app.dependency_overrides.clear()
