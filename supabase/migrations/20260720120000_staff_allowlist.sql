-- PathX staff allowlist: the maintained set of employee emails allowed to hold
-- full-workspace (staff) access. New password sign-ups are rejected unless the
-- email is on this list, and tracker-staff RLS now requires it too.

-- ---------------------------------------------------------------------------
-- 1) Allowlist table
-- ---------------------------------------------------------------------------
create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  is_active boolean not null default true,
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists staff_members_email_unique
  on public.staff_members (lower(email));

-- ---------------------------------------------------------------------------
-- 2) Seed existing internal accounts so nobody currently working is locked out.
--    (Every auth user who is not a tracker 'client' is treated as existing staff.)
-- ---------------------------------------------------------------------------
insert into public.staff_members (email)
select distinct lower(u.email)
from auth.users u
where u.email is not null
  and not exists (
    select 1
    from public.tracker_access ta
    where lower(ta.email) = lower(u.email)
      and ta.role = 'client'
  )
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 3) Helper: is the current JWT email an active allowlisted staff member?
--    security definer so it bypasses RLS (no recursion with policies below).
-- ---------------------------------------------------------------------------
create or replace function public.is_staff_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_members sm
    where lower(sm.email) = public.tracker_current_email()
      and sm.is_active
  );
$$;

-- ---------------------------------------------------------------------------
-- 4) Tighten staff definition: must be an active allowlisted member AND not a
--    client on any tracker.
-- ---------------------------------------------------------------------------
create or replace function public.is_tracker_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.tracker_current_email() <> ''
     and public.is_staff_member()
     and not exists (
       select 1
       from public.tracker_access ta
       where lower(ta.email) = public.tracker_current_email()
         and ta.role = 'client'
     );
$$;

-- ---------------------------------------------------------------------------
-- 5) RLS: only allowlisted staff can read or manage the allowlist.
-- ---------------------------------------------------------------------------
alter table public.staff_members enable row level security;

drop policy if exists staff_members_read on public.staff_members;
create policy staff_members_read on public.staff_members for select
  to authenticated using (public.is_tracker_staff());

drop policy if exists staff_members_write on public.staff_members;
create policy staff_members_write on public.staff_members for all
  to authenticated
  using (public.is_tracker_staff())
  with check (public.is_tracker_staff());
