"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
import Image from "next/image";

import type { PricingSettingsSnapshot } from "@/lib/quote-pricing";
import { Button } from "@/components/ui/button";

export function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export type QuotePreviewLine = {
  label: string;
  quantity: number;
  unit_price: number;
  lineTotal: number;
  is_price_overridden: boolean;
};

function formatLongDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function validUntilIso(issueIso: string, validityDays: number) {
  const d = new Date(issueIso);
  d.setDate(d.getDate() + validityDays);
  return d.toISOString();
}

function nearZero(n: number) {
  return Math.abs(n) < 0.005;
}

export function QuotePreviewContent({
  issueDateIso,
  clientOrg,
  clientAddress,
  contactName,
  projectTitle,
  quoteRef,
  sampleVolume,
  notes,
  lines,
  totals,
  pricingSettings,
  footerExtra,
}: {
  /** Saved quotes pass DB `created_at`; builder omits to use a stable draft issue time. */
  issueDateIso?: string;
  clientOrg: string;
  clientAddress: string;
  contactName: string;
  projectTitle: string;
  quoteRef: string;
  /** Total sample / block count (for client-facing preview). */
  sampleVolume: number;
  notes: string;
  lines: QuotePreviewLine[];
  totals: {
    subtotal_amount: number;
    segment_adjustment_amount: number;
    after_segment_amount: number;
    volume_discount_percent: number;
    volume_discount_amount: number;
    after_volume_amount: number;
    rush_uplift_amount: number;
    total_amount: number;
  } | null;
  pricingSettings: PricingSettingsSnapshot;
  footerExtra?: ReactNode;
}) {
  const [draftIssueIso] = useState(() => new Date().toISOString());
  const issueIso = issueDateIso ?? draftIssueIso;
  const issuedLabel = formatLongDate(issueIso);
  const validLabel = formatLongDate(
    validUntilIso(issueIso, pricingSettings.quote_validity_days),
  );
  const year = new Date(issueIso).getFullYear();
  const preparedLine = [contactName, projectTitle].filter(Boolean).join(" · ");
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

    const quoteRoot = document.querySelector<HTMLElement>('[data-quote-print="true"]');
    if (!quoteRoot) return () => {};

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
      if (child.contains(quoteRoot) || child === quoteRoot) {
        child.style.setProperty("display", "block", "important");
        child.style.setProperty("visibility", "visible", "important");
        forceWhite(child);
      } else {
        child.style.setProperty("display", "none", "important");
      }
    });

    remember(quoteRoot);
    quoteRoot.style.setProperty("position", "static", "important");
    quoteRoot.style.setProperty("left", "auto", "important");
    quoteRoot.style.setProperty("top", "auto", "important");
    quoteRoot.style.setProperty("width", "auto", "important");
    quoteRoot.style.setProperty("max-width", "none", "important");
    quoteRoot.style.setProperty("height", "auto", "important");
    quoteRoot.style.setProperty("max-height", "none", "important");
    quoteRoot.style.setProperty("overflow", "visible", "important");
    quoteRoot.style.setProperty("border", "0", "important");
    quoteRoot.style.setProperty("box-shadow", "none", "important");
    forceWhite(quoteRoot);

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
      <div className="flex items-end justify-between gap-4 border-b border-white/[0.06] pb-5 print:border-neutral-300">
        <div>
          <p className="text-2xl font-semibold tracking-tight print:text-black">
            Pathology X Diagnostics
          </p>
        </div>
        <Image
          src="/images/pathxlogo.jpeg"
          alt="Pathology X Diagnostics logo"
          width={258}
          height={236}
          priority
          className="h-14 w-auto shrink-0 object-contain"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_320px] sm:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground print:text-neutral-600">
            Prepared for
          </p>
          <p className="mt-2 text-base font-semibold leading-snug print:text-black">
            {clientOrg || "—"}
          </p>
          {preparedLine ? (
            <p className="mt-1 text-sm text-muted-foreground print:text-neutral-700">
              {preparedLine}
            </p>
          ) : null}
          {clientAddress.trim() ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground print:text-neutral-700">
              {clientAddress}
            </p>
          ) : null}
        </div>
        <dl className="grid gap-y-1.5 text-sm sm:grid-cols-[130px_1fr] sm:gap-x-3">
          <dt className="text-muted-foreground print:text-neutral-600">
            Quote reference
          </dt>
          <dd className="font-medium tabular-nums print:text-black">
            {quoteRef || "—"}
          </dd>
          <dt className="text-muted-foreground print:text-neutral-600">
            Date issued
          </dt>
          <dd className="print:text-black">{issuedLabel}</dd>
          <dt className="text-muted-foreground print:text-neutral-600">
            Valid until
          </dt>
          <dd className="print:text-black">{validLabel}</dd>
          <dt className="text-muted-foreground print:text-neutral-600">
            Total samples / blocks
          </dt>
          <dd className="font-medium tabular-nums print:text-black">
            {Math.max(0, Math.floor(sampleVolume))}
          </dd>
        </dl>
      </div>

      {notes.trim() ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground print:text-black">
          {notes.trim()}
        </p>
      ) : null}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground print:text-neutral-600">
          Services
        </p>
        <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.06] print:border-neutral-300">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03] text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground print:border-neutral-300 print:bg-neutral-100 print:text-neutral-700">
                <th className="px-3 py-2.5">Service</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    No line items.
                  </td>
                </tr>
              ) : (
                lines.map((l, i) => (
                  <tr
                    key={`${l.label}-${i}`}
                    className="border-b border-white/[0.05] last:border-0 print:border-neutral-200"
                  >
                    <td className="px-3 py-2.5 align-top font-medium print:text-black">
                      {l.label}
                      {l.is_price_overridden ? (
                        <span className="ml-1 text-xs font-normal text-muted-foreground print:text-neutral-600">
                          (override)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground print:text-neutral-700">
                      {money(l.unit_price)} / unit
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums align-top">
                      {l.quantity}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums align-top print:text-black">
                      {money(l.lineTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totals ? (
        <div className="space-y-2 border-t border-white/[0.06] pt-4 text-sm tabular-nums print:border-neutral-300">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground print:text-neutral-700">
              Subtotal
            </span>
            <span className="print:text-black">{money(totals.subtotal_amount)}</span>
          </div>
          {!nearZero(totals.segment_adjustment_amount) ? (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground print:text-neutral-700">
                Price adjustment
              </span>
              <span className="print:text-black">
                {money(totals.segment_adjustment_amount)}
              </span>
            </div>
          ) : null}
          {!nearZero(totals.volume_discount_amount) ? (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground print:text-neutral-700">
                Volume discount ({totals.volume_discount_percent}%)
              </span>
              <span className="print:text-black">
                −{money(totals.volume_discount_amount)}
              </span>
            </div>
          ) : null}
          {!nearZero(totals.rush_uplift_amount) ? (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground print:text-neutral-700">
                Rush uplift
              </span>
              <span className="print:text-black">
                {money(totals.rush_uplift_amount)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-t border-white/[0.06] pt-3 text-base font-semibold print:border-neutral-300 print:text-black">
            <span>Total (USD)</span>
            <span>{money(totals.total_amount)}</span>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Add services to see totals.</p>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground print:text-neutral-700">
        Prices are valid for {pricingSettings.quote_validity_days} days from the
        date of issue. Final pricing may vary based on sample quality and
        complexity. Pathology X Diagnostics reserves the right to adjust pricing upon project
        review.
      </p>

      {pricingSettings.lab_address.trim() ? (
        <div className="text-xs text-muted-foreground print:text-neutral-700">
          <p className="font-semibold text-foreground print:text-black">Lab</p>
          <p className="mt-1 whitespace-pre-wrap">{pricingSettings.lab_address}</p>
        </div>
      ) : null}

      <p className="border-t border-white/[0.06] pt-4 text-center text-xs text-muted-foreground print:border-neutral-300 print:text-neutral-600">
        {quoteRef || "—"} · Pathology X Diagnostics · {year}
      </p>

      <div className="flex flex-col gap-2 print:hidden">
        {footerExtra}
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
