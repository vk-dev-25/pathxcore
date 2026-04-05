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

/** Full-page quote / invoice / project print (not thermal labels). */
export function printWithDataQuoteIsolation(): void {
  const host = attachDataQuotePrintHost();
  const cleanup = () => {
    detachDataQuotePrintHost(host);
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 4_000);
}
