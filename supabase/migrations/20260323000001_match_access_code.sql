-- Run after 20260323000000_signup_access_codes.sql
-- Lookup codes with trim + case-insensitive match (handles stray spaces in DB or pasted input).

create or replace function public.match_access_code(p_raw text)
returns table (
  id uuid,
  expires_at timestamptz,
  max_uses int,
  used_count int
)
language sql
stable
security invoker
set search_path = public
as $$
  select ac.id, ac.expires_at, ac.max_uses, ac.used_count
  from public.access_codes ac
  where upper(trim(ac.code)) = upper(trim(p_raw))
  limit 1;
$$;

grant execute on function public.match_access_code(text) to service_role;
