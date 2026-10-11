export type SharedFileStatus =
  | "uploading"
  | "ready"
  | "failed"
  | "expired"
  | "deleted";

export type SharedFileRow = {
  id: string;
  title: string | null;
  original_filename: string;
  content_type: string;
  byte_size: number;
  s3_key: string;
  upload_id: string | null;
  status: SharedFileStatus;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SharedFileAccessRow = {
  id: string;
  shared_file_id: string;
  email: string;
  added_by: string | null;
  created_at: string;
};

export function isSharedFileStatus(v: string): v is SharedFileStatus {
  return (
    v === "uploading" ||
    v === "ready" ||
    v === "failed" ||
    v === "expired" ||
    v === "deleted"
  );
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n;
  let i = -1;
  do {
    v /= 1024;
    i += 1;
  } while (v >= 1024 && i < units.length - 1);
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
