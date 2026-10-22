-- MoukawilOS demo data (DEV ONLY, never run in production)
--
-- BEFORE running:
--   Supabase dashboard > Authentication > Users > Add user > Create new user
--   email: demo@moukawilos.dz   password: Demo12345678   tick "Auto Confirm User"
--
-- Safe to re-run: it wipes the demo user's data first, then recreates it.

do $$
declare
  uid uuid;
  fid bigint;
  cid bigint;
  inv bigint;
  v_total numeric(14,2);
  line numeric(14,2);
  r record;
  it record;
begin
  select id into uid from auth.users where email = 'demo@moukawilos.dz';
  if uid is null then
    raise exception 'Create the demo user first (demo@moukawilos.dz)';
  end if;
  insert into public.profiles (id) values (uid) on conflict do nothing;

  -- ---------- wipe previous demo data ----------
  select id into fid from public.freelancers where profile_id = uid;
  if fid is not null then
    alter table public.invoice_audit_events disable trigger audit_append_only;
    alter table public.invoice_items        disable trigger items_frozen;
    alter table public.invoice_snapshots    disable trigger snapshots_immutable;

    delete from public.invoice_audit_events where freelancer_id = fid;
    delete from public.invoice_snapshots
      where invoice_id in (select id from public.invoices where freelancer_id = fid);
    delete from public.invoice_items
      where invoice_id in (select id from public.invoices where freelancer_id = fid);
    delete from public.invoices where freelancer_id = fid;
    delete from public.clients where freelancer_id = fid;
    delete from public.obligation_completions where freelancer_id = fid;
    delete from public.manual_income_entries where freelancer_id = fid;
    delete from public.user_preferences where freelancer_id = fid;
    delete from public.freelancers where id = fid;

    alter table public.invoice_audit_events enable trigger audit_append_only;
    alter table public.invoice_items        enable trigger items_frozen;
    alter table public.invoice_snapshots    enable trigger snapshots_immutable;
  end if;

  -- ---------- freelancer (complete profile) ----------
  insert into public.freelancers
    (profile_id, first_name, last_name, address, trade_address, phone,
     nif, ai_number, rib, anae_card_number, anae_card_issue_date,
     activity_start_date, past_years_status, onboarding_completed_at)
  values
    (uid, 'Sara', 'Benali', 'Rue Didouche Mourad, Alger',
     'Rue Didouche Mourad, Alger', '0555123456',
     '099916000123456', '16012345678', '00799999001234567890',
     '23-123456', '2025-10-15', '2025-10-15', 'confirmed', now())
  returning id into fid;

  insert into public.user_preferences (freelancer_id) values (fid);

  -- ---------- clients ----------
  insert into public.clients (freelancer_id, client_type_id, name, address, rc, nif, nis, email, phone)
  select fid, t.id, v.name, v.address, v.rc, v.nif, v.nis, v.email, v.phone
  from (values
    ('B2B', 'Sonatrach Digital SPA', 'Hydra, Alger', '16/00-1234567B20',
     '000216001234567', '000216010123456', 'achats@sonatrach-digital.dz', '021000001'),
    ('B2B', 'Ooredoo Algérie', 'Bab Ezzouar, Alger', '16/00-7654321B15',
     '000216007654321', '000216010654321', 'it@ooredoo.dz', '0770000002'),
    ('B2C', 'Yacine Mansouri', 'Oran', null, null, null, 'yacine@example.dz', '0550000003'),
    ('B2C', 'Amel Cherif', 'Constantine', null, null, null, null, null)
  ) as v(type, name, address, rc, nif, nis, email, phone)
  join public.client_types t on t.code = v.type;

  insert into public.clients (freelancer_id, client_type_id, name, address, archived_at)
  select fid, id, 'Ancien Client (archivé)', 'Blida', now()
  from public.client_types where code = 'B2C';

  -- ---------- invoices ----------
  for r in
    select * from jsonb_to_recordset($j$[
      {"client":"Sonatrach Digital SPA","status":"paid","seq":1,"issue":"2025-11-10","paid":"2025-12-05",
       "items":[{"description":"Développement application web","quantity":10,"unit":"jours","unit_price":12000}]},
      {"client":"Yacine Mansouri","status":"paid","seq":2,"issue":"2025-12-01","paid":"2025-12-20",
       "items":[{"description":"Création de logo","quantity":1,"unit_price":45000}]},

      {"client":"Ooredoo Algérie","status":"paid","seq":1,"issue":"2026-01-15","paid":"2026-02-10",
       "note":"Refonte du site",
       "items":[{"description":"Refonte site web","quantity":1,"unit_price":450000},
                {"description":"Hébergement annuel","quantity":12,"unit":"mois","unit_price":2500}]},
      {"client":"Sonatrach Digital SPA","status":"paid","seq":2,"issue":"2026-03-05","paid":"2026-04-02",
       "items":[{"description":"Développement API","quantity":20,"unit":"jours","unit_price":15000}]},
      {"client":"Amel Cherif","status":"paid","seq":3,"issue":"2026-05-12","paid":"2026-05-30",
       "items":[{"description":"Traduction technique","quantity":8.5,"unit":"heures","unit_price":3000}]},
      {"client":"Ooredoo Algérie","status":"issued","seq":4,"issue":"2026-07-01","due":"2026-08-01",
       "note":"En retard de paiement",
       "items":[{"description":"Maintenance applicative","quantity":6,"unit":"mois","unit_price":20000}]},
      {"client":"Amel Cherif","status":"cancelled","seq":5,"issue":"2026-08-02",
       "reason":"Erreur de montant, nouvelle facture émise",
       "items":[{"description":"Design de brochure","quantity":1,"unit_price":80000}]},
      {"client":"Yacine Mansouri","status":"issued","seq":6,"issue":"2026-09-10","due":"2026-11-10",
       "items":[{"description":"Formation WordPress","quantity":3,"unit":"jours","unit_price":18000}]},

      {"client":"Sonatrach Digital SPA","status":"draft",
       "note":"Brouillon à compléter",
       "items":[{"description":"Audit technique","quantity":2,"unit":"jours","unit_price":25000}]},
      {"client":"Yacine Mansouri","status":"draft","items":[]}
    ]$j$::jsonb) as x(client text, status text, seq int, issue date, paid date,
                      due date, note text, reason text, items jsonb)
  loop
    select id into cid from public.clients where freelancer_id = fid and name = r.client;

    insert into public.invoices (freelancer_id, client_id, due_date, note)
    values (fid, cid, r.due, r.note)
    returning id into inv;

    v_total := 0;
    for it in
      select * from jsonb_to_recordset(r.items)
        as y(description text, quantity numeric, unit text, unit_price numeric)
    loop
      line := round(it.quantity * it.unit_price, 2);
      insert into public.invoice_items
        (invoice_id, description, quantity, unit, unit_price, line_total)
      values (inv, it.description, it.quantity, it.unit, it.unit_price, line);
      v_total := v_total + line;
    end loop;

    update public.invoices set total = v_total where id = inv;

    if r.status <> 'draft' then
      insert into public.invoice_snapshots
        (invoice_id, seller_name, seller_address, seller_nif, seller_ai,
         seller_card_number, seller_rib, client_type, client_name,
         client_address, client_rc, client_nif, client_nis)
      select inv, 'Sara Benali', 'Rue Didouche Mourad, Alger', '099916000123456',
             '16012345678', '23-123456', '00799999001234567890',
             t.code, c.name, c.address, c.rc, c.nif, c.nis
      from public.clients c
      join public.client_types t on t.id = c.client_type_id
      where c.id = cid;

      update public.invoices set
        status = r.status::public.invoice_status,
        sequence_number = r.seq,
        number_year = extract(year from r.issue)::smallint,
        issue_date = r.issue,
        paid_at = r.paid,
        cancelled_at = case when r.status = 'cancelled' then (r.issue + 10)::timestamptz end,
        cancellation_reason = r.reason
      where id = inv;

      insert into public.invoice_audit_events (invoice_id, freelancer_id, event_type)
      values (inv, fid, 'issued');
      if r.status = 'paid' then
        insert into public.invoice_audit_events (invoice_id, freelancer_id, event_type)
        values (inv, fid, 'paid');
      elsif r.status = 'cancelled' then
        insert into public.invoice_audit_events (invoice_id, freelancer_id, event_type)
        values (inv, fid, 'cancelled');
      end if;
    end if;
  end loop;

  -- invoice counter = last number issued in 2026
  update public.freelancers
  set last_invoice_number = 6, last_invoice_year = 2026
  where id = fid;

  -- ---------- income outside the platform ----------
  insert into public.manual_income_entries (freelancer_id, amount, received_date, note) values
    (fid, 60000.00,  '2025-10-25', 'Premier contrat avant la plateforme'),
    (fid, 150000.00, '2026-01-20', 'Missions payées en espèces');

  -- ---------- obligations already done ----------
  insert into public.obligation_completions (freelancer_id, obligation_type_id, period_year)
  select fid, id, 2025 from public.obligation_types where code = 'NIF_DECLARATION';
  insert into public.obligation_completions (freelancer_id, obligation_type_id, period_year)
  select fid, id, 2026 from public.obligation_types where code = 'CASNOS_PAYMENT';
end $$;

-- Check: should show 10 invoices (5 paid, 2 issued, 1 cancelled, 2 draft)
select status, count(*) from public.invoices
where freelancer_id = (select f.id from public.freelancers f
                       join auth.users u on u.id = f.profile_id
                       where u.email = 'demo@moukawilos.dz')
group by status order by status;