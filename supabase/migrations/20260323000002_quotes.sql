-- Quote catalog (default unit prices) + saved quotes + line items.
-- Run in Supabase SQL Editor after prior migrations.

create table if not exists public.quote_catalog_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  default_unit_price numeric(14, 2) not null check (default_unit_price >= 0),
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_org_name text,
  contact_name text,
  project_title text,
  quote_reference text,
  segment text not null default 'small_biopharma',
  sample_volume int not null default 0 check (sample_volume >= 0),
  rush_priority boolean not null default false,
  rush_2day boolean not null default false,
  notes text,
  subtotal_amount numeric(14, 2) not null default 0,
  segment_adjustment_amount numeric(14, 2) not null default 0,
  after_segment_amount numeric(14, 2) not null default 0,
  volume_discount_amount numeric(14, 2) not null default 0,
  after_volume_amount numeric(14, 2) not null default 0,
  rush_uplift_amount numeric(14, 2) not null default 0,
  total_amount numeric(14, 2) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_user_id_idx on public.quotes (user_id);
create index if not exists quotes_created_at_idx on public.quotes (created_at desc);

create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  catalog_service_id uuid references public.quote_catalog_services (id) on delete set null,
  label text not null,
  quantity numeric(14, 4) not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  default_unit_price_snapshot numeric(14, 2) not null,
  is_price_overridden boolean not null default false,
  line_total numeric(14, 2) not null,
  sort_order int not null default 0
);

create index if not exists quote_line_items_quote_id_idx on public.quote_line_items (quote_id);

alter table public.quote_catalog_services enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_line_items enable row level security;

drop policy if exists "quote_catalog_read" on public.quote_catalog_services;
create policy "quote_catalog_read"
  on public.quote_catalog_services for select
  to authenticated
  using (active = true);

drop policy if exists "quotes_own" on public.quotes;
create policy "quotes_own"
  on public.quotes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "quote_lines_own" on public.quote_line_items;
create policy "quote_lines_own"
  on public.quote_line_items for all
  to authenticated
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id and q.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id and q.user_id = auth.uid()
    )
  );

insert into public.quote_catalog_services (slug, name, description, default_unit_price, sort_order)
values
  ('accessioning', 'Accessioning & processing', 'Intake through processing', 85.00, 1),
  ('he_glass', 'H&E — glass slide', 'Routine H&E staining', 48.00, 2),
  ('special_stain', 'Special stain (each)', 'Non-IHC special stains', 95.00, 3),
  ('ihc_duplex', 'IHC duplex panel', 'Two antibodies, optimized', 280.00, 4),
  ('ihc_panel5', 'IHC panel (up to 5)', 'Multiplex IHC panel', 420.00, 5),
  ('digital_scan', 'Digital slide scan', 'Whole-slide imaging', 35.00, 6),
  ('path_read', 'Pathologist read / sign-out', 'Professional evaluation', 175.00, 7),
  ('consult', 'Consultation (30 min)', 'Pathologist consultation', 250.00, 8)
on conflict (slug) do nothing;
