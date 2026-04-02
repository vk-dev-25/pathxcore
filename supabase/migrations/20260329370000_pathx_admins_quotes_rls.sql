-- PathX admins: users who may edit any saved quote (header + line items).
-- Grant admin by inserting a row in Supabase SQL editor, e.g.:
--   insert into public.pathx_admins (user_id) values ('<auth user uuid>');

create table if not exists public.pathx_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.pathx_admins enable row level security;

-- Each user can only read their own row (used by the app to detect admin).
create policy "pathx_admins_select_own"
  on public.pathx_admins for select
  to authenticated
  using (auth.uid() = user_id);

-- Additional quote policies: admins can update any row (owner policies unchanged).
create policy "quotes_update_pathx_admin"
  on public.quotes for update
  to authenticated
  using (
    exists (
      select 1 from public.pathx_admins a where a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pathx_admins a where a.user_id = auth.uid()
    )
  );

create policy "quote_lines_insert_pathx_admin"
  on public.quote_line_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.pathx_admins a where a.user_id = auth.uid()
    )
  );

create policy "quote_lines_update_pathx_admin"
  on public.quote_line_items for update
  to authenticated
  using (
    exists (
      select 1 from public.pathx_admins a where a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pathx_admins a where a.user_id = auth.uid()
    )
  );

create policy "quote_lines_delete_pathx_admin"
  on public.quote_line_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.pathx_admins a where a.user_id = auth.uid()
    )
  );
