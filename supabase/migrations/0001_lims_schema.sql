-- PathxDx LIMS Schema
-- Run this in the Supabase SQL Editor

-- =============================================
-- 1. ID Sequences (atomic auto-increment)
-- =============================================
create table if not exists id_sequences (
  table_name    text    not null,
  year          int     not null default 0,
  month         int     not null default 0,
  last_sequence bigint  not null default 0,
  primary key (table_name, year, month)
);

-- Atomic sequence function
create or replace function next_sequence(p_table text, p_year int, p_month int)
returns bigint language plpgsql as $$
declare v bigint;
begin
  insert into id_sequences(table_name, year, month, last_sequence)
  values(p_table, p_year, p_month, 1)
  on conflict(table_name, year, month)
  do update set last_sequence = id_sequences.last_sequence + 1
  returning last_sequence into v;
  return v;
end;
$$;

-- =============================================
-- 2. Tissue Abbreviations Lookup
-- =============================================
create table if not exists tissue_abbreviations (
  id             uuid        primary key default gen_random_uuid(),
  abbreviation   varchar(5)  not null unique,
  name           text        not null,
  organ_system   text,
  requires_decal boolean     not null default false,
  notes          text,
  created_at     timestamptz not null default now()
);

-- =============================================
-- 3. In-House Control Library
-- =============================================
create table if not exists inhouse_library (
  id               uuid        primary key default gen_random_uuid(),
  library_id       text        not null unique,  -- PX-IN-[MARKER]-[POS/NEG]
  cell_line        text        not null,
  marker           text        not null,
  expression_level text,
  role             text        not null check (role in ('positive', 'negative')),
  last_used_date   date,
  notes            text,
  created_at       timestamptz not null default now()
);

-- =============================================
-- 4. Clients
-- =============================================
create table if not exists clients (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  code         varchar(3)  not null unique,
  contact_name text,
  email        text,
  phone        text,
  address      text,
  created_at   timestamptz not null default now()
);

-- =============================================
-- 5. Projects
-- =============================================
create table if not exists projects (
  id           uuid        primary key default gen_random_uuid(),
  project_id   text        not null unique,  -- PX-[YYYY]-[CLIENT_CODE]-[###]
  title        text        not null,
  client_id    uuid        not null references clients(id),
  pi_name      text,
  study_type   text,
  project_type text        not null default 'STANDARD' check (project_type in ('STANDARD', 'IHC_DEV')),
  species      text[]      not null default '{}',
  start_date   date,
  end_date     date,
  po_reference text,
  notes        text,
  status       text        not null default 'active' check (status in ('active', 'completed', 'on_hold')),
  created_at   timestamptz not null default now()
);

-- =============================================
-- 6. Accessions
-- =============================================
create table if not exists accessions (
  id            uuid        primary key default gen_random_uuid(),
  accession_id  text        not null unique,  -- PX-ACC-YYMM###
  project_id    uuid        not null references projects(id),
  received_date date        not null,
  received_by   text,
  notes         text,
  status        text        not null default 'received'
                  check (status in ('received', 'blocked', 'slides_cut', 'complete')),
  is_control    boolean     not null default false,
  control_type  text,
  created_at    timestamptz not null default now()
);

-- =============================================
-- 7. Specimens
-- =============================================
create table if not exists specimens (
  id                   uuid        primary key default gen_random_uuid(),
  specimen_id          text        not null unique,
  accession_id         uuid        not null references accessions(id),
  specimen_type        text        not null check (specimen_type in ('mouse_tissue', 'human_tissue', 'cell_pellet')),
  tissue_abbreviation  varchar(5),
  status               text        not null default 'received',
  -- Mouse tissue fields
  mouse_id             text,
  strain               text,
  sex                  text        check (sex in ('M', 'F', 'unknown') or sex is null),
  collection_date      date,
  day_post_treatment   int,
  treatment_group      text,
  cohort               text,
  client_specimen_ids  jsonb,
  -- Human tissue fields
  diagnosis            text,
  fixation_method      text,
  clinical_metadata    jsonb,
  -- Cell pellet fields
  cell_line            text,
  passage_number       int,
  treatment            text,
  pellet_count         int,
  overexpressed_marker text,
  parent_cell_line     text,
  notes                text,
  created_at           timestamptz not null default now()
);

-- =============================================
-- 8. Blocks (FFPE cassettes)
-- =============================================
create table if not exists blocks (
  id                  uuid        primary key default gen_random_uuid(),
  block_id            text        not null unique,
  specimen_id         uuid        not null references specimens(id),
  blocked_date        date,
  blocked_by          text,
  cassette_label_type text        check (cassette_label_type in ('printed', 'handwritten')),
  orientation_note    text,
  notes               text,
  created_at          timestamptz not null default now()
);

-- =============================================
-- 9. Slides
-- =============================================
create table if not exists slides (
  id              uuid        primary key default gen_random_uuid(),
  slide_id        text        not null unique,  -- PX-ACC-2501001-BN-001-001
  specimen_id     uuid        not null references specimens(id),
  section_number  int,
  cut_date        date,
  cut_by          text,
  label_type      text        check (label_type in ('direct_print', 'adhesive')),
  stain_status    text        not null default 'unassigned'
                    check (stain_status in ('unassigned', 'assigned', 'stained')),
  stain_type      text,
  marker          text,
  isotype_control text,
  stained_date    date,
  stained_by      text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- =============================================
-- 10. IHC Assay Development Projects
-- =============================================
create table if not exists ihc_assay_projects (
  id               uuid        primary key default gen_random_uuid(),
  project_id       uuid        not null references projects(id),
  target_marker    text        not null,
  antibody_clone   text,
  vendor           text,
  catalogue_number text,
  status           text        not null default 'in_development'
                     check (status in ('in_development', 'approved', 'locked')),
  locked_run_id    uuid,
  created_at       timestamptz not null default now()
);

-- =============================================
-- 11. IHC Optimization Runs
-- =============================================
create table if not exists ihc_optimization_runs (
  id                  uuid        primary key default gen_random_uuid(),
  assay_project_id    uuid        not null references ihc_assay_projects(id),
  run_number          int         not null,
  ab_dilution         text,
  antigen_retrieval   text,
  secondary_system    text,
  incubation_time_min int,
  incubation_temp     text,
  blocking_conditions text,
  outcome             text        not null default 'pending'
                        check (outcome in ('pass', 'fail', 'pending')),
  notes               text,
  run_date            date,
  created_at          timestamptz not null default now(),
  unique (assay_project_id, run_number)
);

-- Back-fill deferred FK
alter table ihc_assay_projects
  add constraint fk_locked_run
  foreign key (locked_run_id)
  references ihc_optimization_runs(id);

-- =============================================
-- 12. IHC Controls
-- =============================================
create table if not exists ihc_controls (
  id                 uuid primary key default gen_random_uuid(),
  assay_project_id   uuid not null references ihc_assay_projects(id),
  control_type       text not null check (control_type in ('client_supplied', 'inhouse')),
  accession_id       uuid references accessions(id),
  inhouse_library_id uuid references inhouse_library(id),
  role               text not null check (role in ('positive', 'negative')),
  notes              text
);

-- =============================================
-- Indexes
-- =============================================
create index if not exists idx_projects_client      on projects(client_id);
create index if not exists idx_accessions_project   on accessions(project_id);
create index if not exists idx_specimens_accession  on specimens(accession_id);
create index if not exists idx_blocks_specimen      on blocks(specimen_id);
create index if not exists idx_slides_specimen      on slides(specimen_id);
create index if not exists idx_slides_stain_status  on slides(stain_status);
create index if not exists idx_ihc_runs_assay       on ihc_optimization_runs(assay_project_id);
create index if not exists idx_ihc_controls_assay   on ihc_controls(assay_project_id);

-- =============================================
-- Row Level Security
-- =============================================
alter table id_sequences          enable row level security;
alter table tissue_abbreviations  enable row level security;
alter table inhouse_library       enable row level security;
alter table clients               enable row level security;
alter table projects              enable row level security;
alter table accessions            enable row level security;
alter table specimens             enable row level security;
alter table blocks                enable row level security;
alter table slides                enable row level security;
alter table ihc_assay_projects    enable row level security;
alter table ihc_optimization_runs enable row level security;
alter table ihc_controls          enable row level security;

create policy "auth_all" on id_sequences          for all to authenticated using (true) with check (true);
create policy "auth_all" on tissue_abbreviations  for all to authenticated using (true) with check (true);
create policy "auth_all" on inhouse_library       for all to authenticated using (true) with check (true);
create policy "auth_all" on clients               for all to authenticated using (true) with check (true);
create policy "auth_all" on projects              for all to authenticated using (true) with check (true);
create policy "auth_all" on accessions            for all to authenticated using (true) with check (true);
create policy "auth_all" on specimens             for all to authenticated using (true) with check (true);
create policy "auth_all" on blocks                for all to authenticated using (true) with check (true);
create policy "auth_all" on slides                for all to authenticated using (true) with check (true);
create policy "auth_all" on ihc_assay_projects    for all to authenticated using (true) with check (true);
create policy "auth_all" on ihc_optimization_runs for all to authenticated using (true) with check (true);
create policy "auth_all" on ihc_controls          for all to authenticated using (true) with check (true);
