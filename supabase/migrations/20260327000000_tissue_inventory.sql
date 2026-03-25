-- Tissue block inventory (imported from legacy data.json + internal workflow).

create type public.tissue_block_status as enum ('available', 'sold', 'discarded');

create table if not exists public.tissue_inventory (
  id uuid primary key default gen_random_uuid(),
  accession text not null,
  dob text,
  gender text,
  tissue text not null,
  diag_short text,
  diag_text text,
  category text not null,
  source_tab text not null default 'Sheet1',
  catalog_id text,
  status public.tissue_block_status not null default 'available',
  sold_at timestamptz,
  sold_note text,
  discarded_at timestamptz,
  discarded_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists tissue_inventory_catalog_id_idx
  on public.tissue_inventory (catalog_id);
create index if not exists tissue_inventory_accession_idx
  on public.tissue_inventory (accession);
create index if not exists tissue_inventory_tissue_idx
  on public.tissue_inventory (tissue);
create index if not exists tissue_inventory_category_idx
  on public.tissue_inventory (category);
create index if not exists tissue_inventory_gender_idx
  on public.tissue_inventory (gender);
create index if not exists tissue_inventory_status_idx
  on public.tissue_inventory (status);
create index if not exists tissue_inventory_created_at_idx
  on public.tissue_inventory (created_at desc);

-- Prefer one row per catalog id when present (legacy data uses catalog_id as public ID).
create unique index if not exists tissue_inventory_catalog_id_unique
  on public.tissue_inventory (catalog_id)
  where catalog_id is not null and btrim(catalog_id) <> '';

alter table public.tissue_inventory enable row level security;

-- Authenticated users: full access (per product requirement).
drop policy if exists "tissue_inventory_authenticated_all" on public.tissue_inventory;
create policy "tissue_inventory_authenticated_all"
  on public.tissue_inventory for all
  to authenticated
  using (true)
  with check (true);

-- Anonymous users may read only available blocks (defense in depth; public app may use service role instead).
drop policy if exists "tissue_inventory_anon_select_available" on public.tissue_inventory;
create policy "tissue_inventory_anon_select_available"
  on public.tissue_inventory for select
  to anon
  using (status = 'available'::public.tissue_block_status);
