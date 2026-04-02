"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatLimsSpeciesLabel, type LimsSpeciesKind } from "@/lib/lims/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function materialLine(p: LimsSampleLabelPayload): string {
  const t = p.tissueType.trim() || "—";
  const o = p.organAbbrev?.trim();
  if (o) return `${o} · ${t}`;
  return t;
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
  const cleanupPrintRef = useRef<null | (() => void)>(null);

  const resetPrintScroll = useCallback(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll<HTMLElement>('[data-quote-print="true"]').forEach((node) => {
      node.scrollTop = 0;
    });
  }, []);

  const preparePrintSurface = useCallback(() => {
    resetPrintScroll();

    const root = document.querySelector<HTMLElement>('[data-quote-print="true"]');
    if (!root) return () => {};

    const touched = new Map<HTMLElement, string>();
    const remember = (el: HTMLElement) => {
      if (!touched.has(el)) touched.set(el, el.style.cssText);
    };

    const forceWhite = (el: HTMLElement) => {
      el.style.setProperty("background", "#fff", "important");
      el.style.setProperty("background-color", "#fff", "important");
      el.style.setProperty("color", "#111", "important");
    };

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    remember(htmlEl);
    remember(bodyEl);
    forceWhite(htmlEl);
    forceWhite(bodyEl);
    bodyEl.style.setProperty("margin", "0", "important");
    bodyEl.style.setProperty("padding", "0", "important");

    const topChildren = Array.from(bodyEl.children) as HTMLElement[];
    topChildren.forEach((child) => {
      remember(child);
      if (child.contains(root) || child === root) {
        child.style.setProperty("display", "block", "important");
        child.style.setProperty("visibility", "visible", "important");
        forceWhite(child);
      } else {
        child.style.setProperty("display", "none", "important");
      }
    });

    remember(root);
    root.style.setProperty("position", "static", "important");
    root.style.setProperty("left", "auto", "important");
    root.style.setProperty("top", "auto", "important");
    root.style.setProperty("width", "auto", "important");
    root.style.setProperty("max-width", "none", "important");
    root.style.setProperty("height", "auto", "important");
    root.style.setProperty("max-height", "none", "important");
    root.style.setProperty("overflow", "visible", "important");
    root.style.setProperty("border", "0", "important");
    root.style.setProperty("box-shadow", "none", "important");
    forceWhite(root);

    return () => {
      touched.forEach((cssText, el) => {
        el.style.cssText = cssText;
      });
    };
  }, [resetPrintScroll]);

  useEffect(() => {
    const onBeforePrint = () => {
      cleanupPrintRef.current?.();
      cleanupPrintRef.current = preparePrintSurface();
    };
    const onAfterPrint = () => {
      cleanupPrintRef.current?.();
      cleanupPrintRef.current = null;
    };
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      cleanupPrintRef.current?.();
      cleanupPrintRef.current = null;
    };
  }, [preparePrintSurface]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-white/[0.08] bg-card/95 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-white/[0.06] px-6 py-4">
          <DialogTitle className="text-base font-semibold">Specimen label</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6 pt-2">
          {!payload ? (
            <p className="text-sm text-muted-foreground">No sample selected.</p>
          ) : (
            <div
              data-quote-print="true"
              className="quote-print-body space-y-4 rounded-lg border border-white/[0.06] bg-white p-6 text-sm text-black print:border-neutral-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
                    Laboratory accession
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold tracking-tight text-black">
                    {payload.sampleReference}
                  </p>
                </div>
                <Image
                  src="/images/pathxlogo.jpeg"
                  alt="Pathology X Diagnostics"
                  width={120}
                  height={110}
                  className="h-10 w-auto object-contain"
                />
              </div>

              <dl className="grid gap-y-1.5 text-sm sm:grid-cols-[128px_1fr] sm:gap-x-3">
                {payload.clientSampleId?.trim() ? (
                  <>
                    <dt className="text-neutral-600">Client specimen ID</dt>
                    <dd className="font-mono font-medium text-black">
                      {payload.clientSampleId.trim()}
                    </dd>
                  </>
                ) : null}
                <dt className="text-neutral-600">Project</dt>
                <dd>
                  <span className="font-mono font-medium text-black">
                    {payload.projectReference}
                  </span>
                  {payload.projectTitle.trim() ? (
                    <span className="mt-0.5 block text-xs font-normal text-neutral-700">
                      {payload.projectTitle.trim()}
                    </span>
                  ) : null}
                </dd>
                <dt className="text-neutral-600">Specimen / block</dt>
                <dd className="text-black">{payload.specimenName.trim() || "—"}</dd>
                <dt className="text-neutral-600">Material</dt>
                <dd className="text-black">{materialLine(payload)}</dd>
                <dt className="text-neutral-600">Species</dt>
                <dd className="text-black">{formatLimsSpeciesLabel(payload.species_kind)}</dd>
                <dt className="text-neutral-600">Date received</dt>
                <dd className="text-black">{formatReceived(payload.dateReceived)}</dd>
              </dl>

              <p className="border-t border-neutral-200 pt-3 text-center text-[10px] text-neutral-600">
                {payload.sampleReference} · Pathology X Diagnostics
              </p>

              <div className="print:hidden">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-neutral-300 text-black"
                  onClick={() => {
                    cleanupPrintRef.current?.();
                    cleanupPrintRef.current = preparePrintSurface();
                    window.requestAnimationFrame(() => window.print());
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Save PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
