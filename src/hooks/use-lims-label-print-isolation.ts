"use client";

import { useEffect, useRef } from "react";

import {
  attachDataQuotePrintHost,
  detachDataQuotePrintHost,
} from "@/lib/print-data-quote";

const LIMS_PRINT_PAGE_MARGIN_STYLE_ID = "lims-print-page-margin-zero";

/** Re-append so this sheet is last in <head> and wins over globals @page { margin: 12mm }. */
function injectLimsPrintPageMarginZero(): void {
  document.getElementById(LIMS_PRINT_PAGE_MARGIN_STYLE_ID)?.remove();
  const el = document.createElement("style");
  el.id = LIMS_PRINT_PAGE_MARGIN_STYLE_ID;
  el.textContent = `@media print {
    @page { margin: 0 !important; size: 1in 1in !important; }
    @page limsZebraLabel { margin: 0 !important; size: 1in 1in !important; }
    html, body { margin: 0 !important; padding: 0 !important; }
  }`;
  document.head.appendChild(el);
}

function removeLimsPrintPageMarginZero(): void {
  document.getElementById(LIMS_PRINT_PAGE_MARGIN_STYLE_ID)?.remove();
}

/**
 * Cmd+P / Save PDF from a LIMS label dialog does not go through printWithDataQuoteIsolation.
 * Without html[data-print-data-quote], the default @page (Letter + margins) centers a tiny
 * label. Mirror quote-print: mark the portal host on beforeprint, detach on afterprint.
 *
 * globals.css uses @page { margin: 12mm } for quotes — that inset pushes label content below
 * the physical top. We inject zero-margin @page while the dialog is open (not only on beforeprint)
 * so Chrome’s print/PDF preview picks it up; afterprint only detaches the host.
 */
export function useLimsLabelPrintIsolation(open: boolean) {
  const hostRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      removeLimsPrintPageMarginZero();
      detachDataQuotePrintHost(hostRef.current);
      hostRef.current = null;
      return;
    }

    injectLimsPrintPageMarginZero();

    const onBeforePrint = () => {
      injectLimsPrintPageMarginZero();
      hostRef.current = attachDataQuotePrintHost();
    };

    const onAfterPrint = () => {
      detachDataQuotePrintHost(hostRef.current);
      hostRef.current = null;
    };

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      removeLimsPrintPageMarginZero();
      detachDataQuotePrintHost(hostRef.current);
      hostRef.current = null;
    };
  }, [open]);
}
