-- Admin-editable pricing: global rules + catalog unit prices (authenticated internal users).

create table if not exists public.quote_pricing_settings (
  id smallint primary key default 1 check (id = 1),
  rush_priority_percent numeric(5, 2) not null default 25
    check (rush_priority_percent >= 0 and rush_priority_percent <= 100),
  rush_2day_percent numeric(5, 2) not null default 10
    check (rush_2day_percent >= 0 and rush_2day_percent <= 100),
  quote_validity_days int not null default 30 check (quote_validity_days > 0),
  lab_address text not null default '',
  contact_email text not null default '',
  segment_multipliers jsonb not null default '{
    "academic": 0.9,
    "small_biopharma": 1,
    "mid_biopharma": 1.12,
    "large_biopharma": 1.22
  }'::jsonb,
  volume_tiers jsonb not null default '[
    {"min": 1, "max": 15, "discountPercent": 0},
    {"min": 16, "max": 50, "discountPercent": 5},
    {"min": 51, "max": 150, "discountPercent": 10},
    {"min": 151, "max": 999999, "discountPercent": 15}
  ]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.quote_pricing_settings (id) values (1)
on conflict (id) do nothing;

alter table public.quote_pricing_settings enable row level security;

drop policy if exists "quote_pricing_settings_read" on public.quote_pricing_settings;
create policy "quote_pricing_settings_read"
  on public.quote_pricing_settings for select
  to authenticated
  using (true);

drop policy if exists "quote_pricing_settings_insert" on public.quote_pricing_settings;
create policy "quote_pricing_settings_insert"
  on public.quote_pricing_settings for insert
  to authenticated
  with check (id = 1);

drop policy if exists "quote_pricing_settings_update" on public.quote_pricing_settings;
create policy "quote_pricing_settings_update"
  on public.quote_pricing_settings for update
  to authenticated
  using (true)
  with check (id = 1);

-- Catalog: allow read all rows (builder filters active=true); allow price updates.
drop policy if exists "quote_catalog_read" on public.quote_catalog_services;
drop policy if exists "quote_catalog_select" on public.quote_catalog_services;

create policy "quote_catalog_select"
  on public.quote_catalog_services for select
  to authenticated
  using (true);

drop policy if exists "quote_catalog_update" on public.quote_catalog_services;
create policy "quote_catalog_update"
  on public.quote_catalog_services for update
  to authenticated
  using (true)
  with check (true);
