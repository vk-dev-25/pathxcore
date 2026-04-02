"use client";

import { useCallback, useEffect, useRef } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type LimsSlideLabelPayload = {
  slideReference: string;
  sampleReference: string;
  createdAt: string;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function LimsSlideLabelDialog({
  open,
  onOpenChange,
  payload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: LimsSlideLabelPayload | null;
}) {
  const cleanupPrintRef = useRef<null | (() => void)>(null);

  const resetPrintScroll = useCallback(() => {
    window.scrollTo(0, 0);
    const nodes = document.querySelectorAll<HTMLElement>('[data-quote-print="true"]');
    nodes.forEach((node) => {
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

    const rootEl = document.documentElement;
    const bodyEl = document.body;
    remember(rootEl);
    remember(bodyEl);
    forceWhite(rootEl);
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
          <DialogTitle className="text-base font-semibold">Slide label</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6 pt-2">
          {!payload ? (
            <p className="text-sm text-muted-foreground">No slide selected.</p>
          ) : (
            <div
              data-quote-print="true"
              className="quote-print-body space-y-4 rounded-lg border border-white/[0.06] bg-white p-6 text-sm text-black print:border-neutral-300"
            >
              <dl className="grid gap-y-2 text-sm sm:grid-cols-[120px_1fr] sm:gap-x-3">
                <dt className="text-neutral-600">Slide ID</dt>
                <dd className="font-mono font-semibold text-black">
                  {payload.slideReference}
                </dd>
                <dt className="text-neutral-600">Sample ID</dt>
                <dd className="font-mono font-semibold text-black">
                  {payload.sampleReference}
                </dd>
                <dt className="text-neutral-600">Slide created</dt>
                <dd className="text-black">{formatWhen(payload.createdAt)}</dd>
              </dl>

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
