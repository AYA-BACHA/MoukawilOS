-- 010_credit_notes_and_preferences.sql
-- Migration: Add credit_notes table and expand user_preferences

-- 1. Extend user_preferences with statutory preferences
alter table public.user_preferences
  add column if not exists default_payment_terms_days smallint not null default 30 check (default_payment_terms_days > 0),
  add column if not exists append_exemption_clause boolean not null default true;

-- 2. Create credit_notes table (Factures d'Avoir)
-- Corrective commercial document per Décret exécutif n° 05-468 art. 11
create table if not exists public.credit_notes (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null
    references public.freelancers(id) on delete restrict,
  invoice_id bigint not null
    references public.invoices(id) on delete restrict,
  credit_note_number varchar(30) not null,
  sequence_number integer not null check (sequence_number > 0),
  number_year smallint not null,
  amount numeric(14,2) not null check (amount > 0),
  reason varchar(500) not null check (length(trim(reason)) > 0),
  issue_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint credit_notes_number_format check (credit_note_number ~ '^AV-[0-9]{4}-[0-9]{3,}$'),
  constraint credit_notes_year_matches check (number_year = extract(year from issue_date))
);

create unique index if not exists credit_notes_freelancer_seq_uniq
  on public.credit_notes (freelancer_id, number_year, sequence_number);

create unique index if not exists credit_notes_freelancer_number_uniq
  on public.credit_notes (freelancer_id, credit_note_number);

create index if not exists credit_notes_invoice_idx on public.credit_notes (invoice_id);
create index if not exists credit_notes_freelancer_idx on public.credit_notes (freelancer_id);

drop trigger if exists credit_notes_updated_at on public.credit_notes;
create trigger credit_notes_updated_at
  before update on public.credit_notes
  for each row execute function public.set_updated_at();

