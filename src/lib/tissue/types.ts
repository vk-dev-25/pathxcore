export type TissueBlockStatus = "available" | "sold" | "discarded";

export type TissueInventoryRow = {
  id: string;
  accession: string;
  dob: string | null;
  gender: string | null;
  tissue: string;
  diag_short: string | null;
  diag_text: string | null;
  category: string;
  source_tab: string;
  catalog_id: string | null;
  status: TissueBlockStatus;
  sold_at: string | null;
  sold_note: string | null;
  discarded_at: string | null;
  discarded_note: string | null;
  created_at: string;
  updated_at: string;
};

export type TissueListFilters = {
  tissue?: string;
  diagnosis?: string;
  category?: string;
  gender?: string;
  catalogId?: string;
  accession?: string;
  status?: TissueBlockStatus | "";
};

export type TissueSortKey =
  | "catalog_id"
  | "accession"
  | "tissue"
  | "category"
  | "gender"
  | "diag_short"
  | "created_at";

export type ListTissueResult = {
  rows: TissueInventoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type TissueCharts = {
  topTissues: { label: string; count: number }[];
  categoryCounts: { label: string; count: number }[];
};
