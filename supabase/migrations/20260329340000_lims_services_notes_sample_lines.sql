-- LIMS: services_requested → services_notes; catalog service lines per sample.

alter table public.lims_samples
  rename column services_requested to services_notes;

create table if not exists public.lims_sample_service_lines (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references public.lims_samples (id) on delete cascade,
  catalog_service_id uuid references public.quote_catalog_services (id) on delete set null,
  label text not null,
  quantity numeric(14, 4) not null default 1 check (quantity > 0),
  sort_order int not null default 0
);

create index if not exists lims_sample_service_lines_sample_id_idx
  on public.lims_sample_service_lines (sample_id);

alter table public.lims_sample_service_lines enable row level security;

drop policy if exists "lims_sample_service_lines_authenticated_all"
  on public.lims_sample_service_lines;
create policy "lims_sample_service_lines_authenticated_all"
  on public.lims_sample_service_lines for all
  to authenticated
  using (true)
  with check (true);
