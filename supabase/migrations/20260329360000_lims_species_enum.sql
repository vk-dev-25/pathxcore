-- Replace binary human/animal with explicit species; legacy `animal` → mouse.

create type public.lims_species_kind_new as enum (
  'human',
  'mouse',
  'rat',
  'rabbit',
  'monkey'
);

alter table public.lims_samples
  alter column species_kind drop default;

alter table public.lims_samples
  alter column species_kind type public.lims_species_kind_new
  using (
    case species_kind::text
      when 'human' then 'human'::public.lims_species_kind_new
      when 'animal' then 'mouse'::public.lims_species_kind_new
      else 'human'::public.lims_species_kind_new
    end
  );

alter table public.lims_samples
  alter column species_kind set default 'human'::public.lims_species_kind_new;

drop type public.lims_species_kind;

alter type public.lims_species_kind_new rename to lims_species_kind;
