-- Any signed-in user may update any saved quote and replace its line items.
-- Quote ownership (user_id) cannot be changed (trigger).

drop policy if exists "quotes_update_own" on public.quotes;
drop policy if exists "quotes_update_pathx_admin" on public.quotes;

create policy "quotes_update_auth"
  on public.quotes for update
  to authenticated
  using (true)
  with check (true);

create or replace function public.quotes_prevent_user_id_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'quote owner cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists quotes_prevent_user_id_change on public.quotes;
create trigger quotes_prevent_user_id_change
  before update on public.quotes
  for each row
  execute procedure public.quotes_prevent_user_id_change();

-- Line items: any authenticated user may insert/update/delete for any quote.
drop policy if exists "quote_lines_insert_own" on public.quote_line_items;
drop policy if exists "quote_lines_update_own" on public.quote_line_items;
drop policy if exists "quote_lines_delete_own" on public.quote_line_items;
drop policy if exists "quote_lines_insert_pathx_admin" on public.quote_line_items;
drop policy if exists "quote_lines_update_pathx_admin" on public.quote_line_items;
drop policy if exists "quote_lines_delete_pathx_admin" on public.quote_line_items;

create policy "quote_lines_insert_auth"
  on public.quote_line_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
    )
  );

create policy "quote_lines_update_auth"
  on public.quote_line_items for update
  to authenticated
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
    )
  )
  with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
    )
  );

create policy "quote_lines_delete_auth"
  on public.quote_line_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
    )
  );
