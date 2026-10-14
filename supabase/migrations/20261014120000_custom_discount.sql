-- Custom discount (percent or amount) on quotes and invoices.
-- Applied after volume discount, before rush uplift.

alter table public.quotes
  add column if not exists custom_discount_mode text not null default 'none';

alter table public.quotes
  drop constraint if exists quotes_custom_discount_mode_check;

alter table public.quotes
  add constraint quotes_custom_discount_mode_check
  check (custom_discount_mode in ('none', 'percent', 'amount'));

alter table public.quotes
  add column if not exists custom_discount_value numeric(14, 2) not null default 0;

alter table public.quotes
  add column if not exists custom_discount_amount numeric(14, 2) not null default 0;

alter table public.quotes
  add column if not exists after_custom_amount numeric(14, 2) not null default 0;

update public.quotes
set after_custom_amount = after_volume_amount
where after_custom_amount = 0
  and after_volume_amount is not null
  and custom_discount_mode = 'none';

alter table public.invoices
  add column if not exists custom_discount_mode text not null default 'none';

alter table public.invoices
  drop constraint if exists invoices_custom_discount_mode_check;

alter table public.invoices
  add constraint invoices_custom_discount_mode_check
  check (custom_discount_mode in ('none', 'percent', 'amount'));

alter table public.invoices
  add column if not exists custom_discount_value numeric(14, 2) not null default 0;

alter table public.invoices
  add column if not exists custom_discount_amount numeric(14, 2) not null default 0;

alter table public.invoices
  add column if not exists after_custom_amount numeric(14, 2) not null default 0;

update public.invoices
set after_custom_amount = after_volume_amount
where after_custom_amount = 0
  and after_volume_amount is not null
  and custom_discount_mode = 'none';
