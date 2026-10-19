create type public.rule_unit as enum ('percent', 'dzd', 'count', 'days');

create table public.rule_definitions (
  id bigint generated always as identity primary key,
  code varchar(50) not null unique,
  unit public.rule_unit not null,
  created_at timestamptz not null default now()
);

create table public.rules (
  id bigint generated always as identity primary key,
  rule_definition_id bigint not null
    references public.rule_definitions(id) on delete restrict,
  value numeric(18,6) not null,
  valid_from date not null,
  source varchar(255) not null,
  created_at timestamptz not null default now(),
  unique (rule_definition_id, valid_from)
);

create index rules_active_idx
  on public.rules (rule_definition_id, valid_from desc);