create type public.language_code as enum ('fr', 'ar');
create type public.theme_mode as enum ('light', 'dark', 'system');

create table public.user_preferences (
  freelancer_id bigint primary key
    references public.freelancers(id) on delete cascade,
  language public.language_code not null default 'fr',
  theme public.theme_mode not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create table public.client_types (
  id smallint generated always as identity primary key,
  code varchar(10) not null unique
);

insert into public.client_types (code) values ('B2B'), ('B2C');

create table public.clients (
  id bigint generated always as identity primary key,
  freelancer_id bigint not null
    references public.freelancers(id) on delete restrict,
  client_type_id smallint not null
    references public.client_types(id) on delete restrict,
  name varchar(200) not null,
  address varchar(255) not null,
  country char(2) not null default 'DZ',
  rc varchar(50),
  nif varchar(20),
  nis varchar(50),
  email varchar(255),
  phone varchar(20),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- no duplicate NIF per freelancer (B2C has no NIF, so it is not affected)
create unique index clients_freelancer_nif_uniq
  on public.clients (freelancer_id, nif) where nif is not null;

create index clients_freelancer_archived_idx
  on public.clients (freelancer_id, archived_at);

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();
  