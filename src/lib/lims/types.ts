export type LimsProjectStatus =
  | "created"
  | "started"
  | "blocked"
  | "shipped"
  | "completed"
  | "cancelled";

export type LimsSpeciesKind = "human" | "animal";

/** Display label: first letter capitalized (e.g. Created, Cancelled). */
export function formatLimsProjectStatusLabel(status: LimsProjectStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function isLimsProjectStatus(s: string): s is LimsProjectStatus {
  return (
    s === "created" ||
    s === "started" ||
    s === "blocked" ||
    s === "shipped" ||
    s === "completed" ||
    s === "cancelled"
  );
}

export function isLimsSpeciesKind(s: string): s is LimsSpeciesKind {
  return s === "human" || s === "animal";
}

export function canTransitionProjectStatus(
  from: LimsProjectStatus,
  to: LimsProjectStatus,
): boolean {
  if (from === to) return true;
  const terminal: LimsProjectStatus[] = ["cancelled", "completed"];
  if (terminal.includes(from)) return false;
  return true;
}
