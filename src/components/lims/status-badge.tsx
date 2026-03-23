import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";

type Variant = BadgeProps["variant"];

const STATUS_MAP: Record<string, Variant> = {
  // Accession / specimen status
  received:       "default",
  blocked:        "warning",
  slides_cut:     "blue",
  complete:       "success",
  // Project status
  active:         "success",
  on_hold:        "warning",
  completed:      "outline",
  // Stain status
  unassigned:     "outline",
  assigned:       "warning",
  stained:        "success",
  // Run outcome
  pass:           "success",
  fail:           "destructive",
  pending:        "warning",
  // Assay status
  in_development: "warning",
  approved:       "blue",
  locked:         "success",
  // Control role
  positive:       "success",
  negative:       "destructive",
  // Project type
  STANDARD:       "default",
  IHC_DEV:        "purple",
};

const LABEL_MAP: Record<string, string> = {
  slides_cut:     "Slides Cut",
  in_development: "In Development",
  on_hold:        "On Hold",
  IHC_DEV:        "IHC Dev",
  STANDARD:       "Standard",
  direct_print:   "Direct Print",
  adhesive:       "Adhesive Label",
  printed:        "Printed",
  handwritten:    "Handwritten",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_MAP[status] ?? "outline";
  const label = LABEL_MAP[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge variant={variant}>{label}</Badge>;
}
