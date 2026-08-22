-- PathX internal antibody registry (authenticated lab users).

create table if not exists public.pathx_antibodies (
  id uuid primary key default gen_random_uuid(),
  antibody_name text not null default '',
  vendor_name text not null default '',
  catalog text not null default '',
  lot_number text not null default '',
  ig_species text not null default '',
  working_concentration text not null default '',
  antigen_retrieval text not null default '',
  detection_method text not null default '',
  last_updated_by text not null default '',
  provided_by text not null default '',
  date_provided date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pathx_antibodies_antibody_name_idx
  on public.pathx_antibodies (antibody_name);
create index if not exists pathx_antibodies_vendor_name_idx
  on public.pathx_antibodies (vendor_name);
create index if not exists pathx_antibodies_catalog_idx
  on public.pathx_antibodies (catalog);
create index if not exists pathx_antibodies_updated_at_idx
  on public.pathx_antibodies (updated_at desc);
create index if not exists pathx_antibodies_date_provided_idx
  on public.pathx_antibodies (date_provided desc);

alter table public.pathx_antibodies enable row level security;

drop policy if exists "pathx_antibodies_authenticated_all" on public.pathx_antibodies;
create policy "pathx_antibodies_authenticated_all"
  on public.pathx_antibodies for all
  to authenticated
  using (true)
  with check (true);
