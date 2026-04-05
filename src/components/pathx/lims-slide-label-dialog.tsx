"use client";

import { useMemo } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { printThermalLabel } from "@/lib/print-thermal-label";
import { cn } from "@/lib/utils";

export type LimsSlideLabelPayload = {
  slideReference: string;
  sampleReference: string;
  createdAt: string;
};

function normalizePayloads(
  payload: LimsSlideLabelPayload | LimsSlideLabelPayload[] | null,
): LimsSlideLabelPayload[] {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : [payload];
}

function LabelBlock({
  p,
  printBreakAfter,
}: {
  p: LimsSlideLabelPayload;
  printBreakAfter: boolean;
}) {
  return (
    <div
      className={cn(
        "lims-zebra-label-page lims-zebra-label-page--slide rounded-lg border border-white/[0.06] bg-white p-6 text-black",
        "flex flex-col items-center justify-center print:rounded-none print:border-0",
        printBreakAfter && "print:break-after-page",
      )}
    >
      <p
        className="lims-label-print-line-primary max-w-full break-words text-center font-mono text-2xl font-bold tracking-tight text-black"
        aria-label={`Slide ${p.slideReference}`}
      >
        {p.slideReference}
      </p>
    </div>
  );
}

export function LimsSlideLabelDialog({
  open,
  onOpenChange,
  payload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: LimsSlideLabelPayload | LimsSlideLabelPayload[] | null;
}) {
  const items = useMemo(() => normalizePayloads(payload), [payload]);
  const printLabel = items.length === 1 ? "Print / Save PDF" : "Print all / Save PDF";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quote-print="true"
        data-lims-label-print="true"
        data-lims-slide-labels={items.length > 0 ? "true" : undefined}
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden border border-white/[0.08] bg-background p-0 print:overflow-visible sm:max-w-md",
          items.length > 1 && "sm:max-w-2xl",
        )}
      >
        <DialogHeader className="lims-label-dialog-chrome sr-only">
          <DialogTitle>Slide labels</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 print:max-h-none print:overflow-visible print:p-0 print:px-0">
          {items.length === 0 ? (
            <p className="lims-label-dialog-chrome text-sm text-muted-foreground">No slide selected.</p>
          ) : (
            <div className="space-y-6 text-black print:space-y-0">
              {items.map((p, i) => (
                <LabelBlock
                  key={`${p.slideReference}-${p.createdAt}`}
                  p={p}
                  printBreakAfter={i < items.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lims-label-dialog-chrome shrink-0 space-y-2 border-t border-border bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border-neutral-300 text-black dark:border-white/20 dark:text-foreground"
            disabled={items.length === 0}
            onClick={() =>
              printThermalLabel({
                mode: "slides",
                slideReferences: items.map((it) => it.slideReference),
              })
            }
          >
            <Printer className="mr-2 h-4 w-4" />
            {printLabel}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Label size is 1&quot; × 1&quot; — match this in the printer driver. For PDF: open{" "}
            <span className="whitespace-nowrap">More settings</span> and turn off{" "}
            <span className="whitespace-nowrap">Headers and footers</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
