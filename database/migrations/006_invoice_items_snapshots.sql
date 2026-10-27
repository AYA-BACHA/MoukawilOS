create table public.invoice_items (
  id bigint generated always as identity primary key,
  invoice_id bigint not null
    references public.invoices(id) on delete cascade,
  description varchar(500) not null check (length(description) > 0),
  quantity numeric(10,2) not null check (quantity > 0),
  unit varchar(30),
  unit_price numeric(14,2) not null check (unit_price > 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index invoice_items_invoice_idx on public.invoice_items (invoice_id);

create table public.invoice_snapshots (
  invoice_id bigint primary key
    references public.invoices(id) on delete restrict,

  seller_name varchar(200) not null,
  seller_address varchar(255) not null,
  seller_nif char(15) not null,
  seller_ai char(11),
  seller_card_number char(9) not null,
  seller_rib char(20) not null,

  client_type varchar(3) not null check (client_type in ('B2B', 'B2C')),
  client_name varchar(200) not null,
  client_address varchar(255) not null,
  client_rc varchar(50),
  client_nif varchar(20),
  client_nis varchar(50),

  created_at timestamptz not null default now(),

  constraint snapshot_b2b_ids check (
    client_type <> 'B2B'
    or (client_rc is not null and client_nif is not null and client_nis is not null)
  )
);

create index invoice_snapshots_client_nif_idx on public.invoice_snapshots (client_nif);