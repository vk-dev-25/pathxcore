"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calcAge, formatTissueSizeCm } from "@/lib/tissue/format";
import type { TissueInventoryRow } from "@/lib/tissue/types";
import { cn } from "@/lib/utils";

function formatDob(dob: string | null | undefined): string {
  if (!dob || dob === "nan") return "—";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toISOString().slice(0, 10);
}

export function TissueInventoryDetailDialog({
  row,
  open,
  onOpenChange,
  variant = "marketing",
}: {
  row: TissueInventoryRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "marketing" | "dashboard";
}) {
  const fullDiagnosis =
    row?.diag_text?.trim() || row?.diag_short?.trim() || "—";

  const borderTop =
    variant === "marketing" ? "border-white/[0.08]" : "border-border";

  const contentClass =
    variant === "marketing"
      ? "border-white/[0.12] bg-card/95 backdrop-blur-xl"
      : "border-border bg-card";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[85vh] max-w-lg overflow-y-auto print:hidden",
          contentClass,
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-left text-base">Block details</DialogTitle>
        </DialogHeader>
        {row ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Full diagnosis
              </p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground">
                {fullDiagnosis}
              </p>
            </div>
            {variant === "marketing" ? (
              <p className={cn("border-t pt-3 text-xs text-muted-foreground", borderTop)}>
                <span className="font-medium text-foreground">
                  Catalog ID: {row.catalog_id || "—"}
                </span>
                <span className="mx-2">|</span>
                <span>DOB: {formatDob(row.dob)}</span>
                {row.gender ? (
                  <>
                    <span className="mx-2">|</span>
                    <span>Gender: {row.gender}</span>
                  </>
                ) : null}
              </p>
            ) : (
              <>
                <p
                  className={cn(
                    "border-t pt-3 text-xs text-muted-foreground",
                    borderTop,
                    // Keep status on the same line (avoid wrapping on small widths).
                    "whitespace-nowrap overflow-hidden text-ellipsis",
                  )}
                >
                  <span className="font-medium text-foreground">
                    Catalog ID: {row.catalog_id || "—"}
                  </span>
                  <span className="mx-2">|</span>
                  <span className="font-mono">
                    Accession: {row.accession || "—"}
                  </span>
                  <span className="mx-2">|</span>
                  <span className="capitalize">Status: {row.status}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  <span>DOB: {formatDob(row.dob)}</span>
                  {row.gender ? (
                    <>
                      <span className="mx-2">|</span>
                      <span>Gender: {row.gender}</span>
                    </>
                  ) : null}
                  <span className="mx-2">|</span>
                  <span>Age: {calcAge(row.dob) ?? "—"}</span>
                </p>
              </>
            )}
            <dl className="grid gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between gap-4">
                <dt>Tissue</dt>
                <dd className="text-right text-foreground">{row.tissue}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Category</dt>
                <dd className="text-right text-foreground">{row.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Size (L × W × H)</dt>
                <dd className="text-right font-mono text-xs tabular-nums text-foreground">
                  {formatTissueSizeCm(
                    row.size_length_cm,
                    row.size_width_cm,
                    row.size_height_cm,
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Primary diagnosis (short)</dt>
                <dd className="max-w-[60%] text-right text-foreground">
                  {row.diag_short || "—"}
                </dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
