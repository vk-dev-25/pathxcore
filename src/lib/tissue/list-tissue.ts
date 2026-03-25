import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  TissueCharts,
  ListTissueResult,
  TissueInventoryRow,
  TissueListFilters,
  TissueSortKey,
} from "@/lib/tissue/types";

export type { ListTissueResult, TissueCharts } from "@/lib/tissue/types";

const DEFAULT_PAGE_SIZE = 60;

/** PostgREST: RPC not in schema cache (migration not applied yet). */
function isMissingRpcInSchema(error: { code?: string } | null | undefined): boolean {
  return error?.code === "PGRST202";
}

/** Exported for CSV route — server-only. */
export function applyTissueFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST builder
  q: any,
  filters: TissueListFilters,
  publicAvailableOnly: boolean,
) {
  let query = q;
  if (publicAvailableOnly) {
    query = query.eq("status", "available");
  }
  if (filters.tissue) {
    query = query.eq("tissue", filters.tissue);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.gender) {
    query = query.eq("gender", filters.gender);
  }
  if (filters.catalogId?.trim()) {
    query = query.ilike("catalog_id", `%${filters.catalogId.trim()}%`);
  }
  if (filters.accession?.trim()) {
    query = query.ilike("accession", `%${filters.accession.trim()}%`);
  }
  if (filters.status && !publicAvailableOnly) {
    query = query.eq("status", filters.status);
  }
  if (filters.diagnosis?.trim()) {
    // PostgREST `or` splits on commas between clauses; commas in the search term
    // would break the filter string — normalize to spaces.
    const term = filters.diagnosis.trim().replace(/,/g, " ");
    query = query.or(
      `diag_short.ilike.%${term}%,diag_text.ilike.%${term}%`,
    );
  }
  return query;
}

function sortColumn(key: TissueSortKey): string {
  const map: Record<TissueSortKey, string> = {
    catalog_id: "catalog_id",
    accession: "accession",
    tissue: "tissue",
    category: "category",
    gender: "gender",
    diag_short: "diag_short",
    created_at: "created_at",
  };
  return map[key];
}

/** Public catalog: server-only service role, only `available` rows. */
export async function listTissuePublic(params: {
  page?: number;
  pageSize?: number;
  sort?: TissueSortKey;
  sortDir?: "asc" | "desc";
  filters?: TissueListFilters;
}): Promise<ListTissueResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    200,
    Math.max(10, params.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const sort = params.sort ?? "catalog_id";
  const sortDir = params.sortDir ?? "asc";
  const filters = params.filters ?? {};

  const supabase = createServiceRoleClient();
  const col = sortColumn(sort);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from("tissue_inventory").select("*", { count: "exact" });
  q = applyTissueFilters(q, filters, true);
  q = q.order(col, { ascending: sortDir === "asc", nullsFirst: false });

  const { data, error, count } = await q.range(from, to);

  if (error) {
    console.error(error);
    return { rows: [], total: 0, page, pageSize };
  }

  return {
    rows: (data ?? []) as TissueInventoryRow[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

/** Internal PathX: authenticated user, all statuses. */
export async function listTissueInternal(params: {
  page?: number;
  pageSize?: number;
  sort?: TissueSortKey;
  sortDir?: "asc" | "desc";
  filters?: TissueListFilters;
}): Promise<ListTissueResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    200,
    Math.max(10, params.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const sort = params.sort ?? "catalog_id";
  const sortDir = params.sortDir ?? "asc";
  const filters = params.filters ?? {};

  const supabase = await createClient();
  const col = sortColumn(sort);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from("tissue_inventory").select("*", { count: "exact" });
  q = applyTissueFilters(q, filters, false);
  q = q.order(col, { ascending: sortDir === "asc", nullsFirst: false });

  const { data, error, count } = await q.range(from, to);

  if (error) {
    console.error(error);
    return { rows: [], total: 0, page, pageSize };
  }

  return {
    rows: (data ?? []) as TissueInventoryRow[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export type TissueMetrics = {
  total: number;
  tissueTypes: number;
  female: number;
  male: number;
  malignant: number;
};

async function countWithFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  filters: TissueListFilters,
  publicAvailableOnly: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra?: (q: any) => any,
): Promise<number> {
  let q = supabase
    .from("tissue_inventory")
    .select("id", { count: "exact", head: true });
  q = applyTissueFilters(q, filters, publicAvailableOnly);
  if (extra) q = extra(q);
  const { count, error } = await q;
  if (error) {
    console.error(error);
    return 0;
  }
  return count ?? 0;
}

/** Distinct tissue types: sampled (up to 15k rows) when filters are wide. */
async function distinctTissueTypes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  filters: TissueListFilters,
  publicAvailableOnly: boolean,
): Promise<number> {
  let q = supabase.from("tissue_inventory").select("tissue");
  q = applyTissueFilters(q, filters, publicAvailableOnly);
  const { data, error } = await q.limit(15000);
  if (error || !data) return 0;
  return new Set((data as { tissue: string }[]).map((r) => r.tissue)).size;
}

export async function getTissueMetricsInternal(
  filters: TissueListFilters,
): Promise<TissueMetrics> {
  const supabase = await createClient();
  const total = await countWithFilters(supabase, filters, false);
  const female = await countWithFilters(supabase, filters, false, (q) =>
    q.eq("gender", "F"),
  );
  const male = await countWithFilters(supabase, filters, false, (q) =>
    q.eq("gender", "M"),
  );
  const malignant = await countWithFilters(supabase, filters, false, (q) =>
    q.eq("category", "Malignant"),
  );
  const tissueTypes = await distinctTissueTypes(supabase, filters, false);

  return {
    total,
    tissueTypes,
    female,
    male,
    malignant,
  };
}

export async function getTissueMetricsPublic(
  filters: TissueListFilters,
): Promise<TissueMetrics> {
  const supabase = createServiceRoleClient();
  const total = await countWithFilters(supabase, filters, true);
  const female = await countWithFilters(supabase, filters, true, (q) =>
    q.eq("gender", "F"),
  );
  const male = await countWithFilters(supabase, filters, true, (q) =>
    q.eq("gender", "M"),
  );
  const malignant = await countWithFilters(supabase, filters, true, (q) =>
    q.eq("category", "Malignant"),
  );
  const tissueTypes = await distinctTissueTypes(supabase, filters, true);

  return {
    total,
    tissueTypes,
    female,
    male,
    malignant,
  };
}

const CATS = [
  "Malignant",
  "Benign",
  "Normal/Control",
  "Pre-malignant",
  "Unknown",
] as const;

export async function getTissueChartsPublic(
  filters: TissueListFilters,
): Promise<TissueCharts> {
  const supabase = createServiceRoleClient();
  let q = supabase.from("tissue_inventory").select("tissue, category");
  q = applyTissueFilters(q, filters, true);
  const { data } = await q.limit(12000);
  const rows = (data ?? []) as { tissue: string; category: string }[];
  const tc: Record<string, number> = {};
  for (const r of rows) {
    tc[r.tissue] = (tc[r.tissue] ?? 0) + 1;
  }
  const topTissues = Object.entries(tc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, count]) => ({ label, count }));

  const cc: Record<string, number> = {};
  for (const c of CATS) cc[c] = 0;
  for (const r of rows) {
    if (cc[r.category] !== undefined) cc[r.category]++;
  }
  const categoryCounts = CATS.map((label) => ({
    label,
    count: cc[label] ?? 0,
  }));

  return { topTissues, categoryCounts };
}

/** Full-catalog charts (all available rows) — uses SQL aggregation when migration is applied. */
export async function getTissueChartsPublicCatalog(): Promise<TissueCharts> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc(
    "get_tissue_inventory_public_summaries",
  );
  if (error || data == null) {
    console.error(error);
    return getTissueChartsPublic({});
  }
  const raw = data as {
    topTissues?: { label: unknown; count: unknown }[];
    categoryCounts?: { label: unknown; count: unknown }[];
  };
  const topTissues = Array.isArray(raw.topTissues)
    ? raw.topTissues.map((t) => ({
        label: String(t.label),
        count: Number(t.count),
      }))
    : [];
  const categoryCounts = Array.isArray(raw.categoryCounts)
    ? raw.categoryCounts.map((c) => ({
        label: String(c.label),
        count: Number(c.count),
      }))
    : [];
  return { topTissues, categoryCounts };
}

/** All distinct tissue labels (available inventory) — uses SQL when migration is applied. */
export async function getTissueTypeOptionsPublicFull(): Promise<string[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc(
    "get_tissue_inventory_public_tissue_types",
  );
  if (error || data == null) {
    if (!isMissingRpcInSchema(error)) console.error(error);
    return getTissueTypeOptions(true);
  }
  return Array.isArray(data) ? (data as string[]) : [];
}

/** All distinct tissue labels (entire inventory, all statuses) — SQL aggregation when migration is applied. */
export async function getTissueTypeOptionsInternalFull(): Promise<string[]> {
  const userClient = await createClient();
  const { data, error } = await userClient.rpc(
    "get_tissue_inventory_internal_tissue_types",
  );
  if (!error && Array.isArray(data)) {
    return data as string[];
  }

  const service = createServiceRoleClient();
  const { data: d2, error: e2 } = await service.rpc(
    "get_tissue_inventory_internal_tissue_types",
  );
  if (!e2 && Array.isArray(d2)) {
    return d2 as string[];
  }

  const missing =
    isMissingRpcInSchema(error) || isMissingRpcInSchema(e2);
  if (!missing) {
    if (error) console.error(error);
    if (e2) console.error(e2);
  }

  // Until internal migration is applied: same full distinct list as /tissue-bank (available rows).
  return getTissueTypeOptionsPublicFull();
}

export async function getTissueChartsInternal(
  filters: TissueListFilters,
): Promise<TissueCharts> {
  const supabase = await createClient();
  let q = supabase.from("tissue_inventory").select("tissue, category");
  q = applyTissueFilters(q, filters, false);
  const { data } = await q.limit(12000);
  const rows = (data ?? []) as { tissue: string; category: string }[];
  const tc: Record<string, number> = {};
  for (const r of rows) {
    tc[r.tissue] = (tc[r.tissue] ?? 0) + 1;
  }
  const topTissues = Object.entries(tc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, count]) => ({ label, count }));

  const cc: Record<string, number> = {};
  for (const c of CATS) cc[c] = 0;
  for (const r of rows) {
    if (cc[r.category] !== undefined) cc[r.category]++;
  }
  const categoryCounts = CATS.map((label) => ({
    label,
    count: cc[label] ?? 0,
  }));

  return { topTissues, categoryCounts };
}

/** Distinct tissue labels for filter dropdowns (sampled). */
export async function getTissueTypeOptions(
  publicAvailableOnly: boolean,
): Promise<string[]> {
  const supabase = publicAvailableOnly
    ? createServiceRoleClient()
    : await createClient();
  let q = supabase.from("tissue_inventory").select("tissue");
  q = applyTissueFilters(q, {}, publicAvailableOnly);
  const { data, error } = await q.limit(25000);
  if (error || !data) return [];
  return [...new Set((data as { tissue: string }[]).map((r) => r.tissue))].sort(
    (a, b) => a.localeCompare(b),
  );
}
