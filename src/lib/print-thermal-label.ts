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
  const body = pages
    .map(
      (p) =>
        `<div class="sheet"><p class="label-top">${escapeHtml(p.top)}</p><p class="label-bottom">${escapeHtml(p.bottom)}</p></div>`,
    )
    .join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>&#8203;</title>
<style>
  @page { size: 1in 1in; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  .sheet {
    width: 1in;
    height: 1in;
    box-sizing: border-box;
    padding: 0.5mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3mm;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
  }
  .sheet:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  .label-top {
    margin: 0;
    padding: 0;
    text-align: center;
    word-break: break-word;
    max-width: 100%;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 600;
    line-height: 1.08;
    font-size: 4.5pt;
    color: #000;
  }
  .label-bottom {
    margin: 0;
    padding: 0;
    text-align: center;
    word-break: break-word;
    max-width: 100%;
    font-family: ui-monospace, Consolas, "Liberation Mono", Menlo, monospace;
    font-weight: 700;
    line-height: 1.08;
    font-size: 5.25pt;
    color: #000;
  }
</style></head><body>${body}</body></html>`;
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

export function printThermalLabel(options: PrintThermalLabelOptions): void {
  let pages: { top: string; bottom: string }[];
  if (options.mode === "sample") {
    pages = [
      {
        top: labelTopLine(options.clientSampleId),
        bottom: options.sampleReference,
      },
    ];
  } else {
    pages = options.pages.map((p) => ({
      top: labelTopLine(p.clientSampleId),
      bottom: p.slideReference,
    }));
  }
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
    iframe.remove();
  };

  const runPrint = () => {
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
