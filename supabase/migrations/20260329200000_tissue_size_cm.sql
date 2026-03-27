-- Optional block dimensions (length × width × height) in centimeters.

alter table public.tissue_inventory
  add column if not exists size_length_cm numeric(10, 3),
  add column if not exists size_width_cm numeric(10, 3),
  add column if not exists size_height_cm numeric(10, 3);

comment on column public.tissue_inventory.size_length_cm is 'Block length in cm (optional).';
comment on column public.tissue_inventory.size_width_cm is 'Block width in cm (optional).';
comment on column public.tissue_inventory.size_height_cm is 'Block height in cm (optional).';
