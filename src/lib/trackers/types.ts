export type TrackerStatusTag =
  | "completed"
  | "in_progress"
  | "awaiting_client"
  | "paused"
  | "halted"
  | "na";

export const STATUS_TAG_OPTIONS: { value: TrackerStatusTag; label: string }[] = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_client", label: "Awaiting Client" },
  { value: "paused", label: "Paused" },
  { value: "halted", label: "Halted" },
  { value: "na", label: "N/A" },
];

/** Editable data columns, in display order. `key` matches the DB column. */
export const TRACKER_COLUMNS: { key: TrackerDataField; label: string }[] = [
  { key: "project_id", label: "Project ID" },
  { key: "application", label: "Application" },
  { key: "target", label: "Target" },
  { key: "assay_dev", label: "Assay Dev" },
  { key: "pos_control", label: "Pos Control" },
  { key: "neg_control", label: "Neg Control" },
  { key: "normal_tma", label: "Normal TMA" },
  { key: "tumor_tma", label: "Tumor TMA" },
  { key: "slides", label: "Slides" },
  { key: "quote", label: "Quote" },
  { key: "quote_sent", label: "Quote Sent?" },
  { key: "status", label: "Status" },
  { key: "completion_date", label: "Completion Date" },
  { key: "next_action", label: "Next Action" },
  { key: "notes", label: "Notes" },
  { key: "client_comments", label: "Client Comments" },
];

export type TrackerDataField =
  | "project_id"
  | "application"
  | "target"
  | "assay_dev"
  | "pos_control"
  | "neg_control"
  | "normal_tma"
  | "tumor_tma"
  | "slides"
  | "quote"
  | "quote_sent"
  | "status"
  | "completion_date"
  | "next_action"
  | "notes"
  | "client_comments";

export type TrackerRow = {
  id: string;
  tracker_id: string;
  sort_order: number;
  row_type: "data" | "group";
  group_label: string | null;
  status_tag: TrackerStatusTag | null;
  updated_by_email: string | null;
  updated_at: string;
} & Record<TrackerDataField, string | null>;

export type TrackerAccessEntry = {
  id: string;
  email: string;
  role: "client" | "staff";
};

export type TrackerSummary = {
  id: string;
  title: string;
  client_id: string;
  client_name: string;
  row_count: number;
  updated_at: string;
};

export type TrackerRole = "staff" | "client";
