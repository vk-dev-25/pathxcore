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
  dateReceived: string | null;
};

function formatReceived(raw: string | null): string {
  if (!raw?.trim()) return "—";
  try {
    const d = raw.includes("T") ? new Date(raw) : new Date(`${raw.trim()}T12:00:00`);
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
  } catch {
    return raw.trim();
  }
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
        className="flex max-h-[85vh] max-w-md flex-col gap-0 overflow-hidden border border-white/[0.08] bg-background p-0 sm:max-w-md"
      >
        <DialogHeader className="sr-only print:hidden">
          <DialogTitle>Sample label</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 print:max-h-none print:overflow-visible">
          {!payload ? (
            <p className="text-sm text-muted-foreground">No sample selected.</p>
          ) : (
            <div className="rounded-lg border border-white/[0.06] bg-white p-8 text-black print:border-neutral-300">
              <p className="font-mono text-2xl font-bold tracking-tight text-black print:text-black">
                {payload.sampleReference}
              </p>
              <p className="mt-6 text-sm font-medium text-neutral-700 print:text-black">
                Date received
              </p>
              <p className="mt-1 text-lg font-semibold text-black print:text-black">
                {formatReceived(payload.dateReceived)}
              </p>
            </div>
          )}
        </div>
        <div className="shrink-0 border-t border-border bg-background px-6 py-4 print:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full border-neutral-300 text-black dark:border-white/20 dark:text-foreground"
            disabled={!payload}
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
