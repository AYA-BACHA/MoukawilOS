from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from app.core.db import pool
from app.services.invoices import _money
from decimal import Decimal

from tests.api.conftest import wipe  # noqa: F401

TODAY = datetime.now(ZoneInfo("Africa/Algiers")).date()
YEAR = TODAY.year
ITEMS = [
    {"description": "Web development", "quantity": "2", "unit": "days", "unit_price": "400.00"},
    {"description": "Hosting", "quantity": "1", "unit_price": "200.00"},
]


def draft(client, cid, items=ITEMS):
    r = client.post("/invoices", json={"client_id": cid, "items": items})
    assert r.status_code == 201, r.text
    return r.json()


def issued(client, cid):
    d = draft(client, cid)
    r = client.post(f"/invoices/{d['id']}/issue")
    assert r.status_code == 200, r.text
    return r.json()


def paid(client, cid, when=None):
    inv = issued(client, cid)
    r = client.post(f"/invoices/{inv['id']}/pay", json={"paid_at": str(when or TODAY)})
    assert r.status_code == 200, r.text
    return r.json()


def audit(inv_id):
    with pool.connection() as conn:
        return conn.execute(
            "select event_type, paid_at from public.invoice_audit_events "
            "where invoice_id = %s order by id", (inv_id,)).fetchall()


# ---------- pure ----------
def test_rounding():
    assert _money(Decimal("1.5") * Decimal("333.33")) == Decimal("500.00")


# ---------- drafts ----------
def test_create_draft(client, cid):
    d = draft(client, cid)
    assert d["status"] == "draft" and d["number"] is None
    assert d["total"] == "1000.00" and len(d["items"]) == 2


def test_draft_rounds_line_total(client, cid):
    d = draft(client, cid, [{"description": "x", "quantity": "1.5", "unit_price": "333.33"}])
    assert d["total"] == "500.00"


def test_draft_unknown_client(client):
    r = client.post("/invoices", json={"client_id": 99999, "items": ITEMS})
    assert r.status_code == 422


def test_draft_validation(client, cid):
    bad = [{"description": "x", "quantity": "0", "unit_price": "10"}]
    assert client.post("/invoices", json={"client_id": cid, "items": bad}).status_code == 422
    bad = [{"description": "x", "quantity": "1", "unit_price": "-5"}]
    assert client.post("/invoices", json={"client_id": cid, "items": bad}).status_code == 422
    assert client.post("/invoices", json={"client_id": cid, "currency": "EUR"}).status_code == 422


def test_status_filter_validation(client):
    assert client.get("/invoices?status=foo").status_code == 422


def test_edit_and_delete_draft(client, cid):
    d = draft(client, cid)
    r = client.put(f"/invoices/{d['id']}", json={"client_id": cid, "items": [
        {"description": "Consulting", "quantity": "1.5", "unit_price": "333.33"}]})
    assert r.status_code == 200 and r.json()["total"] == "500.00"
    assert client.delete(f"/invoices/{d['id']}").status_code == 204
    assert client.get(f"/invoices/{d['id']}").status_code == 404


# ---------- issuing ----------
def test_issue_incomplete_profile(client, cid):
    d = draft(client, cid)
    r = client.post(f"/invoices/{d['id']}/issue")
    assert r.status_code == 422
    assert r.json()["detail"]["code"] == "profile_incomplete"
    assert "nif" in r.json()["detail"]["missing"]


def test_issue_without_items(client, cid, complete):
    d = draft(client, cid, items=[])
    assert client.post(f"/invoices/{d['id']}/issue").status_code == 409


def test_issue_numbers_are_sequential(client, cid, complete):
    a = issued(client, cid)
    b = issued(client, cid)
    assert a["number"] == f"FAC-{YEAR}-001" and a["issue_date"] == str(TODAY)
    assert b["number"] == f"FAC-{YEAR}-002"


def test_issued_invoice_is_frozen(client, cid, complete):
    a = issued(client, cid)
    assert client.post(f"/invoices/{a['id']}/issue").status_code == 409
    assert client.put(f"/invoices/{a['id']}", json={"client_id": cid}).status_code == 409
    assert client.delete(f"/invoices/{a['id']}").status_code == 409


def test_snapshot_protects_old_invoice(client, cid, complete):
    a = issued(client, cid)
    client.patch("/profile", json={"nif": "999999999999999"})
    b = issued(client, cid)
    with pool.connection() as conn:
        rows = dict(conn.execute(
            "select invoice_id, seller_nif from public.invoice_snapshots").fetchall())
    assert rows[a["id"]].strip() == "123456789012345"
    assert rows[b["id"]].strip() == "999999999999999"


def test_audit_issued(client, cid, complete):
    a = issued(client, cid)
    assert audit(a["id"]) == [("issued", None)]


def test_concurrent_issue_gives_distinct_numbers(client, cid, complete):
    ids = [draft(client, cid)["id"] for _ in range(2)]
    with ThreadPoolExecutor(max_workers=2) as ex:
        res = list(ex.map(lambda i: client.post(f"/invoices/{i}/issue"), ids))
    codes = sorted(r.status_code for r in res)
    assert codes[0] == 200  # at least one succeeds
    numbers = [r.json()["number"] for r in res if r.status_code == 200]
    assert len(numbers) == len(set(numbers))  # never a duplicate


# ---------- payment ----------
def test_pay_future_date(client, cid, complete):
    a = issued(client, cid)
    r = client.post(f"/invoices/{a['id']}/pay", json={"paid_at": "2099-01-01"})
    assert r.status_code == 400


def test_pay_before_issue_date(client, cid, complete):
    a = issued(client, cid)
    r = client.post(f"/invoices/{a['id']}/pay",
                    json={"paid_at": str(TODAY - timedelta(days=1))})
    assert r.status_code == 400


def test_pay_ok_and_audit(client, cid, complete):
    p = paid(client, cid)
    assert p["status"] == "paid" and p["paid_at"] == str(TODAY)
    assert audit(p["id"]) == [("issued", None), ("paid", None)]


def test_pay_twice_and_cancel_paid_blocked(client, cid, complete):
    p = paid(client, cid)
    assert client.post(f"/invoices/{p['id']}/pay", json={"paid_at": str(TODAY)}).status_code == 409
    r = client.post(f"/invoices/{p['id']}/cancel", json={"reason": "test"})
    assert r.status_code == 409


def test_revert_payment(client, cid, complete):
    p = paid(client, cid)
    r = client.post(f"/invoices/{p['id']}/revert-payment")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "issued" and body["paid_at"] is None
    assert body["warning"] is None
    assert audit(p["id"])[-1] == ("unpaid", TODAY)
    assert client.post(f"/invoices/{p['id']}/revert-payment").status_code == 409


def test_revert_previous_year_warns(client, cid, complete):
    p = paid(client, cid)
    with pool.connection() as conn:
        conn.execute(
            "update public.invoices set issue_date='2025-06-01', number_year=2025, "
            "paid_at='2025-12-15' where id=%s", (p["id"],))
    r = client.post(f"/invoices/{p['id']}/revert-payment")
    assert r.status_code == 200
    assert "previous year" in r.json()["warning"]


# ---------- cancellation ----------
def test_cancel_requires_reason(client, cid, complete):
    a = issued(client, cid)
    assert client.post(f"/invoices/{a['id']}/cancel", json={}).status_code == 422


def test_cancel_keeps_number_and_blocks_further_actions(client, cid, complete):
    a = issued(client, cid)
    r = client.post(f"/invoices/{a['id']}/cancel", json={"reason": "Client dispute"})
    assert r.status_code == 200
    c = r.json()
    assert c["status"] == "cancelled" and c["number"] == f"FAC-{YEAR}-001"
    assert c["cancellation_reason"] == "Client dispute"
    assert client.post(f"/invoices/{a['id']}/cancel", json={"reason": "x"}).status_code == 409
    assert client.post(f"/invoices/{a['id']}/pay", json={"paid_at": str(TODAY)}).status_code == 409


def test_cancelled_number_is_never_reused(client, cid, complete):
    a = issued(client, cid)
    client.post(f"/invoices/{a['id']}/cancel", json={"reason": "x"})
    b = issued(client, cid)
    assert b["number"] == f"FAC-{YEAR}-002"


# ---------- DB safety net ----------
def test_db_blocks_changes_to_frozen_data(client, cid, complete):
    import psycopg
    a = issued(client, cid)
    for sql in (
        "update public.invoice_snapshots set seller_name='x'",
        "delete from public.invoice_audit_events",
        f"insert into public.invoice_items (invoice_id, description, quantity, unit_price, line_total) "
        f"values ({a['id']}, 'x', 1, 1, 1)",
    ):
        try:
            with pool.connection() as conn:
                conn.execute(sql)
            raise AssertionError(f"should have failed: {sql}")
        except psycopg.errors.RaiseException:
            pass


def test_draft_has_no_snapshot(client, cid):
    d = draft(client, cid)
    assert client.get(f"/invoices/{d['id']}").json()["snapshot"] is None


def test_issued_invoice_returns_frozen_snapshot(client, cid, complete):
    a = issued(client, cid)
    client.patch("/profile", json={"trade_address": "Oran"})
    s = client.get(f"/invoices/{a['id']}").json()["snapshot"]
    assert s["seller_address"] == "Alger centre"   # not the new address
    assert s["seller_nif"] == "123456789012345"
    assert s["client_name"] == "Client Particulier"
    assert s["client_type"] == "B2C"


def test_list_does_not_include_snapshot(client, cid, complete):
    issued(client, cid)
    assert client.get("/invoices").json()["items"][0]["snapshot"] is None



def test_list_pagination(client, cid):
    for _ in range(3):
        draft(client, cid)
    r = client.get("/invoices?limit=2&offset=0").json()
    assert r["total"] == 3 and len(r["items"]) == 2
    assert r["limit"] == 2 and r["offset"] == 0
    r2 = client.get("/invoices?limit=2&offset=2").json()
    assert len(r2["items"]) == 1
    ids = [i["id"] for i in r["items"]] + [i["id"] for i in r2["items"]]
    assert len(ids) == len(set(ids))


def test_list_limits_validated(client):
    assert client.get("/invoices?limit=0").status_code == 422
    assert client.get("/invoices?limit=1000").status_code == 422
    assert client.get("/invoices?offset=-1").status_code == 422


def test_list_filter_status_and_client(client, cid, complete):
    draft(client, cid)
    issued(client, cid)
    assert client.get("/invoices?status=draft").json()["total"] == 1
    assert client.get("/invoices?status=issued").json()["total"] == 1
    assert client.get(f"/invoices?client_id={cid}").json()["total"] == 2
    assert client.get("/invoices?client_id=99999").json()["total"] == 0


def test_list_search_by_number_and_name(client, cid, complete):
    a = issued(client, cid)
    draft(client, cid)
    assert client.get(f"/invoices?q={a['number']}").json()["total"] == 1
    assert client.get("/invoices?q=Particulier").json()["total"] == 2
    assert client.get("/invoices?q=zzzz").json()["total"] == 0


def test_list_filter_by_issue_date(client, cid, complete):
    issued(client, cid)
    assert client.get(f"/invoices?from={TODAY}&to={TODAY}").json()["total"] == 1
    assert client.get("/invoices?to=2000-01-01").json()["total"] == 0
    assert client.get("/invoices?from=not-a-date").status_code == 422



def test_counter_lower_than_invoices_still_issues(client, cid, complete):
    issued(client, cid)                          # FAC-YYYY-001
    with pool.connection() as conn:
        conn.execute("update public.freelancers set last_invoice_number=0")
    assert issued(client, cid)["number"] == f"FAC-{YEAR}-002"   # no 409

def test_onboarding_counter_too_large(client, blank):
    r = client.post("/onboarding", json={"first_name": "A", "last_name": "B",
                                          "last_invoice_number": 10**7})
    assert r.status_code == 422