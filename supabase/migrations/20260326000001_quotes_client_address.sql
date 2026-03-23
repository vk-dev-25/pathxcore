-- Add client mailing address to saved quotes for PDF rendering.

alter table if exists public.quotes
  add column if not exists client_address text;
