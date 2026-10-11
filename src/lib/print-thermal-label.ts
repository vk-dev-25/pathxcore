/**
 * LIMS 1" × 1" labels: print from a dedicated iframe document.
 *
 * Printing the in-app dialog relies on @media print, portals, Tailwind, and host isolation —
 * those break often in production (Vercel) / Save PDF. A blank iframe with only label HTML
 * matches what works in Zebra/browser drivers.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Top = client sample ID, bottom = LIMS sample ID or slide ID (1\" thermal). */
function buildLimsLabelHtml(pages: { top: string; bottom: string }[]): string {
  const multi = pages.length > 1;
  const body = pages
    .map(
      (p) =>
        `<div class="sheet"><div class="label-anchor"><div class="label-stack-outer"><div class="label-stack"><div class="label-top lims-label-line">${escapeHtml(p.top)}</div><div class="label-bottom lims-label-line">${escapeHtml(p.bottom)}</div></div></div></div></div>`,
    )
    .join("");

  const bodyClass = multi ? "lims-multi" : "";

  return `<!DOCTYPE html><html lang="en" class="${multi ? "lims-multi-doc" : ""}"><head><meta charset="utf-8"/><title>&#8203;</title>
<style>
  @page { size: 1in 1in; margin: 0; }
  @page limsZebraLabel { size: 1in 1in; margin: 0; }
  html {
    margin: 0;
    padding: 0;
    width: 1in;
    max-width: 1in;
    box-sizing: border-box;
    background: #fff;
    color: #000;
  }
  html:not(.lims-multi-doc) {
    height: 1in;
    max-height: 1in;
    overflow: hidden;
  }
  html.lims-multi-doc {
    height: auto;
    max-width: 1in;
  }
  body {
    margin: 0;
    padding: 0;
    width: 1in;
    max-width: 1in;
    box-sizing: border-box;
    background: #fff;
    color: #000;
    display: block;
  }
  body:not(.lims-multi) {
    height: 1in;
    max-height: 1in;
    overflow: hidden;
  }
  body.lims-multi {
    height: auto;
    min-height: 0;
    overflow: visible;
  }
  .sheet {
    page: limsZebraLabel;
    position: relative;
    width: 1in;
    height: 1in;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
    background: #fff;
  }
  .label-anchor {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    box-sizing: border-box;
    padding: 0 0.35mm 0 1.25mm;
    margin: 0;
    text-align: right;
  }
  .label-stack-outer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    margin: 0;
    padding: 0;
  }
  .label-stack {
    margin: 0;
    padding: 0;
    width: max-content;
    min-width: 0;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0;
  }
  .sheet:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  .lims-label-line {
    display: block;
  }
  .label-top {
    margin: 0;
    margin-top: 0;
    padding: 0;
    padding-top: 0;
    text-align: right;
    word-break: break-word;
    max-width: 100%;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 600;
    line-height: 1.15;
    font-size: 7.25pt;
    color: #000;
    overflow: visible;
    flex-shrink: 0;
  }
  .label-bottom {
    margin: 0;
    margin-top: 0;
    padding: 0;
    padding-top: 0;
    text-align: right;
    white-space: nowrap;
    overflow: visible;
    word-break: normal;
    max-width: 100%;
    font-family: ui-monospace, Consolas, "Liberation Mono", Menlo, monospace;
    font-weight: 700;
    line-height: 1.1;
    font-size: 8pt;
    flex-shrink: 0;
    letter-spacing: -0.04em;
    color: #000;
  }
</style></head><body class="${bodyClass}">${body}</body></html>`;
}

export type PrintThermalLabelOptions =
  | { mode: "sample"; clientSampleId: string | null; sampleReference: string }
  | {
      mode: "slides";
      pages: { clientSampleId: string | null; slideReference: string }[];
    };

function labelTopLine(clientSampleId: string | null): string {
  const t = clientSampleId?.trim();
  return t && t.length > 0 ? t : "—";
}

/** One 1\"×1\" label: top = client sample ID, bottom = LIMS sample or slide ID. */
export function buildLimsLabelPages(
  options: PrintThermalLabelOptions,
): { top: string; bottom: string }[] {
  if (options.mode === "sample") {
    return [
      {
        top: labelTopLine(options.clientSampleId),
        bottom: options.sampleReference,
      },
    ];
  }
  return options.pages.map((p) => ({
    top: labelTopLine(p.clientSampleId),
    bottom: p.slideReference,
  }));
}

export function printThermalLabel(options: PrintThermalLabelOptions): void {
  const pages = buildLimsLabelPages(options);
  if (pages.length === 0) return;

  const html = buildLimsLabelHtml(pages);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "");
  iframe.style.cssText =
    "position:fixed;left:0;top:0;width:0;height:0;border:0;margin:0;padding:0;opacity:0;pointer-events:none";

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    return;
  }

  const cleanup = () => {
    doc.getElementById("lims-iframe-print-page-zero")?.remove();
    iframe.remove();
  };

  const runPrint = () => {
    const marginStyleId = "lims-iframe-print-page-zero";
    if (!doc.getElementById(marginStyleId)) {
      const s = doc.createElement("style");
      s.id = marginStyleId;
      s.textContent = `@media print {
        @page { margin: 0 !important; size: 1in 1in !important; }
        @page limsZebraLabel { margin: 0 !important; size: 1in 1in !important; }
        html, body { margin: 0 !important; padding: 0 !important; }
        html:not(.lims-multi-doc),
        body:not(.lims-multi) {
          height: 1in !important;
          max-height: 1in !important;
          overflow: hidden !important;
        }
        html.lims-multi-doc,
        body.lims-multi {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        .sheet { margin: 0 !important; padding: 0 !important; }
        .label-anchor { top: 0 !important; padding-top: 0 !important; margin-top: 0 !important; }
      }`;
      doc.head.appendChild(s);
    }
    win.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 60_000);
    win.focus();
    win.print();
  };

  /* Let layout / fonts settle (WebKit + Chrome Save PDF). */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.setTimeout(runPrint, 200);
    });
  });
}
