-- LIMS: projects (from quotes), samples, slides, metadata, workflow steps.

create type public.lims_project_status as enum (
  'created',
  'started',
  'blocked',
  'shipped',
  'completed',
  'cancelled'
);

create type public.lims_species_kind as enum ('human', 'animal');

create table if not exists public.lims_projects (
  id uuid primary key default gen_random_uuid(),
  project_reference text not null,
  source_quote_id uuid references public.quotes (id) on delete set null,
  client_org_name text,
  client_address text,
  contact_name text,
  project_title text,
  procedures text,
  details text,
  status public.lims_project_status not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create unique index if not exists lims_projects_project_reference_unique
  on public.lims_projects (project_reference);

create index if not exists lims_projects_source_quote_id_idx
  on public.lims_projects (source_quote_id);
create index if not exists lims_projects_status_idx
  on public.lims_projects (status);
create index if not exists lims_projects_created_at_idx
  on public.lims_projects (created_at desc);

create table if not exists public.lims_samples (
  id uuid primary key default gen_random_uuid(),
  sample_reference text not null,
  project_id uuid not null references public.lims_projects (id) on delete cascade,
  name text not null,
  client_sample_id text,
  species_kind public.lims_species_kind not null default 'human',
  tissue_type text not null default '',
  organ_abbrev text,
  diagnostic text,
  date_received date,
  date_of_dissection date,
  dob date,
  special_care_instructions text,
  services_requested text,
  instructions_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lims_samples_sample_reference_unique
  on public.lims_samples (sample_reference);

create index if not exists lims_samples_project_id_idx
  on public.lims_samples (project_id);
create index if not exists lims_samples_client_sample_id_idx
  on public.lims_samples (client_sample_id);

create table if not exists public.lims_slides (
  id uuid primary key default gen_random_uuid(),
  slide_reference text not null,
  sample_id uuid not null references public.lims_samples (id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lims_slides_slide_reference_unique
  on public.lims_slides (slide_reference);

create index if not exists lims_slides_sample_id_idx
  on public.lims_slides (sample_id);

create table if not exists public.lims_sample_metadata (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references public.lims_samples (id) on delete cascade,
  key text not null,
  value text not null default '',
  sort_order int not null default 0
);

create unique index if not exists lims_sample_metadata_sample_key_unique
  on public.lims_sample_metadata (sample_id, key);

create index if not exists lims_sample_metadata_sample_id_idx
  on public.lims_sample_metadata (sample_id);

create table if not exists public.lims_slide_metadata (
  id uuid primary key default gen_random_uuid(),
  slide_id uuid not null references public.lims_slides (id) on delete cascade,
  key text not null,
  value text not null default '',
  sort_order int not null default 0
);

create unique index if not exists lims_slide_metadata_slide_key_unique
  on public.lims_slide_metadata (slide_id, key);

create index if not exists lims_slide_metadata_slide_id_idx
  on public.lims_slide_metadata (slide_id);

create table if not exists public.lims_sample_steps (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references public.lims_samples (id) on delete cascade,
  content text not null default '',
  sort_order int not null default 0,
  completed_at timestamptz,
  completed_by uuid references auth.users (id) on delete set null
);

create index if not exists lims_sample_steps_sample_sort_idx
  on public.lims_sample_steps (sample_id, sort_order);

create table if not exists public.lims_slide_steps (
  id uuid primary key default gen_random_uuid(),
  slide_id uuid not null references public.lims_slides (id) on delete cascade,
  content text not null default '',
  sort_order int not null default 0,
  completed_at timestamptz,
  completed_by uuid references auth.users (id) on delete set null
);

create index if not exists lims_slide_steps_slide_sort_idx
  on public.lims_slide_steps (slide_id, sort_order);

-- RLS: authenticated lab users (same pattern as invoices / tissue).
alter table public.lims_projects enable row level security;
alter table public.lims_samples enable row level security;
alter table public.lims_slides enable row level security;
alter table public.lims_sample_metadata enable row level security;
alter table public.lims_slide_metadata enable row level security;
alter table public.lims_sample_steps enable row level security;
alter table public.lims_slide_steps enable row level security;

drop policy if exists "lims_projects_authenticated_all" on public.lims_projects;
create policy "lims_projects_authenticated_all"
  on public.lims_projects for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "lims_samples_authenticated_all" on public.lims_samples;
create policy "lims_samples_authenticated_all"
  on public.lims_samples for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "lims_slides_authenticated_all" on public.lims_slides;
create policy "lims_slides_authenticated_all"
  on public.lims_slides for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "lims_sample_metadata_authenticated_all" on public.lims_sample_metadata;
create policy "lims_sample_metadata_authenticated_all"
  on public.lims_sample_metadata for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "lims_slide_metadata_authenticated_all" on public.lims_slide_metadata;
create policy "lims_slide_metadata_authenticated_all"
  on public.lims_slide_metadata for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "lims_sample_steps_authenticated_all" on public.lims_sample_steps;
create policy "lims_sample_steps_authenticated_all"
  on public.lims_sample_steps for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "lims_slide_steps_authenticated_all" on public.lims_slide_steps;
create policy "lims_slide_steps_authenticated_all"
  on public.lims_slide_steps for all
  to authenticated
  using (true)
  with check (true);
