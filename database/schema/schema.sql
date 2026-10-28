-- MoukawilOS schema, reconstructed for local testing from the original SQL plus
-- the differences found in the live Supabase database (payment_rail, details,
-- obligation_definitions extras, immutability triggers, fixed snapshot_b2b_ids).

create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create or replace function public.block_changes()
returns trigger language plpgsql as $$
begin
  raise exception '% on % is not allowed (append-only)', tg_op, tg_table_name;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create type public.past_years_status as enum ('unknown', 'confirmed');

create table public.freelancers (
  id bigint generated always as identity primary key,
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  first_name text, last_name text, address text, trade_address text, phone text,
  nif char(15) check (nif ~ '^[0-9]{15}$'),
  ai_number char(11) check (ai_number ~ '^[0-9]{11}$'),
  rib char(20) check (rib ~ '^[0-9]{20}$'),
  anae_card_number char(9) check (anae_card_number ~ '^[0-9]{2}-[0-9]{6}$'),
  anae_card_issue_date date,
  activity_start_date date,
  past_years_status public.past_years_status not null default 'unknown',
  last_invoice_number integer not null default 0 check (last_invoice_number >= 0),
  last_invoice_year smallint,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger freelancers_updated_at before update on public.freelancers
  for each row execute function public.set_updated_at();

create type public.language_code as enum ('fr', 'ar');
create type public.theme_mode as enum ('light', 'dark', 'system');

create table public.user_preferences (
  freelancer_id bigint primary key references public.freelancers(id) on delete cascade,
  language public.language_code not null default 'fr',
  theme public.theme_mode not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();

create table public.client_types (
  id smallint generated always as identity primary key,
  code varchar(10) not null unique
);
insert into public.client_types (code) values ('B2B'), ('B2C');

create table public.clients (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null references public.freelancers(id) on delete restrict,
  client_type_id smallint not null references public.client_types(id) on delete restrict,
  name varchar(200) not null,
  address varchar(255) not null,
  country char(2) not null default 'DZ',
  rc varchar(50), nif varchar(20), nis varchar(50),
  email varchar(255), phone varchar(20),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index clients_freelancer_nif_uniq on public.clients (freelancer_id, nif) where nif is not null;
create index clients_freelancer_archived_idx on public.clients (freelancer_id, archived_at);
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

create type public.invoice_status as enum ('draft', 'issued', 'paid', 'cancelled');
create type public.payment_rail as enum ('cash', 'bank_transfer', 'cheque', 'ccp', 'card');

create table public.invoices (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null references public.freelancers(id) on delete restrict,
  client_id bigint not null references public.clients(id) on delete restrict,
  status public.invoice_status not null default 'draft',
  sequence_number integer,
  number_year smallint,
  issue_date date,
  due_date date,
  currency char(3) not null default 'DZD',
  total numeric(14,2) not null default 0 check (total >= 0),
  paid_at date,
  cancelled_at timestamptz,
  cancellation_reason varchar(500),
  note varchar(1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payment_rail public.payment_rail,
  constraint invoices_sequence_positive check (sequence_number is null or sequence_number > 0),
  constraint invoices_draft_shape check (
    status <> 'draft' or (sequence_number is null and number_year is null and issue_date is null)),
  constraint invoices_issued_shape check (
    status = 'draft' or (sequence_number is not null and number_year is not null and issue_date is not null)),
  constraint invoices_year_matches check (
    issue_date is null or number_year = extract(year from issue_date)),
  constraint invoices_paid_shape check (
    (status = 'paid' and paid_at is not null) or (status <> 'paid' and paid_at is null)),
  constraint invoices_cancelled_shape check (
    status <> 'cancelled' or (cancelled_at is not null and cancellation_reason is not null)),
  constraint invoices_paid_after_issue check (
    paid_at is null or issue_date is null or paid_at >= issue_date)
);
create unique index invoices_number_uniq on public.invoices (freelancer_id, number_year, sequence_number);
create index invoices_freelancer_status_idx on public.invoices (freelancer_id, status);
create index invoices_freelancer_issue_idx on public.invoices (freelancer_id, issue_date);
create index invoices_client_idx on public.invoices (client_id);
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

create table public.invoice_items (
  id bigint generated always as identity primary key,
  invoice_id bigint not null references public.invoices(id) on delete cascade,
  description varchar(500) not null check (length(description) > 0),
  quantity numeric(10,2) not null check (quantity > 0),
  unit varchar(30),
  unit_price numeric(14,2) not null check (unit_price > 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);
create index invoice_items_invoice_idx on public.invoice_items (invoice_id);

create or replace function public.items_only_in_draft()
returns trigger language plpgsql as $$
declare inv_id bigint; st public.invoice_status;
begin
  inv_id := coalesce(new.invoice_id, old.invoice_id);
  select status into st from public.invoices where id = inv_id;
  if st is not null and st <> 'draft' then
    raise exception 'invoice % is not a draft, items are frozen', inv_id;
  end if;
  return coalesce(new, old);
end $$;
create trigger items_frozen before insert or delete or update on public.invoice_items
  for each row execute function public.items_only_in_draft();

create table public.invoice_snapshots (
  invoice_id bigint primary key references public.invoices(id) on delete restrict,
  seller_name varchar(200) not null,
  seller_address varchar(255) not null,
  seller_nif char(15) not null,
  seller_ai char(11),
  seller_card_number char(9) not null,
  seller_rib char(20) not null,
  client_type varchar(3) not null check (client_type in ('B2B', 'B2C')),
  client_name varchar(200) not null,
  client_address varchar(255) not null,
  client_rc varchar(50), client_nif varchar(20), client_nis varchar(50),
  created_at timestamptz not null default now(),
  constraint snapshot_b2b_ids check (client_type <> 'B2B' or (client_nif is not null and client_nis is not null))
);
create trigger snapshots_immutable before update or delete on public.invoice_snapshots
  for each row execute function public.block_changes();

create type public.invoice_event_type as enum ('issued', 'paid', 'unpaid', 'cancelled');
create table public.invoice_audit_events (
  id bigint generated always as identity primary key,
  invoice_id bigint not null references public.invoices(id) on delete restrict,
  freelancer_id bigint not null references public.freelancers(id) on delete restrict,
  event_type public.invoice_event_type not null,
  paid_at date,
  created_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb,
  constraint audit_paid_at_shape check (
    (event_type = 'unpaid' and paid_at is not null) or (event_type <> 'unpaid' and paid_at is null))
);
create index invoice_audit_invoice_idx on public.invoice_audit_events (invoice_id, created_at);
create trigger audit_append_only before update or delete on public.invoice_audit_events
  for each row execute function public.block_changes();

create table public.manual_income_entries (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null references public.freelancers(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  received_date date not null,
  note varchar(500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index manual_income_freelancer_date_idx on public.manual_income_entries (freelancer_id, received_date);
create trigger manual_income_updated_at before update on public.manual_income_entries
  for each row execute function public.set_updated_at();

create type public.rule_unit as enum ('percent', 'dzd', 'count', 'days');
create table public.rule_definitions (
  id bigint generated always as identity primary key,
  code varchar(50) not null unique,
  unit public.rule_unit not null,
  created_at timestamptz not null default now()
);
create table public.rules (
  id bigint generated always as identity primary key,
  rule_definition_id bigint not null references public.rule_definitions(id) on delete restrict,
  value numeric(18,6) not null,
  valid_from date not null,
  source varchar(255) not null,
  created_at timestamptz not null default now(),
  unique (rule_definition_id, valid_from)
);
create index rules_active_idx on public.rules (rule_definition_id, valid_from desc);
create trigger rules_immutable before update or delete on public.rules
  for each row execute function public.block_changes();

create table public.obligation_types (
  id bigint generated always as identity primary key,
  code varchar(50) not null unique
);
create table public.obligation_definitions (
  id bigint generated always as identity primary key,
  obligation_type_id bigint not null references public.obligation_types(id) on delete restrict,
  start_month smallint check (start_month between 1 and 12),
  start_day smallint check (start_day between 1 and 31),
  end_month smallint check (end_month between 1 and 12),
  end_day smallint check (end_day between 1 and 31),
  year_offset smallint not null default 0 check (year_offset in (0, 1)),
  days_after_card_date smallint check (days_after_card_date > 0),
  amount_rule_definition_id bigint references public.rule_definitions(id) on delete restrict,
  official_link varchar(255),
  effective_from date not null,
  created_at timestamptz not null default now(),
  note text,
  verified boolean not null default false,
  anchor_activity_start boolean not null default false,
  unique (obligation_type_id, effective_from),
  constraint obligation_deadline_shape check (
    (start_month is not null and start_day is not null and end_month is not null and end_day is not null and days_after_card_date is null)
    or (days_after_card_date is not null and start_month is null and start_day is null and end_month is null and end_day is null))
);
create table public.obligation_completions (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null references public.freelancers(id) on delete cascade,
  obligation_type_id bigint not null references public.obligation_types(id) on delete restrict,
  period_year smallint not null,
  created_at timestamptz not null default now(),
  unique (freelancer_id, obligation_type_id, period_year)
);