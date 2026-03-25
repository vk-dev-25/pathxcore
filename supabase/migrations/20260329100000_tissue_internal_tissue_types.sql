-- Full distinct tissue labels for PathX filters (all rows; no PostgREST row-cap sampling).

create or replace function public.get_tissue_inventory_internal_tissue_types()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    array_agg(sub.tissue order by sub.tissue),
    '{}'::text[]
  )
  from (
    select distinct trim(tissue) as tissue
    from tissue_inventory
    where tissue is not null and btrim(tissue) <> ''
  ) sub;
$$;

revoke all on function public.get_tissue_inventory_internal_tissue_types() from public;
grant execute on function public.get_tissue_inventory_internal_tissue_types() to authenticated;
grant execute on function public.get_tissue_inventory_internal_tissue_types() to service_role;
