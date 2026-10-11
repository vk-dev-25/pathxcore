-- Canonical clients (with deterministic name de-dup) + per-client project trackers.
-- Single migration so table/function creation order is self-contained.

-- ---------------------------------------------------------------------------
-- 1) Deterministic client-name normalization (case / punctuation / spacing /
--    legal-suffix folding). No fuzzy matching by design.
-- ---------------------------------------------------------------------------
create or replace function public.normalize_client_name(p text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(                                        -- 4) drop all whitespace
      regexp_replace(                                      -- 3) strip legal suffix tokens
        regexp_replace(                                    -- 2) non-alnum -> single space
          replace(lower(coalesce(p, '')), '&', 'and'),    -- 1) lowercase + & -> and
          '[^a-z0-9]+', ' ', 'g'
        ),
        '\m(incorporated|inc|llc|ltd|limited|corp|corporation|company|co|plc|gmbh|sarl|sa|ag|nv|bv|pty|llp)\M',
        '', 'g'
      ),
      '\s+', '', 'g'
    ),
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- 2) Clients + aliases
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  name_key text not null,
  address text,
  contact_name text,
  primary_contact_email text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clients_name_key_unique on public.clients (name_key);

create table if not exists public.client_aliases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  alias_text text not null,
  alias_key text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists client_aliases_alias_key_unique on public.client_aliases (alias_key);
create index if not exists client_aliases_client_id_idx on public.client_aliases (client_id);

alter table public.quotes
  add column if not exists client_id uuid references public.clients (id) on delete set null;
create index if not exists quotes_client_id_idx on public.quotes (client_id);

-- ---------------------------------------------------------------------------
-- 3) Trackers
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.tracker_status_tag as enum (
    'completed', 'in_progress', 'awaiting_client', 'paused', 'halted', 'na'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.trackers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  title text not null default 'IHC Project Tracker',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists trackers_client_id_idx on public.trackers (client_id);

create table if not exists public.tracker_access (
  id uuid primary key default gen_random_uuid(),
  tracker_id uuid not null references public.trackers (id) on delete cascade,
  email text not null,
  role text not null default 'client' check (role in ('client', 'staff')),
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists tracker_access_tracker_email_unique
  on public.tracker_access (tracker_id, lower(email));
create index if not exists tracker_access_email_idx on public.tracker_access (lower(email));

create table if not exists public.tracker_rows (
  id uuid primary key default gen_random_uuid(),
  tracker_id uuid not null references public.trackers (id) on delete cascade,
  sort_order int not null default 0,
  row_type text not null default 'data' check (row_type in ('data', 'group')),
  group_label text,
  project_id text,
  application text,
  target text,
  assay_dev text,
  pos_control text,
  neg_control text,
  normal_tma text,
  tumor_tma text,
  slides text,
  quote text,
  quote_sent text,
  status text,
  status_tag public.tracker_status_tag,
  completion_date text,
  next_action text,
  notes text,
  client_comments text,
  updated_by uuid references auth.users (id) on delete set null,
  updated_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tracker_rows_tracker_sort_idx on public.tracker_rows (tracker_id, sort_order);

-- ---------------------------------------------------------------------------
-- 4) Access helper functions (security definer -> bypass RLS, avoid recursion)
-- ---------------------------------------------------------------------------
create or replace function public.tracker_current_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- Staff = any authenticated user who is NOT a client on any tracker.
-- (All internal accounts require an access code to sign up; clients only ever
--  exist via tracker_access with role 'client'.)
create or replace function public.is_tracker_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.tracker_current_email() <> ''
     and not exists (
       select 1 from public.tracker_access ta
       where lower(ta.email) = public.tracker_current_email()
         and ta.role = 'client'
     );
$$;

create or replace function public.has_tracker_access(p_tracker uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tracker_access ta
    where ta.tracker_id = p_tracker
      and lower(ta.email) = public.tracker_current_email()
  );
$$;

-- ---------------------------------------------------------------------------
-- 5) RLS
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.client_aliases enable row level security;
alter table public.trackers enable row level security;
alter table public.tracker_access enable row level security;
alter table public.tracker_rows enable row level security;

-- clients: staff-only (client users read org name server-side via service role)
drop policy if exists clients_staff_read on public.clients;
create policy clients_staff_read on public.clients for select
  to authenticated using (public.is_tracker_staff());
drop policy if exists clients_staff_write on public.clients;
create policy clients_staff_write on public.clients for all
  to authenticated using (public.is_tracker_staff()) with check (public.is_tracker_staff());

drop policy if exists client_aliases_staff_read on public.client_aliases;
create policy client_aliases_staff_read on public.client_aliases for select
  to authenticated using (public.is_tracker_staff());
drop policy if exists client_aliases_staff_write on public.client_aliases;
create policy client_aliases_staff_write on public.client_aliases for all
  to authenticated using (public.is_tracker_staff()) with check (public.is_tracker_staff());

-- trackers: staff see all; clients see only their own
drop policy if exists trackers_read on public.trackers;
create policy trackers_read on public.trackers for select
  to authenticated using (public.is_tracker_staff() or public.has_tracker_access(id));
drop policy if exists trackers_update on public.trackers;
create policy trackers_update on public.trackers for update
  to authenticated
  using (public.is_tracker_staff() or public.has_tracker_access(id))
  with check (public.is_tracker_staff() or public.has_tracker_access(id));
drop policy if exists trackers_insert on public.trackers;
create policy trackers_insert on public.trackers for insert
  to authenticated with check (public.is_tracker_staff());
drop policy if exists trackers_delete on public.trackers;
create policy trackers_delete on public.trackers for delete
  to authenticated using (public.is_tracker_staff());

-- tracker_access: readable by anyone on the tracker; writable by staff only
drop policy if exists tracker_access_read on public.tracker_access;
create policy tracker_access_read on public.tracker_access for select
  to authenticated using (public.is_tracker_staff() or public.has_tracker_access(tracker_id));
drop policy if exists tracker_access_write on public.tracker_access;
create policy tracker_access_write on public.tracker_access for all
  to authenticated using (public.is_tracker_staff()) with check (public.is_tracker_staff());

-- tracker_rows: staff and clients on the tracker can both edit
drop policy if exists tracker_rows_all on public.tracker_rows;
create policy tracker_rows_all on public.tracker_rows for all
  to authenticated
  using (public.is_tracker_staff() or public.has_tracker_access(tracker_id))
  with check (public.is_tracker_staff() or public.has_tracker_access(tracker_id));

-- ---------------------------------------------------------------------------
-- 6) Backfill clients from existing quotes (deterministic de-dup)
-- ---------------------------------------------------------------------------
-- Canonical org_name per normalized key = most frequently used raw spelling
-- (tie -> longest, then alphabetical).
with counts as (
  select client_org_name as raw,
         public.normalize_client_name(client_org_name) as key,
         count(*) as n
  from public.quotes
  where client_org_name is not null
    and public.normalize_client_name(client_org_name) is not null
  group by client_org_name
),
ranked as (
  select raw, key,
         row_number() over (
           partition by key
           order by n desc, char_length(raw) desc, raw asc
         ) as rn
  from counts
)
insert into public.clients (org_name, name_key)
select raw, key from ranked where rn = 1
on conflict (name_key) do nothing;

-- Fill address / contact from the most recently updated quote for each key.
update public.clients c
set address = q.client_address,
    contact_name = q.contact_name
from (
  select distinct on (public.normalize_client_name(client_org_name))
    public.normalize_client_name(client_org_name) as key,
    client_address,
    contact_name
  from public.quotes
  where client_org_name is not null
    and public.normalize_client_name(client_org_name) is not null
  order by public.normalize_client_name(client_org_name), updated_at desc
) q
where c.name_key = q.key;

-- Record every distinct raw spelling as an alias.
insert into public.client_aliases (client_id, alias_text, alias_key)
select distinct on (public.normalize_client_name(q.client_org_name))
  c.id,
  q.client_org_name,
  public.normalize_client_name(q.client_org_name)
from public.quotes q
join public.clients c
  on c.name_key = public.normalize_client_name(q.client_org_name)
where q.client_org_name is not null
  and public.normalize_client_name(q.client_org_name) is not null
on conflict (alias_key) do nothing;

-- Link existing quotes to their canonical client.
update public.quotes q
set client_id = c.id
from public.clients c
where q.client_org_name is not null
  and c.name_key = public.normalize_client_name(q.client_org_name)
  and q.client_id is null;
