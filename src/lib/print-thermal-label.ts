import {
  attachDataQuotePrintHost,
  detachDataQuotePrintHost,
} from "@/lib/print-data-quote";

const LIMS_LABEL_PRINT_STYLE_ID = "lims-label-print-page-override";

/**
 * Open the browser print dialog for small thermal labels.
 *
 * Chrome/Edge/Safari add date, title, and URL in the margin unless the user turns off
 * "Headers and footers" (Print → More settings). We cannot remove those from code.
 * Shortening document.title during print hides the long site title in that header line.
 *
 * In production, Chrome often falls back to the global stylesheet @page { margin: 12mm; size: auto }
 * when the print root is out-of-flow (fixed/absolute) or named @page is dropped — yielding a
 * letter-sized PDF with only a corner of the label. Injecting @page at print time wins in the
 * cascade and matches the 1" × 1" driver setting.
 */
export function printThermalLabel(): void {
  const host = attachDataQuotePrintHost();
  const previousTitle = document.title;
  document.title = "\u200b";

  const existing = document.getElementById(LIMS_LABEL_PRINT_STYLE_ID);
  existing?.remove();

  const style = document.createElement("style");
  style.id = LIMS_LABEL_PRINT_STYLE_ID;
  style.media = "print";
  style.textContent = `
    @page { size: 1in 1in; margin: 0; }
    @page limsZebraLabel { size: 1in 1in; margin: 0; }
  `;
  document.head.appendChild(style);

  const cleanup = () => {
    detachDataQuotePrintHost(host);
    document.title = previousTitle;
    style.remove();
  };

  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 4_000);
}
