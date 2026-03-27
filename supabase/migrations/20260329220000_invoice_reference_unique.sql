-- Ensure each invoice has a unique human-readable reference.
create unique index if not exists invoices_invoice_reference_unique
  on public.invoices (invoice_reference)
  where invoice_reference is not null and btrim(invoice_reference) <> '';
