create type public.past_years_status as enum ('unknown', 'confirmed');

create table public.freelancers (
  id bigint generated always as identity primary key,
  profile_id uuid not null unique
    references public.profiles(id) on delete cascade,

  first_name text,
  last_name text,
  address text,
  trade_address text,
  phone text,

  nif char(15) check (nif ~ '^[0-9]{15}$'),
  ai_number char(11) check (ai_number ~ '^[0-9]{11}$'),
  rib char(20) check (rib ~ '^[0-9]{20}$'),
  anae_card_number char(9) check (anae_card_number ~ '^[0-9]{2}-[0-9]{6}$'),
  anae_card_issue_date date,
  activity_start_date date,

  past_years_status public.past_years_status not null default 'unknown',

  last_invoice_number integer not null default 0
    check (last_invoice_number >= 0),
  last_invoice_year smallint,

  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger freelancers_updated_at
  before update on public.freelancers
  for each row execute function public.set_updated_at();