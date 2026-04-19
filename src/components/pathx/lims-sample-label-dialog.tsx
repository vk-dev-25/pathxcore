"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LimsSpeciesKind } from "@/lib/lims/types";
import { printThermalLabel } from "@/lib/print-thermal-label";
import { cn } from "@/lib/utils";

/** Minimal fields for a cassette / container specimen label (LIMS accession practice). */
export type LimsSampleLabelPayload = {
  sampleReference: string;
  clientSampleId: string | null;
  projectReference: string;
  projectTitle: string;
  specimenName: string;
  tissueType: string;
  organAbbrev: string | null;
  species_kind: LimsSpeciesKind;
};

function clientLine(id: string | null): string {
  const t = id?.trim();
  return t && t.length > 0 ? t : "—";
}

export function LimsSampleLabelDialog({
  open,
  onOpenChange,
  payload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: LimsSampleLabelPayload | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quote-print="true"
        data-lims-label-print="true"
        className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden border border-white/[0.08] bg-background p-0 print:overflow-visible sm:max-w-md"
      >
        <DialogHeader className="lims-label-dialog-chrome sr-only">
          <DialogTitle>Sample label</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 print:h-full print:max-h-none print:overflow-visible print:p-0 print:px-0">
          {!payload ? (
            <p className="text-sm text-muted-foreground">No sample selected.</p>
          ) : (
            <div
              className={cn(
                "lims-zebra-label-page rounded-lg border border-white/[0.06] bg-white p-8 text-black",
                "flex flex-col items-center justify-center print:rounded-none print:border-0",
              )}
            >
              <p className="lims-label-print-line-secondary max-w-full break-words text-center text-lg font-semibold text-black">
                {clientLine(payload.clientSampleId)}
              </p>
              <p
                className="lims-label-print-line-primary mt-2 max-w-full break-words text-center font-mono text-2xl font-bold tracking-tight text-black"
                aria-label={`Sample ${payload.sampleReference}`}
              >
                {payload.sampleReference}
              </p>
            </div>
          )}
        </div>
        <div className="lims-label-dialog-chrome shrink-0 space-y-2 border-t border-border bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border-neutral-300 text-black dark:border-white/20 dark:text-foreground"
            disabled={!payload}
            onClick={() =>
              payload &&
              printThermalLabel({
                mode: "sample",
                clientSampleId: payload.clientSampleId,
                sampleReference: payload.sampleReference,
              })
            }
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
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
