-- Allow authenticated users to add new catalog services (admin pricing UI).

drop policy if exists "quote_catalog_insert" on public.quote_catalog_services;
create policy "quote_catalog_insert"
  on public.quote_catalog_services for insert
  to authenticated
  with check (true);
