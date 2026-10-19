create table public.obligation_types (
  id bigint generated always as identity primary key,
  code varchar(50) not null unique
);

create table public.obligation_definitions (
  id bigint generated always as identity primary key,
  obligation_type_id bigint not null
    references public.obligation_types(id) on delete restrict,
  start_month smallint check (start_month between 1 and 12),
  start_day smallint check (start_day between 1 and 31),
  end_month smallint check (end_month between 1 and 12),
  end_day smallint check (end_day between 1 and 31),
  year_offset smallint not null default 0 check (year_offset in (0, 1)),
  days_after_card_date smallint check (days_after_card_date > 0),
  amount_rule_definition_id bigint
    references public.rule_definitions(id) on delete restrict,
  official_link varchar(255),
  effective_from date not null,
  created_at timestamptz not null default now(),
  unique (obligation_type_id, effective_from),

  -- either a fixed window or a relative deadline, never both, never neither
  constraint obligation_deadline_shape check (
    (start_month is not null and start_day is not null
      and end_month is not null and end_day is not null
      and days_after_card_date is null)
    or
    (days_after_card_date is not null
      and start_month is null and start_day is null
      and end_month is null and end_day is null)
  )
);

create table public.obligation_completions (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null
    references public.freelancers(id) on delete cascade,
  obligation_type_id bigint not null
    references public.obligation_types(id) on delete restrict,
  period_year smallint not null,
  created_at timestamptz not null default now(),
  unique (freelancer_id, obligation_type_id, period_year)
);