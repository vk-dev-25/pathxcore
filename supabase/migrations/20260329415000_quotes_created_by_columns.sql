-- App expects these on /pathx/quotes (alongside last_updated_* from 20260329400000).
-- Safe if columns already exist (e.g. you merged alters manually).

alter table public.quotes
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists created_by_email text;
