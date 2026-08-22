alter table public.invoices
  add column if not exists po_reference text;
