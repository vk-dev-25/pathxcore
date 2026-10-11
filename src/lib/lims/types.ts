export type LimsProjectStatus =
  | "created"
  | "started"
  | "blocked"
  | "shipped"
  | "completed"
  | "cancelled";

export type LimsSpeciesKind = "human" | "mouse" | "rat" | "rabbit" | "monkey";

/** Ordered values for selects (add-sample and sample editor). */
export const LIMS_SPECIES_KINDS: readonly LimsSpeciesKind[] = [
  "human",
  "mouse",
  "rat",
  "rabbit",
  "monkey",
];

/** Short labels for LIMS species (sample accessioning). */
export function formatLimsSpeciesLabel(kind: LimsSpeciesKind): string {
  switch (kind) {
    case "human":
      return "Human";
    case "mouse":
      return "Mouse";
    case "rat":
      return "Rat";
    case "rabbit":
      return "Rabbit";
    case "monkey":
      return "Monkey";
  }
}

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
  return (
    s === "human" ||
    s === "mouse" ||
    s === "rat" ||
    s === "rabbit" ||
    s === "monkey"
  );
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
