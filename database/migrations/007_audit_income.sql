create type public.invoice_event_type as enum ('issued', 'paid', 'unpaid', 'cancelled');

create table public.invoice_audit_events (
  id bigint generated always as identity primary key,
  invoice_id bigint not null
    references public.invoices(id) on delete restrict,
  freelancer_id bigint not null
    references public.freelancers(id) on delete restrict,
  event_type public.invoice_event_type not null,
  paid_at date,
  created_at timestamptz not null default now(),

  -- the date is stored only when a payment is undone
  constraint audit_paid_at_shape check (
    (event_type = 'unpaid' and paid_at is not null)
    or (event_type <> 'unpaid' and paid_at is null)
  )
);

create index invoice_audit_invoice_idx
  on public.invoice_audit_events (invoice_id, created_at);

create table public.manual_income_entries (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null
    references public.freelancers(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  received_date date not null,
  note varchar(500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index manual_income_freelancer_date_idx
  on public.manual_income_entries (freelancer_id, received_date);

create trigger manual_income_updated_at
  before update on public.manual_income_entries
  for each row execute function public.set_updated_at();