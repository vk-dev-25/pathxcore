"use client";

import { useMemo, useState } from "react";

import { useLimsLabelPrintIsolation } from "@/hooks/use-lims-label-print-isolation";
import { Copy, Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildZplFromThermalLabelOptions,
  copyZplToClipboard,
  downloadZplFile,
} from "@/lib/lims-zebra-zpl";
import { printThermalLabel } from "@/lib/print-thermal-label";
import { cn } from "@/lib/utils";

export type LimsSlideLabelPayload = {
  slideReference: string;
  clientSampleId: string | null;
};

function clientLine(id: string | null): string {
  const t = id?.trim();
  return t && t.length > 0 ? t : "—";
}

function safeFilenameSegment(s: string): string {
  return s.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 64) || "slides";
}

function normalizePayloads(
  payload: LimsSlideLabelPayload | LimsSlideLabelPayload[] | null,
): LimsSlideLabelPayload[] {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : [payload];
}

function LabelBlock({ p }: { p: LimsSlideLabelPayload }) {
  return (
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
            {clientLine(p.clientSampleId)}
          </div>
          <div
            className="lims-label-line lims-label-print-line-primary max-w-full whitespace-nowrap text-right font-mono text-3xl font-bold leading-none tracking-tight text-black"
            role="status"
            aria-label={`Slide ${p.slideReference}`}
          >
            {p.slideReference}
          </div>
        </div>
      </div>
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
  const [zplHint, setZplHint] = useState<string | null>(null);
  useLimsLabelPrintIsolation(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quote-print="true"
        data-lims-label-print="true"
        data-lims-slide-labels={items.length > 0 ? "true" : undefined}
        className={cn(
          "flex max-h-[90vh] flex-col justify-start gap-0 overflow-hidden border border-white/[0.08] bg-background p-0 print:h-auto print:min-h-0 print:overflow-visible sm:max-w-md",
          items.length > 1 && "sm:max-w-2xl",
        )}
      >
        <DialogHeader className="lims-label-dialog-chrome sr-only">
          <DialogTitle>Slide labels</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex flex-1 flex-col justify-start overflow-y-auto px-6 py-4 print:h-auto print:min-h-0 print:max-h-none print:flex-none print:overflow-visible print:p-0 print:px-0">
          {items.length === 0 ? (
            <p className="lims-label-dialog-chrome text-sm text-muted-foreground">No slide selected.</p>
          ) : (
            <div className="lims-label-preview-slot flex w-full shrink-0 flex-col items-end justify-start">
              <div className="mt-0 w-full space-y-6 pt-0 text-black print:mt-0 print:space-y-0 print:pt-0">
                {items.map((p, i) => (
                  <LabelBlock key={`${p.slideReference}-${i}`} p={p} />
                ))}
              </div>
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
                pages: items.map((it) => ({
                  clientSampleId: it.clientSampleId,
                  slideReference: it.slideReference,
                })),
              })
            }
          >
            <Printer className="mr-2 h-4 w-4" />
            {printLabel}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs"
              disabled={items.length === 0}
              onClick={() => {
                const zpl = buildZplFromThermalLabelOptions({
                  mode: "slides",
                  pages: items.map((it) => ({
                    clientSampleId: it.clientSampleId,
                    slideReference: it.slideReference,
                  })),
                });
                const base =
                  items.length === 1
                    ? safeFilenameSegment(items[0]!.slideReference)
                    : `${items.length}-labels`;
                downloadZplFile(`lims-slides-${base}.zpl`, zpl);
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              ZPL file
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs"
              disabled={items.length === 0}
              onClick={async () => {
                const zpl = buildZplFromThermalLabelOptions({
                  mode: "slides",
                  pages: items.map((it) => ({
                    clientSampleId: it.clientSampleId,
                    slideReference: it.slideReference,
                  })),
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
            Zebra: <span className="font-medium">ZPL file</span> /{" "}
            <span className="font-medium">Copy ZPL</span> for raw printing (e.g.{" "}
            <span className="whitespace-nowrap font-mono text-[10px]">nc IP 9100</span>). Browsers
            cannot send ZPL to the printer directly. 1&quot; × 1&quot; @ 203 dpi. PDF: turn off{" "}
            <span className="whitespace-nowrap">Headers and footers</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
