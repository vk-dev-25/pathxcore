-- Allow authenticated users to remove catalog services (admin pricing UI).
-- Quote / invoice / LIMS lines use ON DELETE SET NULL where they reference catalog id.

drop policy if exists "quote_catalog_delete" on public.quote_catalog_services;
create policy "quote_catalog_delete"
  on public.quote_catalog_services for delete
  to authenticated
  using (true);
