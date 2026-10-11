-- Client-facing notes on invoice PDF (same role as quotes.notes).

alter table public.invoices
  add column if not exists notes text;
