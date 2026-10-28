"""
MoukawilOS Live Supabase Seed Script
Populates the live database with:
- 1 Complete Onboarded Freelancer Profile & Preferences
- 5 Clients (3 B2B and 2 B2C)
- 8 Invoices across all canonical statuses (Draft, Issued, Paid, Cancelled)
- 2 Credit Notes (Factures d'Avoir - AV-YYYY-NNN) linked to invoices
"""

import os
import sys
from datetime import date, datetime, timezone
from pathlib import Path
import dotenv
import psycopg

ROOT_DIR = Path(__file__).resolve().parents[1]
dotenv.load_dotenv(ROOT_DIR / "backend" / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
TEST_USER_ID = os.getenv("TEST_USER_ID", "0d8a54fe-b098-4fe9-be73-47afc3218772")

if not DATABASE_URL:
    print("[ERROR] DATABASE_URL not set in backend/.env")
    sys.exit(1)


def seed_database():
    print(f"Connecting to live database...")
    conn = psycopg.connect(DATABASE_URL)
    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            # 1. Ensure profile exists for TEST_USER_ID
            cur.execute(
                """
                insert into public.profiles (id)
                values (%s)
                on conflict (id) do nothing;
                """,
                (TEST_USER_ID,),
            )

            # 2. Upsert Freelancer
            cur.execute(
                """
                select id from public.freelancers where profile_id = %s;
                """,
                (TEST_USER_ID,),
            )
            row = cur.fetchone()

            if row:
                fid = row[0]
                cur.execute(
                    """
                    update public.freelancers
                    set first_name = 'Sara',
                        last_name = 'Benali',
                        address = '14 Rue Didouche Mourad, Alger',
                        trade_address = '14 Rue Didouche Mourad, Alger',
                        phone = '0555123456',
                        nif = '099916000123456',
                        ai_number = '16012345678',
                        rib = '00799999001234567890',
                        anae_card_number = '23-123456',
                        anae_card_issue_date = '2025-10-15',
                        activity_start_date = '2025-10-15',
                        past_years_status = 'confirmed',
                        last_invoice_number = 7,
                        last_invoice_year = 2026,
                        onboarding_completed_at = coalesce(onboarding_completed_at, now())
                    where id = %s;
                    """,
                    (fid,),
                )
            else:
                cur.execute(
                    """
                    insert into public.freelancers (
                        profile_id, first_name, last_name, address, trade_address, phone,
                        nif, ai_number, rib, anae_card_number, anae_card_issue_date,
                        activity_start_date, past_years_status, last_invoice_number,
                        last_invoice_year, onboarding_completed_at
                    ) values (
                        %s, 'Sara', 'Benali', '14 Rue Didouche Mourad, Alger',
                        '14 Rue Didouche Mourad, Alger', '0555123456',
                        '099916000123456', '16012345678', '00799999001234567890',
                        '23-123456', '2025-10-15', '2025-10-15', 'confirmed',
                        7, 2026, now()
                    ) returning id;
                    """,
                    (TEST_USER_ID,),
                )
                fid = cur.fetchone()[0]

            print(f"[OK] Freelancer active with ID: {fid}")

            # 3. Upsert User Preferences (including new columns)
            cur.execute(
                """
                insert into public.user_preferences (
                    freelancer_id, language, theme, default_payment_terms_days, append_exemption_clause
                ) values (
                    %s, 'fr', 'system', 30, true
                ) on conflict (freelancer_id) do update set
                    language = 'fr',
                    theme = 'system',
                    default_payment_terms_days = 30,
                    append_exemption_clause = true;
                """,
                (fid,),
            )

            # 4. Clean previous child data for this freelancer to maintain clean idempotent state
            cur.execute("delete from public.credit_notes where freelancer_id = %s;", (fid,))
            cur.execute("delete from public.invoice_audit_events where freelancer_id = %s;", (fid,))
            cur.execute(
                """
                delete from public.invoice_snapshots
                where invoice_id in (select id from public.invoices where freelancer_id = %s);
                """,
                (fid,),
            )
            cur.execute(
                """
                delete from public.invoice_items
                where invoice_id in (select id from public.invoices where freelancer_id = %s);
                """,
                (fid,),
            )
            cur.execute("delete from public.invoices where freelancer_id = %s;", (fid,))
            cur.execute("delete from public.clients where freelancer_id = %s;", (fid,))

            # 5. Insert 5 Clients (3 B2B, 2 B2C)
            clients_data = [
                (
                    fid, 1, "Sonatrach Digital SPA", "14 Val d'Hydra, Alger", "DZ",
                    "16/00-1234567B20", "000216001234567", "000216010123456",
                    "achats@sonatrach-digital.dz", "021000001"
                ),
                (
                    fid, 1, "Ooredoo Algérie Télécom SPA", "Zone d'Activité, Ouled Fayet, Alger", "DZ",
                    "16/00-7654321B21", "000416009876543", "000416019876543",
                    "finance@ooredoo.dz", "021000002"
                ),
                (
                    fid, 1, "Djezzy Algérie (Optimum Telecom)", "Lotissement 23, Dar El Beida, Alger", "DZ",
                    "16/00-9988776B19", "000516001122334", "000516011122334",
                    "invoicing@djezzy.dz", "021000003"
                ),
                (
                    fid, 2, "Yacine Mansouri", "Avenue Didouche Mourad, Oran", "DZ",
                    None, None, None,
                    "yacine.mansouri@gmail.com", "0550000004"
                ),
                (
                    fid, 2, "Amina Zerrouki", "Cité Sidi Mabrouk, Constantine", "DZ",
                    None, None, None,
                    "amina.zerrouki@outlook.com", "0660000005"
                ),
            ]

            client_ids = []
            for c in clients_data:
                cur.execute(
                    """
                    insert into public.clients (
                        freelancer_id, client_type_id, name, address, country,
                        rc, nif, nis, email, phone
                    ) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    returning id;
                    """,
                    c,
                )
                client_ids.append(cur.fetchone()[0])

            print(f"[OK] Seeded {len(client_ids)} Clients (IDs: {client_ids})")

            # Helper for seller snapshot
            seller_snapshot = {
                "seller_name": "Sara Benali",
                "seller_address": "14 Rue Didouche Mourad, Alger",
                "seller_nif": "099916000123456",
                "seller_ai": "16012345678",
                "seller_card_number": "23-123456",
                "seller_rib": "00799999001234567890",
            }

            # 6. Insert 8 Invoices across all statuses
            # Flow: insert as draft -> insert items -> compute total -> update snapshot -> update to target status
            invoices_config = [
                # 1. Paid (Sonatrach)
                {
                    "client_idx": 0, "status": "paid", "seq": 1, "year": 2026,
                    "issue_date": date(2026, 1, 10), "due_date": date(2026, 2, 10), "paid_at": date(2026, 1, 25),
                    "cancelled_at": None, "cancellation_reason": None,
                    "note": "Prestation d'ingénierie logicielle - Sprint 1 & 2",
                    "items": [
                        ("Architecture microservices cloud", 1, "mois", 500000.00),
                        ("Revue de code & sécurité applicative", 1, "forfait", 250000.00),
                    ]
                },
                # 2. Paid (Ooredoo)
                {
                    "client_idx": 1, "status": "paid", "seq": 2, "year": 2026,
                    "issue_date": date(2026, 1, 28), "due_date": date(2026, 2, 28), "paid_at": date(2026, 2, 15),
                    "cancelled_at": None, "cancellation_reason": None,
                    "note": "Développement API passerelle paiement",
                    "items": [
                        ("Intégration API & tests de charge", 1, "prestation", 1200000.00),
                    ]
                },
                # 3. Paid (Yacine Mansouri - B2C)
                {
                    "client_idx": 3, "status": "paid", "seq": 3, "year": 2026,
                    "issue_date": date(2026, 2, 5), "due_date": date(2026, 3, 5), "paid_at": date(2026, 2, 20),
                    "cancelled_at": None, "cancellation_reason": None,
                    "note": "Conception site vitrine responsive",
                    "items": [
                        ("Design UX/UI & intégration web", 1, "site", 180000.00),
                    ]
                },
                # 4. Paid (Amina Zerrouki - B2C)
                {
                    "client_idx": 4, "status": "paid", "seq": 4, "year": 2026,
                    "issue_date": date(2026, 2, 20), "due_date": date(2026, 3, 20), "paid_at": date(2026, 3, 1),
                    "cancelled_at": None, "cancellation_reason": None,
                    "note": "Audit UX application mobile",
                    "items": [
                        ("Heuristic evaluation & maquettes Figma", 1, "forfait", 320000.00),
                    ]
                },
                # 5. Issued (Djezzy)
                {
                    "client_idx": 2, "status": "issued", "seq": 5, "year": 2026,
                    "issue_date": date(2026, 3, 1), "due_date": date(2026, 3, 31), "paid_at": None,
                    "cancelled_at": None, "cancellation_reason": None,
                    "note": "Mise en place pipeline CI/CD automatisé",
                    "items": [
                        ("Configuration DevOps & déploiement conteneurs", 1, "prestation", 650000.00),
                    ]
                },
                # 6. Issued (Sonatrach)
                {
                    "client_idx": 0, "status": "issued", "seq": 6, "year": 2026,
                    "issue_date": date(2026, 3, 15), "due_date": date(2026, 4, 15), "paid_at": None,
                    "cancelled_at": None, "cancellation_reason": None,
                    "note": "Formation technique des équipes de développement",
                    "items": [
                        ("Atelier architecture logicielle avancée (4 jours)", 4, "jour", 105000.00),
                    ]
                },
                # 7. Cancelled (Ooredoo)
                {
                    "client_idx": 1, "status": "cancelled", "seq": 7, "year": 2026,
                    "issue_date": date(2026, 1, 15), "due_date": date(2026, 2, 15), "paid_at": None,
                    "cancelled_at": datetime(2026, 1, 18, 10, 0, tzinfo=timezone.utc),
                    "cancellation_reason": "Erreur sur le bon de commande client",
                    "note": "Facture annulée pour réémission",
                    "items": [
                        ("Prestation annulée", 1, "forfait", 500000.00),
                    ]
                },
                # 8. Draft (Djezzy)
                {
                    "client_idx": 2, "status": "draft", "seq": None, "year": None,
                    "issue_date": None, "due_date": date(2026, 4, 30), "paid_at": None,
                    "cancelled_at": None, "cancellation_reason": None,
                    "note": "Brouillon en cours de validation avec le chef de projet",
                    "items": [
                        ("Développement module d'exportation de données", 1, "module", 290000.00),
                    ]
                },
            ]

            invoice_ids = []
            for inv in invoices_config:
                cid = client_ids[inv["client_idx"]]

                # Step 1: Create initial invoice as draft to allow adding items per triggers
                cur.execute(
                    """
                    insert into public.invoices (
                        freelancer_id, client_id, status, due_date, currency, total, note
                    ) values (
                        %s, %s, 'draft', %s, 'DZD', 0, %s
                    ) returning id;
                    """,
                    (fid, cid, inv["due_date"], inv["note"]),
                )
                invoice_id = cur.fetchone()[0]
                invoice_ids.append(invoice_id)

                # Step 2: Insert items while in draft state
                total_amount = 0.0
                for desc, qty, unit, unit_price in inv["items"]:
                    line_tot = float(qty) * float(unit_price)
                    total_amount += line_tot
                    cur.execute(
                        """
                        insert into public.invoice_items (
                            invoice_id, description, quantity, unit, unit_price, line_total
                        ) values (%s, %s, %s, %s, %s, %s);
                        """,
                        (invoice_id, desc, qty, unit, unit_price, line_tot),
                    )

                # Step 3: Update total
                cur.execute(
                    """
                    update public.invoices set total = %s where id = %s;
                    """,
                    (total_amount, invoice_id),
                )

                # Step 4: If not draft, insert snapshot, audit events, and transition status
                if inv["status"] != "draft":
                    c_data = clients_data[inv["client_idx"]]
                    c_type_code = "B2B" if c_data[1] == 1 else "B2C"

                    cur.execute(
                        """
                        insert into public.invoice_snapshots (
                            invoice_id, seller_name, seller_address, seller_nif,
                            seller_ai, seller_card_number, seller_rib, client_type,
                            client_name, client_address, client_rc, client_nif, client_nis
                        ) values (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                        );
                        """,
                        (
                            invoice_id,
                            seller_snapshot["seller_name"],
                            seller_snapshot["seller_address"],
                            seller_snapshot["seller_nif"],
                            seller_snapshot["seller_ai"],
                            seller_snapshot["seller_card_number"],
                            seller_snapshot["seller_rib"],
                            c_type_code,
                            c_data[2],  # client_name
                            c_data[3],  # client_address
                            c_data[5],  # client_rc
                            c_data[6],  # client_nif
                            c_data[7],  # client_nis
                        ),
                    )

                    # Update invoice to target status with sequence & dates
                    cur.execute(
                        """
                        update public.invoices set
                            status = %s,
                            sequence_number = %s,
                            number_year = %s,
                            issue_date = %s,
                            paid_at = %s,
                            cancelled_at = %s,
                            cancellation_reason = %s
                        where id = %s;
                        """,
                        (
                            inv["status"],
                            inv["seq"],
                            inv["year"],
                            inv["issue_date"],
                            inv["paid_at"],
                            inv["cancelled_at"],
                            inv["cancellation_reason"],
                            invoice_id,
                        ),
                    )

                    # Insert audit event
                    cur.execute(
                        """
                        insert into public.invoice_audit_events (
                            invoice_id, freelancer_id, event_type
                        ) values (%s, %s, 'issued');
                        """,
                        (invoice_id, fid),
                    )

                    if inv["status"] == "paid":
                        cur.execute(
                            """
                            insert into public.invoice_audit_events (
                                invoice_id, freelancer_id, event_type
                            ) values (%s, %s, 'paid');
                            """,
                            (invoice_id, fid),
                        )
                    elif inv["status"] == "cancelled":
                        cur.execute(
                            """
                            insert into public.invoice_audit_events (
                                invoice_id, freelancer_id, event_type
                            ) values (%s, %s, 'cancelled');
                            """,
                            (invoice_id, fid),
                        )

            print(f"[OK] Seeded {len(invoice_ids)} Invoices across all statuses (IDs: {invoice_ids})")

            # 7. Insert 2 Credit Notes (Factures d'Avoir) linked to Paid Invoices
            # Credit Note 1 -> Linked to Invoice 1 (Paid Sonatrach invoice)
            # Credit Note 2 -> Linked to Invoice 2 (Paid Ooredoo invoice)
            credit_notes_data = [
                (
                    fid,
                    invoice_ids[0],
                    "AV-2026-001",
                    1,
                    2026,
                    100000.00,
                    "Remise commerciale exceptionnelle accordée a posteriori sur prestation cloud",
                    date(2026, 2, 2)
                ),
                (
                    fid,
                    invoice_ids[1],
                    "AV-2026-002",
                    2,
                    2026,
                    200000.00,
                    "Avoir partiel pour ajustement du périmètre livré selon procès-verbal de recette",
                    date(2026, 2, 25)
                ),
            ]

            cn_ids = []
            for cn in credit_notes_data:
                cur.execute(
                    """
                    insert into public.credit_notes (
                        freelancer_id, invoice_id, credit_note_number,
                        sequence_number, number_year, amount, reason, issue_date
                    ) values (%s, %s, %s, %s, %s, %s, %s, %s)
                    returning id;
                    """,
                    cn,
                )
                cn_ids.append(cur.fetchone()[0])

            print(f"[OK] Seeded {len(cn_ids)} Credit Notes (IDs: {cn_ids})")

        conn.commit()
        print("\n=== SEED COMPLETED SUCCESSFULLY ===")
        print(f"- Freelancer ID: {fid} (Sara Benali)")
        print(f"- Clients: {len(client_ids)}")
        print(f"- Invoices: {len(invoice_ids)} (4 Paid, 2 Issued, 1 Cancelled, 1 Draft)")
        print(f"- Credit Notes: {len(cn_ids)} (AV-2026-001, AV-2026-002)")

    except Exception as exc:
        conn.rollback()
        print(f"[ERROR] Database seeding failed: {exc}")
        raise exc
    finally:
        conn.close()


if __name__ == "__main__":
    seed_database()
