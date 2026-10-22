create type public.invoice_status as enum ('draft', 'issued', 'paid', 'cancelled');

create table public.invoices (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null
    references public.freelancers(id) on delete restrict,
  client_id bigint not null
    references public.clients(id) on delete restrict,

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

  -- sequence must be positive
  constraint invoices_sequence_positive
    check (sequence_number is null or sequence_number > 0),

  -- draft: no number, no year, no issue date
  constraint invoices_draft_shape check (
    status <> 'draft'
    or (sequence_number is null and number_year is null and issue_date is null)
  ),
  -- not draft: all three set
  constraint invoices_issued_shape check (
    status = 'draft'
    or (sequence_number is not null and number_year is not null and issue_date is not null)
  ),
  -- year of the number = year of the issue date
  constraint invoices_year_matches check (
    issue_date is null or number_year = extract(year from issue_date)
  ),
  -- paid <=> paid_at set
  constraint invoices_paid_shape check (
    (status = 'paid' and paid_at is not null)
    or (status <> 'paid' and paid_at is null)
  ),
  -- cancelled needs date and reason
  constraint invoices_cancelled_shape check (
    status <> 'cancelled'
    or (cancelled_at is not null and cancellation_reason is not null)
  ),
  -- payment date not before issue date
  constraint invoices_paid_after_issue check (
    paid_at is null or issue_date is null or paid_at >= issue_date
  )
);

create unique index invoices_number_uniq
  on public.invoices (freelancer_id, number_year, sequence_number);

create index invoices_freelancer_status_idx on public.invoices (freelancer_id, status);
create index invoices_freelancer_issue_idx on public.invoices (freelancer_id, issue_date);
create index invoices_client_idx on public.invoices (client_id);

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();