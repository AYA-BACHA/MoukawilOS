"""Integration tests: real Postgres, real FastAPI app, ES256 tokens checked against a
local stub JWKS server (same code path as Supabase).

OPT-IN AND LOCAL ONLY. These tests insert users (auth.users), clients and invoices and
never clean up, so they run only when TEST_DATABASE_URL is set to a LOCAL database
(localhost / 127.0.0.1). Otherwise this whole folder is ignored. Run it on its own:

    TEST_DATABASE_URL=postgresql://postgres:pw@localhost/moukawil pytest tests/integration
"""
import json
import os
import threading
import time
import uuid
from datetime import date
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

TEST_DB = os.environ.get("TEST_DATABASE_URL")

if not TEST_DB:
    collect_ignore_glob = ["test_*.py"]          # opt-in: nothing runs by default
elif urlparse(TEST_DB).hostname not in ("localhost", "127.0.0.1", "::1"):
    raise SystemExit("tests/integration refuses to run against a non-local database")
else:
    os.environ["DATABASE_URL"] = TEST_DB
    os.environ["SUPABASE_URL"] = "http://127.0.0.1:9999"
    os.environ["NO_PROXY"] = "127.0.0.1,localhost"
    os.environ["no_proxy"] = "127.0.0.1,localhost"

import jwt  # noqa: E402
import psycopg  # noqa: E402
import pytest  # noqa: E402
from cryptography.hazmat.primitives.asymmetric import ec  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

_KEY = ec.generate_private_key(ec.SECP256R1())
_JWK = json.loads(jwt.algorithms.ECAlgorithm.to_jwk(_KEY.public_key()))
_JWK.update(kid="test-key", alg="ES256", use="sig")


class _Jwks(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({"keys": [_JWK]}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


if TEST_DB:
    _srv = HTTPServer(("127.0.0.1", 9999), _Jwks)
    threading.Thread(target=_srv.serve_forever, daemon=True).start()

FROZEN_TODAY = date(2026, 10, 28)

FULL_PROFILE = dict(
    first_name="Kawther", last_name="Test", address="1 rue A, Jijel",
    trade_address="2 rue B, Jijel", phone="0555000000",
    nif="123456789012345", ai_number="12345678901", rib="12345678901234567890",
    anae_card_number="12-345678", anae_card_issue_date="2025-03-01",
    activity_start_date="2025-03-01",
)


def make_token(user_id: str, exp_in: int = 3600) -> str:
    return jwt.encode(
        {"sub": user_id, "aud": "authenticated", "exp": int(time.time()) + exp_in},
        _KEY, algorithm="ES256", headers={"kid": "test-key"},
    )


@pytest.fixture(scope="session")
def app_client():
    from app.core.config import settings
    if settings.database_url != TEST_DB:        # another test already loaded other settings
        pytest.skip("run the integration tests on their own: pytest tests/integration")
    from app.main import app
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def db():
    with psycopg.connect(os.environ["DATABASE_URL"], autocommit=True) as conn:
        yield conn


@pytest.fixture(autouse=True)
def frozen_today(monkeypatch):
    """Pin 'today' to 2026-10-28 for every module that computes it."""
    import app.services.compliance as comp
    import app.services.invoices as inv
    monkeypatch.setattr(comp, "today_dz", lambda: FROZEN_TODAY)
    monkeypatch.setattr(inv, "_today", lambda: FROZEN_TODAY)


class User:
    def __init__(self, client, db, user_id, fid, token):
        self.client, self.db, self.user_id, self.fid = client, db, user_id, fid
        self.headers = {"Authorization": f"Bearer {token}"}

    def get(self, url, **kw):
        return self.client.get(url, headers=self.headers, **kw)

    def post(self, url, **kw):
        return self.client.post(url, headers=self.headers, **kw)

    def put(self, url, **kw):
        return self.client.put(url, headers=self.headers, **kw)

    def patch(self, url, **kw):
        return self.client.patch(url, headers=self.headers, **kw)

    def delete(self, url, **kw):
        return self.client.delete(url, headers=self.headers, **kw)

    # -------- direct SQL helpers (full control of dates for calculations) --------
    def sql_client(self, name="ACME", ctype="B2C"):
        nif = nis = None
        if ctype == "B2B":
            nif, nis = str(uuid.uuid4().int)[:15], "NIS1"
        return self.db.execute(
            """insert into clients (freelancer_id, client_type_id, name, address, nif, nis)
               values (%s, (select id from client_types where code=%s), %s, 'addr', %s, %s)
               returning id""",
            (self.fid, ctype, name, nif, nis),
        ).fetchone()[0]

    def sql_paid_invoice(self, total, paid_at, issue_date=None, client_id=None, seq=None):
        issue_date = issue_date or paid_at
        client_id = client_id or self.sql_client()
        seq = seq or (self.db.execute(
            "select coalesce(max(sequence_number),0)+1 from invoices where freelancer_id=%s and number_year=%s",
            (self.fid, issue_date.year)).fetchone()[0])
        return self.db.execute(
            """insert into invoices (freelancer_id, client_id, status, sequence_number, number_year,
                                     issue_date, total, paid_at)
               values (%s,%s,'paid',%s,%s,%s,%s,%s) returning id""",
            (self.fid, client_id, seq, issue_date.year, issue_date, total, paid_at),
        ).fetchone()[0]

    def sql_issued_invoice(self, total, issue_date, client_id=None):
        client_id = client_id or self.sql_client()
        seq = self.db.execute(
            "select coalesce(max(sequence_number),0)+1 from invoices where freelancer_id=%s and number_year=%s",
            (self.fid, issue_date.year)).fetchone()[0]
        return self.db.execute(
            """insert into invoices (freelancer_id, client_id, status, sequence_number, number_year,
                                     issue_date, total)
               values (%s,%s,'issued',%s,%s,%s,%s) returning id""",
            (self.fid, client_id, seq, issue_date.year, issue_date, total),
        ).fetchone()[0]

    def sql_income(self, amount, received_date):
        self.db.execute(
            "insert into manual_income_entries (freelancer_id, amount, received_date) values (%s,%s,%s)",
            (self.fid, amount, received_date))


@pytest.fixture()
def make_user(app_client, db):
    def _make(profile=None):
        uid = str(uuid.uuid4())
        db.execute("insert into auth.users (id, email) values (%s, %s)", (uid, f"{uid}@t.dz"))
        token = make_token(uid)
        body = FULL_PROFILE if profile is None else profile
        r = app_client.post("/onboarding", json=body, headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 201, r.text
        return User(app_client, db, uid, r.json()["freelancer_id"], token)
    return _make