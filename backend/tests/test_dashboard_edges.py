"""Edge cases found while testing the dashboard."""
from datetime import date
from decimal import Decimal

import pytest

D = lambda x: Decimal(str(x))  # noqa: E731


def test_pending_includes_invoices_issued_in_earlier_years(make_user):
    """An invoice issued in 2025 and still unpaid is money still owed in 2026."""
    u = make_user()
    u.sql_issued_invoice(300_000, date(2025, 11, 1))
    s = u.get("/dashboard/summary?year=2026").json()
    assert D(s["pending_da"]) == 300_000


def test_draft_created_just_after_midnight_algiers_counts_in_new_year(make_user, db):
    """2027-01-01 00:30 Algiers time = 2026-12-31 23:30 UTC; the DB casts in UTC."""
    u = make_user()
    cid = u.sql_client()
    db.execute("insert into invoices (freelancer_id, client_id, created_at) values (%s,%s,'2026-12-31 23:30:00+00')",
               (u.fid, cid))
    s27 = u.get("/dashboard/summary?year=2027").json()
    assert s27["invoice_counts"]["draft"] == 1


def test_pending_excludes_paid_and_cancelled(make_user, db):
    u = make_user()
    u.sql_issued_invoice(100_000, date(2025, 3, 1))
    u.sql_issued_invoice(50_000, date(2026, 3, 1))
    u.sql_paid_invoice(900_000, date(2026, 4, 1))
    cid = u.sql_client()
    db.execute("""insert into invoices (freelancer_id, client_id, status, sequence_number, number_year,
                  issue_date, total, cancelled_at, cancellation_reason)
                  values (%s,%s,'cancelled',99,2025,'2025-05-01',777000, now(), 'x')""", (u.fid, cid))
    for y in (2025, 2026, 2027):
        assert D(u.get(f"/dashboard/summary?year={y}").json()["pending_da"]) == 150_000


def test_counts_stay_per_year(make_user):
    u = make_user()
    u.sql_issued_invoice(1, date(2025, 3, 1))
    u.sql_issued_invoice(1, date(2026, 3, 1))
    assert u.get("/dashboard/summary?year=2025").json()["invoice_counts"]["issued"] == 1
    assert u.get("/dashboard/summary?year=2026").json()["invoice_counts"]["issued"] == 1