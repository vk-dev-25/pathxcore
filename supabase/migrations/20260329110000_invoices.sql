-- Invoices generated from saved quotes, editable independently.

create type public.invoice_status as enum (
  'created',
  'sent',
  'paid',
  'cancelled'
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_quote_id uuid references public.quotes (id) on delete set null,
  client_org_name text,
  client_address text,
  contact_name text,
  project_title text,
  invoice_reference text,
  currency text not null default 'USD',
  status public.invoice_status not null default 'created',
  due_date date,
  subtotal_amount numeric(14, 2) not null default 0 check (subtotal_amount >= 0),
  total_amount numeric(14, 2) not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_id_idx on public.invoices (user_id);
create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists invoices_due_date_idx on public.invoices (due_date);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_source_quote_id_idx on public.invoices (source_quote_id);
create index if not exists invoices_client_org_name_idx on public.invoices (client_org_name);

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  catalog_service_id uuid references public.quote_catalog_services (id) on delete set null,
  source_quote_line_id uuid references public.quote_line_items (id) on delete set null,
  label text not null,
  quantity numeric(14, 4) not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  line_total numeric(14, 2) not null check (line_total >= 0),
  sort_order int not null default 0
);

create index if not exists invoice_line_items_invoice_id_idx
  on public.invoice_line_items (invoice_id);

alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;

drop policy if exists "invoices_select_auth" on public.invoices;
create policy "invoices_select_auth"
  on public.invoices for select
  to authenticated
  using (true);

drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own"
  on public.invoices for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own"
  on public.invoices for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own"
  on public.invoices for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "invoice_lines_select_auth" on public.invoice_line_items;
create policy "invoice_lines_select_auth"
  on public.invoice_line_items for select
  to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
    )
  );

drop policy if exists "invoice_lines_insert_own" on public.invoice_line_items;
create policy "invoice_lines_insert_own"
  on public.invoice_line_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id and i.user_id = auth.uid()
    )
  );

drop policy if exists "invoice_lines_update_own" on public.invoice_line_items;
create policy "invoice_lines_update_own"
  on public.invoice_line_items for update
  to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id and i.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id and i.user_id = auth.uid()
    )
  );

drop policy if exists "invoice_lines_delete_own" on public.invoice_line_items;
create policy "invoice_lines_delete_own"
  on public.invoice_line_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id and i.user_id = auth.uid()
    )
  );
