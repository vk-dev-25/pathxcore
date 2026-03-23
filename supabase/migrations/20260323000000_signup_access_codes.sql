-- Run in Supabase SQL Editor (or via CLI) before using password sign-up (POST /api/auth/sign-up).
--
-- Practical examples (pick one):
--
-- 1) Fixed code for local testing — use on the sign-in form as the access code:
--    insert into public.access_codes (code, expires_at, max_uses)
--    values ('PX-DEMO-7k2m', now() + interval '30 days', 1);
--
-- 2) Strong random code (recommended) — paste the result of this query into your
--    insert, or run the insert in one go:
--    insert into public.access_codes (code, expires_at, max_uses)
--    values (
--      replace(gen_random_uuid()::text, '-', ''),
--      now() + interval '30 days',
--      1
--    );
--
-- 3) Team batch (5 uses, 90 days):
--    insert into public.access_codes (code, expires_at, max_uses)
--    values ('TEAM-2026-SF', now() + interval '90 days', 5);
--
-- No Auth Admin API: new accounts must have a matching signup_allowances row
-- (created only by your Next.js API after validating a code).

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  expires_at timestamptz not null,
  max_uses int not null default 1,
  used_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.signup_allowances (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  access_code_id uuid not null references public.access_codes (id) on delete cascade,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists signup_allowances_email_lower_idx
  on public.signup_allowances (lower(email));

create index if not exists signup_allowances_active_idx
  on public.signup_allowances (lower(email))
  where consumed_at is null;

alter table public.access_codes enable row level security;
alter table public.signup_allowances enable row level security;

-- Deny direct client access; server uses service role only.
drop policy if exists "access_codes_no_client" on public.access_codes;
create policy "access_codes_no_client"
  on public.access_codes for all
  using (false);

drop policy if exists "signup_allowances_no_client" on public.signup_allowances;
create policy "signup_allowances_no_client"
  on public.signup_allowances for all
  using (false);

-- Block first-time auth.users inserts unless API created an allowance.
create or replace function public.enforce_signup_allowance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.signup_allowances sa
    where lower(sa.email) = lower(new.email)
      and sa.consumed_at is null
      and sa.expires_at > now()
  ) then
    return new;
  end if;

  raise exception
    'Signup requires a valid access code. Request a magic link from the app after entering your code.';
end;
$$;

drop trigger if exists enforce_signup_allowance_trigger on auth.users;
create trigger enforce_signup_allowance_trigger
  before insert on auth.users
  for each row
  execute procedure public.enforce_signup_allowance();

-- After successful signup, consume allowance and bump code usage.
create or replace function public.consume_signup_allowance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_id uuid;
  v_allowance_id uuid;
begin
  select sa.id, sa.access_code_id into v_allowance_id, v_code_id
  from public.signup_allowances sa
  where lower(sa.email) = lower(new.email)
    and sa.consumed_at is null
    and sa.expires_at > now()
  order by sa.created_at desc
  limit 1;

  if v_allowance_id is not null then
    update public.signup_allowances
    set consumed_at = now()
    where id = v_allowance_id;

    if v_code_id is not null then
      update public.access_codes
      set used_count = used_count + 1
      where id = v_code_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists consume_signup_allowance_trigger on auth.users;
create trigger consume_signup_allowance_trigger
  after insert on auth.users
  for each row
  execute procedure public.consume_signup_allowance();
