-- Clone / lineage details for antibody registry rows.

alter table public.pathx_antibodies
  add column if not exists clone_detail text not null default '';

create index if not exists pathx_antibodies_clone_detail_idx
  on public.pathx_antibodies (clone_detail);
