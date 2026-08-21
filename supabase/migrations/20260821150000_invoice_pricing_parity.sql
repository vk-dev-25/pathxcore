-- Full quote pricing parity on invoices: segment, volume, rush drivers + amount columns.

alter table public.invoices
  add column if not exists segment text not null default 'small_biopharma';

alter table public.invoices
  add column if not exists sample_volume int not null default 0;

alter table public.invoices
  drop constraint if exists invoices_sample_volume_check;

alter table public.invoices
  add constraint invoices_sample_volume_check check (sample_volume >= 0);

alter table public.invoices
  add column if not exists rush_priority boolean not null default false;

alter table public.invoices
  add column if not exists rush_2day boolean not null default false;

alter table public.invoices
  add column if not exists apply_volume_discount boolean not null default true;

alter table public.invoices
  add column if not exists segment_adjustment_amount numeric(14, 2) not null default 0;

alter table public.invoices
  add column if not exists after_segment_amount numeric(14, 2) not null default 0;

alter table public.invoices
  add column if not exists volume_discount_amount numeric(14, 2) not null default 0;

alter table public.invoices
  add column if not exists after_volume_amount numeric(14, 2) not null default 0;

alter table public.invoices
  add column if not exists rush_uplift_amount numeric(14, 2) not null default 0;
