"use client";

import { useState } from "react";

import { useLimsLabelPrintIsolation } from "@/hooks/use-lims-label-print-isolation";
import { Copy, Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LimsSpeciesKind } from "@/lib/lims/types";
import {
  buildZplFromThermalLabelOptions,
  copyZplToClipboard,
  downloadZplFile,
} from "@/lib/lims-zebra-zpl";
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

function safeFilenameSegment(s: string): string {
  return s.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 64) || "label";
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
  const [zplHint, setZplHint] = useState<string | null>(null);
  useLimsLabelPrintIsolation(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quote-print="true"
        data-lims-label-print="true"
        className="flex max-h-[90vh] max-w-md flex-col justify-start gap-0 overflow-hidden border border-white/[0.08] bg-background p-0 print:h-auto print:min-h-0 print:overflow-visible sm:max-w-md"
      >
        <DialogHeader className="lims-label-dialog-chrome sr-only">
          <DialogTitle>Sample label</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex flex-1 flex-col justify-start overflow-y-auto px-6 py-4 print:h-auto print:min-h-0 print:max-h-none print:flex-none print:overflow-visible print:p-0 print:px-0">
          {!payload ? (
            <p className="text-sm text-muted-foreground">No sample selected.</p>
          ) : (
            <div className="lims-label-preview-slot flex w-full shrink-0 flex-col items-end justify-start">
              <div
                className={cn(
                  "lims-zebra-label-page m-0 mt-0 rounded-lg border border-white/[0.06] bg-white pl-4 pr-0.5 pb-0 pt-0 text-black",
                  "flex w-full flex-col items-stretch justify-start print:rounded-none print:border-0 print:px-0",
                )}
              >
                <div className="lims-label-stack-outer m-0 mt-0 flex w-full shrink-0 justify-end p-0 pt-0">
                  <div className="lims-label-stack m-0 mt-0 flex max-w-full flex-col items-end gap-0 p-0 pt-0 leading-snug">
                    <div
                      className="lims-label-line lims-label-print-line-secondary max-w-full break-words text-right text-lg font-semibold text-black"
                      role="status"
                    >
                      {clientLine(payload.clientSampleId)}
                    </div>
                    <div
                      className="lims-label-line lims-label-print-line-primary max-w-full whitespace-nowrap text-right font-mono text-3xl font-bold leading-none tracking-tight text-black"
                      role="status"
                      aria-label={`Sample ${payload.sampleReference}`}
                    >
                      {payload.sampleReference}
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs"
              disabled={!payload}
              onClick={() => {
                if (!payload) return;
                const zpl = buildZplFromThermalLabelOptions({
                  mode: "sample",
                  clientSampleId: payload.clientSampleId,
                  sampleReference: payload.sampleReference,
                });
                downloadZplFile(
                  `lims-sample-${safeFilenameSegment(payload.sampleReference)}.zpl`,
                  zpl,
                );
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              ZPL file
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs"
              disabled={!payload}
              onClick={async () => {
                if (!payload) return;
                const zpl = buildZplFromThermalLabelOptions({
                  mode: "sample",
                  clientSampleId: payload.clientSampleId,
                  sampleReference: payload.sampleReference,
                });
                const ok = await copyZplToClipboard(zpl);
                setZplHint(ok ? "ZPL copied." : "Copy failed.");
                window.setTimeout(() => setZplHint(null), 2500);
              }}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy ZPL
            </Button>
          </div>
          {zplHint ? (
            <p className="text-center text-xs text-muted-foreground">{zplHint}</p>
          ) : null}
          <p className="text-center text-xs text-muted-foreground">
            Zebra: use <span className="font-medium">ZPL file</span> or{" "}
            <span className="font-medium">Copy ZPL</span> and send raw to the printer (e.g.{" "}
            <span className="whitespace-nowrap font-mono text-[10px]">nc IP 9100</span>). Browsers
            cannot print ZPL directly. 1&quot; × 1&quot; @ 203 dpi. For PDF print: turn off{" "}
            <span className="whitespace-nowrap">Headers and footers</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
