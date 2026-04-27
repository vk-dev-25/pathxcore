alter table public.quotes
add column if not exists status text not null default 'created';

-- Normalize any unexpected historical values.
update public.quotes
set status = 'created'
where status is null
   or status not in ('created', 'sent', 'approved', 'cancelled', 'discarded');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'quotes_status_check'
  ) then
    alter table public.quotes
      add constraint quotes_status_check
      check (status in ('created', 'sent', 'approved', 'cancelled', 'discarded'));
  end if;
end
$$;
