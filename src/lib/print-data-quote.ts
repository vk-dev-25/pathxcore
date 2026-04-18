/** Set on <html> immediately before window.print() when isolating [data-quote-print] */
export const PRINT_DATA_QUOTE_ATTR = "data-print-data-quote";

/** Set on the direct child of <body> that wraps the print portal */
export const PRINT_QUOTE_HOST_ATTR = "data-print-quote-host";

/**
 * Find the body-level wrapper that contains [data-quote-print] and mark it for @media print.
 * Pure-CSS :has() is unreliable for some Vercel/prod print-to-PDF paths; this always works.
 */
export function attachDataQuotePrintHost(): HTMLElement | null {
  const root = document.querySelector<HTMLElement>('[data-quote-print="true"]');
  if (!root) return null;
  let n: HTMLElement | null = root;
  while (n.parentElement !== document.body) {
    if (!n.parentElement) return null;
    n = n.parentElement;
  }
  n.setAttribute(PRINT_QUOTE_HOST_ATTR, "1");
  document.documentElement.setAttribute(PRINT_DATA_QUOTE_ATTR, "1");
  return n;
}

export function detachDataQuotePrintHost(host: HTMLElement | null): void {
  document.documentElement.removeAttribute(PRINT_DATA_QUOTE_ATTR);
  host?.removeAttribute(PRINT_QUOTE_HOST_ATTR);
}

/**
 * Characters Chrome / OS may reject in save-as-PDF filenames; strip for document.title.
 * https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file
 */
function filenameSafeForPdfTitle(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[/\\?%*:|"<>#\r\n\t]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180) || "document";
}

type PrintIsolationOptions = {
  /** Chrome uses document.title as the default PDF name when saving from print. */
  pdfTitle?: string;
};

/** Full-page quote / invoice / project print (not thermal labels). */
export function printWithDataQuoteIsolation(options?: PrintIsolationOptions): void {
  const host = attachDataQuotePrintHost();
  const prevTitle = document.title;
  const nextTitle = options?.pdfTitle?.trim();
  if (nextTitle) {
    document.title = filenameSafeForPdfTitle(nextTitle);
  }
  const cleanup = () => {
    detachDataQuotePrintHost(host);
    if (nextTitle) document.title = prevTitle;
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 4_000);
}
