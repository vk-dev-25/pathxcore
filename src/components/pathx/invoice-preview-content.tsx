"use client";

import { useCallback, useEffect, useRef } from "react";
import { Printer } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import type { InvoicePreviewData } from "@/lib/invoices/invoice-preview";

export function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function formatLongDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function formatDue(isoDate: string) {
  if (!isoDate?.trim()) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
      new Date(`${isoDate}T12:00:00`),
    );
  } catch {
    return isoDate;
  }
}

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function InvoicePreviewContent({ data }: { data: InvoicePreviewData }) {
  const issuedLabel = formatLongDate(data.created_at);
  const dueLabel = formatDue(data.due_date);
  const year = new Date(data.created_at).getFullYear();
  const preparedLine = [data.contact_name, data.project_title]
    .filter(Boolean)
    .join(" · ");

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
    <div className="quote-print-body space-y-6 text-sm text-foreground print:text-black">
      <div className="border-b border-white/[0.06] pb-3 text-center print:border-neutral-300">
        <p className="text-2xl font-semibold tracking-tight text-foreground print:text-black">
          INVOICE
        </p>
      </div>

      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-5 print:border-neutral-300">
        <div>
          <p className="text-2xl font-semibold tracking-tight print:text-black">
            Pathology X Diagnostics
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground print:text-neutral-700">
            200 Valley Drive, Suite 29{"\n"}
            Brisbane, CA 94005{"\n"}
            Mobile: 650-703-0577{"\n"}
            www.pathxdx.com
          </p>
        </div>
        <Image
          src="/images/pathxlogo.jpeg"
          alt="Pathology X Diagnostics logo"
          width={258}
          height={236}
          priority
          className="mt-8 h-14 w-auto shrink-0 object-contain"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_320px] sm:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground print:text-neutral-600">
            Bill to
          </p>
          <p className="mt-2 text-base font-semibold leading-snug print:text-black">
            {data.client_org_name || "—"}
          </p>
          {preparedLine ? (
            <p className="mt-1 text-sm text-muted-foreground print:text-neutral-700">
              {preparedLine}
            </p>
          ) : null}
          {data.client_address.trim() ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground print:text-neutral-700">
              {data.client_address}
            </p>
          ) : null}
        </div>
        <dl className="grid gap-y-1.5 text-sm sm:grid-cols-[130px_1fr] sm:gap-x-3">
          <dt className="text-muted-foreground print:text-neutral-600">
            Invoice reference
          </dt>
          <dd className="font-medium tabular-nums print:text-black">
            {data.invoice_reference || "—"}
          </dd>
          <dt className="text-muted-foreground print:text-neutral-600">Status</dt>
          <dd className="capitalize print:text-black">{statusLabel(data.status)}</dd>
          <dt className="text-muted-foreground print:text-neutral-600">
            Date issued
          </dt>
          <dd className="print:text-black">{issuedLabel}</dd>
          <dt className="text-muted-foreground print:text-neutral-600">Due date</dt>
          <dd className="print:text-black">{dueLabel}</dd>
        </dl>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground print:text-neutral-600">
          Line items
        </p>
        <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.06] print:border-neutral-300">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03] text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground print:border-neutral-300 print:bg-neutral-100 print:text-neutral-700">
                <th className="px-3 py-2.5">Description</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5 text-right">Unit price</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    No line items.
                  </td>
                </tr>
              ) : (
                data.lines.map((l, i) => (
                  <tr
                    key={`${l.label}-${i}`}
                    className="border-b border-white/[0.05] last:border-0 print:border-neutral-200"
                  >
                    <td className="px-3 py-2.5 align-top font-medium print:text-black">
                      {l.label}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums align-top print:text-black">
                      {l.quantity}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums align-top text-muted-foreground print:text-neutral-700">
                      {money(l.unit_price)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums align-top print:text-black">
                      {money(l.line_total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between gap-4 border-t border-white/[0.06] pt-3 text-base font-semibold print:border-neutral-300 print:text-black">
        <span>Total (USD)</span>
        <span className="tabular-nums">{money(data.total_amount)}</span>
      </div>

      <div className="space-y-2 border-t border-white/[0.06] pt-4 text-sm print:border-neutral-300">
        <p className="flex justify-between gap-4 font-semibold print:text-black">
          <span>Balance Due:</span>
          <span className="tabular-nums">{money(data.total_amount)}</span>
        </p>
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground print:text-neutral-700">
          Wire Payment: Pathology X Diagnostic Services, Inc.{"\n"}
          Chase Bank: 1699 Van Ness Ave (at Sacramento St),{"\n"}
          San Francisco, CA 94109{"\n"}
          Branch#: 494431{"\n"}
          Acct#: 2908309506 Wire Routing: 322271627
        </p>
      </div>

      <p className="border-t border-white/[0.06] pt-4 text-center text-xs text-muted-foreground print:border-neutral-300 print:text-neutral-600">
        {data.invoice_reference || "—"} · Pathology X Diagnostics · {year}
      </p>

      <div className="flex flex-col gap-2 print:hidden">
        <Button
          type="button"
          variant="outline"
          className="w-full"
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
  );
}
