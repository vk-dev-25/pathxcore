import type { TissueListFilters, TissueSortKey } from "@/lib/tissue/types";

export function parseTissueSearchParams(
  sp: Record<string, string | string[] | undefined>,
): {
  page: number;
  pageSize: number;
  sort: TissueSortKey;
  sortDir: "asc" | "desc";
  filters: TissueListFilters;
} {
  const g = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Math.max(1, parseInt(g("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    200,
    Math.max(10, parseInt(g("pageSize") ?? "60", 10) || 60),
  );
  const sortRaw = g("sort") ?? "catalog_id";
  const sort: TissueSortKey = [
    "catalog_id",
    "accession",
    "tissue",
    "category",
    "gender",
    "diag_short",
    "created_at",
  ].includes(sortRaw)
    ? (sortRaw as TissueSortKey)
    : "catalog_id";
  const sortDir = g("dir") === "desc" ? "desc" : "asc";

  const statusRaw = g("status");
  const statusParsed: TissueListFilters["status"] =
    statusRaw === "available" ||
    statusRaw === "sold" ||
    statusRaw === "discarded"
      ? statusRaw
      : "";

  const filters: TissueListFilters = {
    tissue: g("tissue") || undefined,
    diagnosis: g("diagnosis") || undefined,
    category: g("category") || undefined,
    gender: g("gender") || undefined,
    catalogId: g("catalogId") || undefined,
    accession: g("accession") || undefined,
    status: statusParsed || undefined,
  };

  return { page, pageSize, sort, sortDir, filters };
}

export function buildTissueQuery(
  base: Record<string, string | undefined>,
): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v !== undefined && v !== "") p.set(k, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function serializeTissueQuery(params: {
  page: number;
  pageSize: number;
  sort: TissueSortKey;
  sortDir: "asc" | "desc";
  filters: TissueListFilters;
  basePath?: string;
}): string {
  const b: Record<string, string | undefined> = {
    page: String(params.page),
    pageSize: String(params.pageSize),
    sort: params.sort,
    dir: params.sortDir,
    tissue: params.filters.tissue,
    diagnosis: params.filters.diagnosis,
    category: params.filters.category,
    gender: params.filters.gender,
    catalogId: params.filters.catalogId,
    accession: params.filters.accession,
    status: params.filters.status || undefined,
  };
  const q = buildTissueQuery(b);
  const path = params.basePath ?? "";
  return `${path}${q}`;
}
