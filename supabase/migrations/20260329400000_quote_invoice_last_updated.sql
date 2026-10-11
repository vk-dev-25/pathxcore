-- Track who last edited quotes and invoices (signed-in user snapshot).

alter table public.quotes
  add column if not exists last_updated_by uuid references auth.users (id) on delete set null,
  add column if not exists last_updated_by_email text;

alter table public.invoices
  add column if not exists last_updated_by uuid references auth.users (id) on delete set null,
  add column if not exists last_updated_by_email text;
