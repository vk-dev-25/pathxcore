-- Shared histo file deliveries: staff upload to S3, email ACL for clients, expiry.

do $$ begin
  create type public.shared_file_status as enum (
    'uploading',
    'ready',
    'failed',
    'expired',
    'deleted'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.shared_files (
  id uuid primary key default gen_random_uuid(),
  title text,
  original_filename text not null,
  content_type text not null default 'application/octet-stream',
  byte_size bigint not null default 0 check (byte_size >= 0),
  s3_key text not null,
  upload_id text,
  status public.shared_file_status not null default 'uploading',
  expires_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists shared_files_status_expires_idx
  on public.shared_files (status, expires_at);
create index if not exists shared_files_created_at_idx
  on public.shared_files (created_at desc);

create table if not exists public.shared_file_access (
  id uuid primary key default gen_random_uuid(),
  shared_file_id uuid not null references public.shared_files (id) on delete cascade,
  email text not null,
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists shared_file_access_file_email_unique
  on public.shared_file_access (shared_file_id, lower(email));
create index if not exists shared_file_access_email_idx
  on public.shared_file_access (lower(email));

create or replace function public.has_shared_file_access(p_file_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shared_file_access a
    where a.shared_file_id = p_file_id
      and lower(a.email) = public.tracker_current_email()
  );
$$;

create or replace function public.can_read_shared_file(p_file_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_staff_member()
    or exists (
      select 1
      from public.shared_files f
      where f.id = p_file_id
        and f.status = 'ready'
        and f.expires_at is not null
        and f.expires_at > now()
        and public.has_shared_file_access(f.id)
    );
$$;

alter table public.shared_files enable row level security;
alter table public.shared_file_access enable row level security;

drop policy if exists shared_files_select on public.shared_files;
create policy shared_files_select on public.shared_files for select
  to authenticated
  using (public.can_read_shared_file(id) or public.is_staff_member());

drop policy if exists shared_files_insert on public.shared_files;
create policy shared_files_insert on public.shared_files for insert
  to authenticated
  with check (public.is_staff_member());

drop policy if exists shared_files_update on public.shared_files;
create policy shared_files_update on public.shared_files for update
  to authenticated
  using (public.is_staff_member())
  with check (public.is_staff_member());

drop policy if exists shared_files_delete on public.shared_files;
create policy shared_files_delete on public.shared_files for delete
  to authenticated
  using (public.is_staff_member());

drop policy if exists shared_file_access_select on public.shared_file_access;
create policy shared_file_access_select on public.shared_file_access for select
  to authenticated
  using (
    public.is_staff_member()
    or lower(email) = public.tracker_current_email()
  );

drop policy if exists shared_file_access_write on public.shared_file_access;
create policy shared_file_access_write on public.shared_file_access for all
  to authenticated
  using (public.is_staff_member())
  with check (public.is_staff_member());
