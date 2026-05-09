import type {
  AntibodyListFilters,
  AntibodySortKey,
} from "@/lib/antibodies/types";

const SORT_KEYS: readonly AntibodySortKey[] = [
  "antibody_name",
  "vendor_name",
  "catalog",
  "lot_number",
  "ig_species",
  "working_concentration",
  "antigen_retrieval",
  "detection_method",
  "last_updated_by",
  "provided_by",
  "date_provided",
  "updated_at",
];

export function parseAntibodySearchParams(
  sp: Record<string, string | string[] | undefined>,
): {
  page: number;
  pageSize: number;
  sort: AntibodySortKey;
  sortDir: "asc" | "desc";
  filters: AntibodyListFilters;
} {
  const g = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Math.max(1, parseInt(g("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    200,
    Math.max(10, parseInt(g("pageSize") ?? "40", 10) || 40),
  );
  const sortRaw = g("sort") ?? "antibody_name";
  const sort: AntibodySortKey = SORT_KEYS.includes(sortRaw as AntibodySortKey)
    ? (sortRaw as AntibodySortKey)
    : "antibody_name";
  const sortDir = g("dir") === "desc" ? "desc" : "asc";

  const filters: AntibodyListFilters = {
    search: g("search") || undefined,
    vendor: g("vendor") || undefined,
    igSpecies: g("igSpecies") || undefined,
    detection: g("detection") || undefined,
    dateFrom: g("dateFrom") || undefined,
    dateTo: g("dateTo") || undefined,
  };

  return { page, pageSize, sort, sortDir, filters };
}

export function buildAntibodyQuery(
  base: Record<string, string | undefined>,
): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v !== undefined && v !== "") p.set(k, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function serializeAntibodyQuery(params: {
  page: number;
  pageSize: number;
  sort: AntibodySortKey;
  sortDir: "asc" | "desc";
  filters: AntibodyListFilters;
  basePath?: string;
}): string {
  const f = params.filters;
  const b: Record<string, string | undefined> = {
    page: String(params.page),
    pageSize: String(params.pageSize),
    sort: params.sort,
    dir: params.sortDir,
    search: f.search,
    vendor: f.vendor,
    igSpecies: f.igSpecies,
    detection: f.detection,
    dateFrom: f.dateFrom,
    dateTo: f.dateTo,
  };
  const q = buildAntibodyQuery(b);
  const path = params.basePath ?? "";
  return `${path}${q}`;
}

export type AntibodyParsedSearchParams = ReturnType<
  typeof parseAntibodySearchParams
>;
