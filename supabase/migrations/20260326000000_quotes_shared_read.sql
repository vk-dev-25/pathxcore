-- Allow any signed-in PathX user to read all saved quotes and line items.
-- Inserts/updates/deletes remain limited to the quote owner (user_id = auth.uid()).

drop policy if exists "quotes_own" on public.quotes;

create policy "quotes_select_auth"
  on public.quotes for select
  to authenticated
  using (true);

create policy "quotes_insert_own"
  on public.quotes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "quotes_update_own"
  on public.quotes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "quotes_delete_own"
  on public.quotes for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "quote_lines_own" on public.quote_line_items;

create policy "quote_lines_select_auth"
  on public.quote_line_items for select
  to authenticated
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
    )
  );

create policy "quote_lines_insert_own"
  on public.quote_line_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id and q.user_id = auth.uid()
    )
  );

create policy "quote_lines_update_own"
  on public.quote_line_items for update
  to authenticated
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id and q.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id and q.user_id = auth.uid()
    )
  );

create policy "quote_lines_delete_own"
  on public.quote_line_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id and q.user_id = auth.uid()
    )
  );
