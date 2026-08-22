-- Match quote behavior: any signed-in user may update any invoice and replace
-- line items (list + detail are readable by all authenticated users).
-- Invoice ownership (user_id) cannot be changed (trigger).

drop policy if exists "invoices_update_own" on public.invoices;
drop policy if exists "invoices_update_auth" on public.invoices;

create policy "invoices_update_auth"
  on public.invoices for update
  to authenticated
  using (true)
  with check (true);

create or replace function public.invoices_prevent_user_id_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'invoice owner cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_prevent_user_id_change on public.invoices;
create trigger invoices_prevent_user_id_change
  before update on public.invoices
  for each row
  execute procedure public.invoices_prevent_user_id_change();

-- Line items: any authenticated user may insert/update/delete for any invoice.
drop policy if exists "invoice_lines_insert_own" on public.invoice_line_items;
drop policy if exists "invoice_lines_update_own" on public.invoice_line_items;
drop policy if exists "invoice_lines_delete_own" on public.invoice_line_items;

create policy "invoice_lines_insert_auth"
  on public.invoice_line_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
    )
  );

create policy "invoice_lines_update_auth"
  on public.invoice_line_items for update
  to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
    )
  );

create policy "invoice_lines_delete_auth"
  on public.invoice_line_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
    )
  );
