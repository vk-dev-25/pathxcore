import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  AntibodyFilterOptions,
  AntibodyListFilters,
  AntibodyRow,
  AntibodySortKey,
  ListAntibodiesResult,
} from "@/lib/antibodies/types";

const DEFAULT_PAGE_SIZE = 40;

function sortColumn(key: AntibodySortKey): string {
  const map: Record<AntibodySortKey, string> = {
    antibody_name: "antibody_name",
    vendor_name: "vendor_name",
    catalog: "catalog",
    lot_number: "lot_number",
    ig_species: "ig_species",
    working_concentration: "working_concentration",
    antigen_retrieval: "antigen_retrieval",
    detection_method: "detection_method",
    last_updated_by: "last_updated_by",
    provided_by: "provided_by",
    date_provided: "date_provided",
    updated_at: "updated_at",
  };
  return map[key];
}

/** PostgREST `or` splits on commas — normalize search terms. */
function sanitizeOrTerm(t: string): string {
  return t.trim().replace(/,/g, " ");
}

export function applyAntibodyFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST builder
  q: any,
  filters: AntibodyListFilters,
) {
  let query = q;

  const search = filters.search?.trim();
  if (search) {
    const term = sanitizeOrTerm(search);
    const p = `%${term}%`;
    query = query.or(
      [
        `antibody_name.ilike.${p}`,
        `vendor_name.ilike.${p}`,
        `catalog.ilike.${p}`,
        `lot_number.ilike.${p}`,
        `ig_species.ilike.${p}`,
        `working_concentration.ilike.${p}`,
        `antigen_retrieval.ilike.${p}`,
        `detection_method.ilike.${p}`,
        `last_updated_by.ilike.${p}`,
        `provided_by.ilike.${p}`,
      ].join(","),
    );
  }

  if (filters.vendor?.trim()) {
    query = query.eq("vendor_name", filters.vendor.trim());
  }
  if (filters.igSpecies?.trim()) {
    query = query.eq("ig_species", filters.igSpecies.trim());
  }
  if (filters.detection?.trim()) {
    query = query.eq("detection_method", filters.detection.trim());
  }
  if (filters.dateFrom?.trim()) {
    query = query.gte("date_provided", filters.dateFrom.trim());
  }
  if (filters.dateTo?.trim()) {
    query = query.lte("date_provided", filters.dateTo.trim());
  }

  return query;
}

export async function listAntibodiesInternal(params: {
  page?: number;
  pageSize?: number;
  sort?: AntibodySortKey;
  sortDir?: "asc" | "desc";
  filters?: AntibodyListFilters;
}): Promise<ListAntibodiesResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    200,
    Math.max(10, params.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const sort = params.sort ?? "antibody_name";
  const sortDir = params.sortDir ?? "asc";
  const filters = params.filters ?? {};

  const supabase = await createClient();
  const col = sortColumn(sort);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from("pathx_antibodies").select("*", { count: "exact" });
  q = applyAntibodyFilters(q, filters);
  q = q.order(col, {
    ascending: sortDir === "asc",
    nullsFirst: false,
  });

  const { data, error, count } = await q.range(from, to);

  if (error) {
    console.error(error);
    return { rows: [], total: 0, page, pageSize };
  }

  return {
    rows: (data ?? []) as AntibodyRow[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

/** Distinct values for search-panel selects (lightweight full scan of three columns). */
export async function getAntibodyFilterOptionsInternal(): Promise<AntibodyFilterOptions> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pathx_antibodies")
    .select("vendor_name, ig_species, detection_method");

  if (error || !data) {
    if (error) console.error(error);
    return { vendors: [], igSpecies: [], detectionMethods: [] };
  }

  const vendors = new Set<string>();
  const ig = new Set<string>();
  const det = new Set<string>();
  for (const row of data) {
    const v = (row as { vendor_name?: string | null }).vendor_name?.trim();
    const i = (row as { ig_species?: string | null }).ig_species?.trim();
    const d = (row as { detection_method?: string | null }).detection_method?.trim();
    if (v) vendors.add(v);
    if (i) ig.add(i);
    if (d) det.add(d);
  }

  return {
    vendors: [...vendors].sort((a, b) => a.localeCompare(b)),
    igSpecies: [...ig].sort((a, b) => a.localeCompare(b)),
    detectionMethods: [...det].sort((a, b) => a.localeCompare(b)),
  };
}
