export type AntibodyRow = {
  id: string;
  antibody_name: string;
  vendor_name: string;
  catalog: string;
  lot_number: string;
  ig_species: string;
  working_concentration: string;
  antigen_retrieval: string;
  detection_method: string;
  last_updated_by: string;
  provided_by: string;
  date_provided: string | null;
  created_at: string;
  updated_at: string;
};

export type AntibodySortKey =
  | "antibody_name"
  | "vendor_name"
  | "catalog"
  | "lot_number"
  | "ig_species"
  | "working_concentration"
  | "antigen_retrieval"
  | "detection_method"
  | "last_updated_by"
  | "provided_by"
  | "date_provided"
  | "updated_at";

export type AntibodyListFilters = {
  /** Search across all text fields */
  search?: string;
  /** Exact match (from vendor select) */
  vendor?: string;
  /** Exact match (from Ig species select) */
  igSpecies?: string;
  /** Exact match (from detection method select) */
  detection?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type AntibodyFilterOptions = {
  vendors: string[];
  igSpecies: string[];
  detectionMethods: string[];
};

export type ListAntibodiesResult = {
  rows: AntibodyRow[];
  total: number;
  page: number;
  pageSize: number;
};
