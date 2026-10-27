from app.core.db import pool
from app.services.numbering import current_year
from tests.api.conftest import TEST_USER_ID

Y = current_year()

FULL = {
    "first_name": "Sara", "last_name": "Test",
    "address": "Alger", "trade_address": "Alger centre", "phone": "0555000000",
    "nif": "123456789012345", "ai_number": "12345678901",
    "rib": "12345678963258741023", "anae_card_number": "26-123456",
    "anae_card_issue_date": "2026-03-10", "activity_start_date": "2026-03-10",
}


def row(sql, params=()):
    with pool.connection() as conn:
        return conn.execute(sql, params).fetchone()


def mine(columns: str):
    """Read columns of the TEST user's freelancer row only."""
    return row(
        f"select {columns} from public.freelancers where profile_id = %s",
        (TEST_USER_ID,),
    )

# ---------------- onboarding ----------------
def test_onboarding_minimal(client, blank):
    r = client.post("/onboarding", json={"first_name": "Sara", "last_name": "Test"})
    assert r.status_code == 201
    assert r.json()["freelancer_id"] > 0
    p = client.get("/profile").json()
    assert p["completeness"]["can_issue_invoices"] is False
    assert p["profile"]["onboarding_completed_at"] is None


def test_onboarding_full_marks_complete(client, blank):
    assert client.post("/onboarding", json=FULL).status_code == 201
    p = client.get("/profile").json()
    assert p["completeness"]["percent"] == 100
    assert p["profile"]["onboarding_completed_at"] is not None


def test_onboarding_creates_default_preferences(client, blank):
    client.post("/onboarding", json={"first_name": "Sara", "last_name": "Test"})
    assert client.get("/preferences").json() == {"language": "fr", "theme": "system"}


def test_onboarding_twice_conflicts(client):
    r = client.post("/onboarding", json={"first_name": "A", "last_name": "B"})
    assert r.status_code == 409


def test_onboarding_requires_names(client, blank):
    assert client.post("/onboarding", json={"first_name": "Sara"}).status_code == 422
    assert client.post("/onboarding", json={}).status_code == 422
    r = client.post("/onboarding", json={"first_name": "", "last_name": "x"})
    assert r.status_code == 422


def test_onboarding_format_validation(client, blank):
    base = {"first_name": "Sara", "last_name": "Test"}
    for bad in (
        {"nif": "123"}, {"nif": "ABCDEFGHIJKLMNO"},
        {"ai_number": "123"}, {"rib": "123"},
        {"anae_card_number": "261234"}, {"anae_card_number": "26-12345"},
        {"anae_card_issue_date": "10/03/2026"},
        {"last_invoice_number": -1},
        {"last_invoice_number": "abc"},
        {"last_invoice_number": f"FAC-{Y}-"},
    ):
        r = client.post("/onboarding", json={**base, **bad})
        assert r.status_code == 422, bad


# ---------------- invoice numbering (entered as FAC-YYYY-XXX) ----------------
def test_onboarding_previous_invoices_sets_counter(client, blank):
    client.post("/onboarding", json={
        "first_name": "Sara", "last_name": "Test", "last_invoice_number": f"FAC-{Y}-037"})
    r = row("select last_invoice_number, last_invoice_year from public.freelancers")
    assert r == (37, Y)


def test_onboarding_without_previous_invoices_starts_at_one(client, blank):
    client.post("/onboarding", json={"first_name": "Sara", "last_name": "Test"})
    assert row("select last_invoice_number, last_invoice_year from public.freelancers") == (0, None)
    assert client.get("/profile").json()["next_invoice_number"] == f"FAC-{Y}-001"


def test_next_invoice_number_preview(client, blank):
    client.post("/onboarding", json={
        "first_name": "Sara", "last_name": "Test", "last_invoice_number": f"FAC-{Y}-037"})
    assert client.get("/profile").json()["next_invoice_number"] == f"FAC-{Y}-038"


def test_previous_year_number_restarts_at_one(client, blank):
    client.post("/onboarding", json={
        "first_name": "Sara", "last_name": "Test", "last_invoice_number": f"FAC-{Y - 1}-040"})
    assert client.get("/profile").json()["next_invoice_number"] == f"FAC-{Y}-001"


def test_first_issued_invoice_continues_the_number(client, blank):
    client.post("/onboarding", json={
        "first_name": "Sara", "last_name": "Test", "last_invoice_number": f"FAC-{Y}-037"})
    client.patch("/profile", json={
        "trade_address": "Alger", "nif": "123456789012345", "rib": "12345678963258741023",
        "anae_card_number": "26-123456", "anae_card_issue_date": "2026-03-10"})
    c = client.post("/clients", json={"client_type": "B2C", "name": "X", "address": "Y"}).json()
    d = client.post("/invoices", json={"client_id": c["id"], "items": [
        {"description": "x", "quantity": "1", "unit_price": "100"}]}).json()
    r = client.post(f"/invoices/{d['id']}/issue")
    assert r.status_code == 200, r.text
    assert r.json()["number"] == f"FAC-{Y}-038"


def test_onboarding_past_years_flag(client, blank):
    client.post("/onboarding", json={
        "first_name": "Sara", "last_name": "Test", "past_years_confirmed": True})
    assert row("select past_years_status from public.freelancers")[0] == "confirmed"


def test_onboarding_ai_optional_for_completeness(client, blank):
    body = {k: v for k, v in FULL.items() if k != "ai_number"}
    client.post("/onboarding", json=body)
    assert client.get("/profile").json()["completeness"]["can_issue_invoices"] is True


# ---------------- profile ----------------
def test_profile_before_onboarding_is_404(client, blank):
    assert client.get("/profile").status_code == 404


def test_profile_get_lists_missing_fields(client):
    c = client.get("/profile").json()["completeness"]
    assert c["percent"] < 100
    assert set(c["missing_for_invoicing"]) == {
        "trade_address", "nif", "rib", "anae_card_number", "anae_card_issue_date"}


def test_patch_partial_update_keeps_other_fields(client):
    client.patch("/profile", json={"nif": "123456789012345"})
    p = client.patch("/profile", json={"phone": "0555000000"}).json()["profile"]
    assert p["nif"].strip() == "123456789012345"
    assert p["phone"] == "0555000000"
    assert p["first_name"] == "Sara"


def test_patch_completes_profile_and_sets_timestamp(client, complete):
    p = client.get("/profile").json()
    assert p["completeness"]["can_issue_invoices"] is True
    assert p["profile"]["onboarding_completed_at"] is not None


def test_patch_removing_required_field_clears_timestamp(client, complete):
    client.patch("/profile", json={"nif": None})
    p = client.get("/profile").json()
    assert p["completeness"]["can_issue_invoices"] is False
    assert p["profile"]["onboarding_completed_at"] is None


def test_patch_validation(client):
    for bad in (
        {"nif": "123"}, {"rib": "123"}, {"ai_number": "1"},
        {"anae_card_number": "bad"}, {"first_name": None},
        {"last_name": None}, {"first_name": ""},
    ):
        assert client.patch("/profile", json=bad).status_code == 422, bad


def test_patch_can_clear_optional_fields(client):
    client.patch("/profile", json={"phone": "0555000000", "ai_number": "12345678901"})
    p = client.patch("/profile", json={"phone": None, "ai_number": None}).json()["profile"]
    assert p["phone"] is None and p["ai_number"] is None


def test_patch_cannot_change_counter_or_ids(client):
    client.patch("/profile", json={
        "last_invoice_number": 99, "last_invoice_year": 2020,
        "id": 12345, "profile_id": "00000000-0000-0000-0000-000000000000"})
    r = row("select last_invoice_number, last_invoice_year from public.freelancers")
    assert r == (0, None)


def test_patch_empty_body_is_harmless(client):
    r = client.patch("/profile", json={})
    assert r.status_code == 200
    assert r.json()["profile"]["first_name"] == "Sara"


def test_patch_past_years_confirmed(client):
    client.patch("/profile", json={"past_years_confirmed": True})
    assert row("select past_years_status from public.freelancers")[0] == "confirmed"
    client.patch("/profile", json={"past_years_confirmed": False})
    assert row("select past_years_status from public.freelancers")[0] == "unknown"


# ---------------- preferences ----------------
def test_preferences_update(client):
    r = client.patch("/preferences", json={"language": "ar", "theme": "dark"})
    assert r.status_code == 200
    assert r.json() == {"language": "ar", "theme": "dark"}


def test_preferences_partial(client):
    client.patch("/preferences", json={"theme": "light"})
    assert client.get("/preferences").json() == {"language": "fr", "theme": "light"}


def test_preferences_validation(client):
    assert client.patch("/preferences", json={"theme": "blue"}).status_code == 422
    assert client.patch("/preferences", json={"language": "en"}).status_code == 422


# ---------------- auth ----------------
def test_endpoints_require_token():
    from fastapi.testclient import TestClient
    from app.main import app
    saved = dict(app.dependency_overrides)
    app.dependency_overrides.clear()
    try:
        c = TestClient(app)
        for method, url in (("get", "/profile"), ("patch", "/profile"),
                            ("post", "/onboarding"), ("get", "/preferences"),
                            ("patch", "/preferences")):
            assert getattr(c, method)(url).status_code == 401, url
    finally:
        app.dependency_overrides.update(saved)


# ---------------- clients ----------------
def test_clients_pagination_and_search(client):
    for n in ("Alpha SARL", "Beta SARL", "Gamma"):
        client.post("/clients", json={"client_type": "B2C", "name": n, "address": "x"})
    r = client.get("/clients?limit=2").json()
    assert r["total"] == 3 and len(r["items"]) == 2
    assert [c["name"] for c in r["items"]] == ["Alpha SARL", "Beta SARL"]  # sorted
    assert client.get("/clients?q=sarl").json()["total"] == 2               # case-insensitive
    assert client.get("/clients?q=nothing").json()["total"] == 0


def test_clients_search_by_nif(client):
    client.post("/clients", json={"client_type": "B2B", "name": "Test SARL", "address": "x",
                                  "rc": "RC1", "nif": "111111111111111", "nis": "N1"})
    assert client.get("/clients?q=1111111").json()["total"] == 1


def test_clients_archived_list(client):
    c = client.post("/clients", json={"client_type": "B2C", "name": "A", "address": "x"}).json()
    client.post(f"/clients/{c['id']}/archive")
    assert client.get("/clients").json()["total"] == 0
    assert client.get("/clients?archived=true").json()["total"] == 1



def test_onboarding_previous_invoices_sets_counter(client, blank):
    client.post("/onboarding", json={
        "first_name": "Sara", "last_name": "Test", "last_invoice_number": f"FAC-{Y}-037"})
    assert mine("last_invoice_number, last_invoice_year") == (37, Y)


def test_onboarding_without_previous_invoices_starts_at_one(client, blank):
    client.post("/onboarding", json={"first_name": "Sara", "last_name": "Test"})
    assert mine("last_invoice_number, last_invoice_year") == (0, None)
    assert client.get("/profile").json()["next_invoice_number"] == f"FAC-{Y}-001"


def test_onboarding_past_years_flag(client, blank):
    client.post("/onboarding", json={
        "first_name": "Sara", "last_name": "Test", "past_years_confirmed": True})
    assert mine("past_years_status")[0] == "confirmed"


def test_patch_cannot_change_counter_or_ids(client):
    client.patch("/profile", json={
        "last_invoice_number": 99, "last_invoice_year": 2020,
        "id": 12345, "profile_id": "00000000-0000-0000-0000-000000000000"})
    assert mine("last_invoice_number, last_invoice_year") == (0, None)


def test_patch_past_years_confirmed(client):
    client.patch("/profile", json={"past_years_confirmed": True})
    assert mine("past_years_status")[0] == "confirmed"
    client.patch("/profile", json={"past_years_confirmed": False})
    assert mine("past_years_status")[0] == "unknown"