-- Accurate catalog-wide summaries for the public tissue catalog (all available rows).
-- Used by server-side RPC; avoids PostgREST row limits when aggregating in app code.

create or replace function public.get_tissue_inventory_public_summaries()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select
      tissue,
      case
        when trim(category) in (
          'Malignant',
          'Benign',
          'Normal/Control',
          'Pre-malignant',
          'Unknown'
        ) then trim(category)
        else 'Other'
      end as cat_bucket
    from tissue_inventory
    where status = 'available'::public.tissue_block_status
  ),
  tissue_top as (
    select tissue as label, count(*)::bigint as cnt
    from base
    group by tissue
    order by cnt desc
    limit 12
  ),
  cat_counts as (
    select cat_bucket as label, count(*)::bigint as cnt
    from base
    group by cat_bucket
  )
  select jsonb_build_object(
    'topTissues', coalesce((
      select jsonb_agg(
        jsonb_build_object('label', label, 'count', cnt)
        order by cnt desc
      )
      from tissue_top
    ), '[]'::jsonb),
    'categoryCounts', jsonb_build_array(
      jsonb_build_object(
        'label', 'Malignant',
        'count', coalesce((select cnt from cat_counts where label = 'Malignant' limit 1), 0)
      ),
      jsonb_build_object(
        'label', 'Benign',
        'count', coalesce((select cnt from cat_counts where label = 'Benign' limit 1), 0)
      ),
      jsonb_build_object(
        'label', 'Normal/Control',
        'count', coalesce((select cnt from cat_counts where label = 'Normal/Control' limit 1), 0)
      ),
      jsonb_build_object(
        'label', 'Pre-malignant',
        'count', coalesce((select cnt from cat_counts where label = 'Pre-malignant' limit 1), 0)
      ),
      jsonb_build_object(
        'label', 'Unknown',
        'count', coalesce((select cnt from cat_counts where label = 'Unknown' limit 1), 0)
      ),
      jsonb_build_object(
        'label', 'Other',
        'count', coalesce((select cnt from cat_counts where label = 'Other' limit 1), 0)
      )
    )
  );
$$;

create or replace function public.get_tissue_inventory_public_tissue_types()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    array_agg(distinct tissue order by tissue),
    '{}'::text[]
  )
  from tissue_inventory
  where status = 'available'::public.tissue_block_status;
$$;

revoke all on function public.get_tissue_inventory_public_summaries() from public;
revoke all on function public.get_tissue_inventory_public_tissue_types() from public;

grant execute on function public.get_tissue_inventory_public_summaries() to service_role;
grant execute on function public.get_tissue_inventory_public_tissue_types() to service_role;
