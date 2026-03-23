"use client";

import type { ReactNode } from "react";

import type { PricingSettingsSnapshot } from "@/lib/quote-pricing";
import {
  QuotePreviewContent,
  type QuotePreviewLine,
} from "@/components/pathx/quote-preview-content";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QuotePreviewDialog({
  trigger,
  clientOrg,
  clientAddress,
  contactName,
  projectTitle,
  quoteRef,
  segmentLabel,
  sampleVolume,
  rushPriority,
  rush2day,
  notes,
  lines,
  totals,
  pricingSettings,
}: {
  trigger: ReactNode;
  clientOrg: string;
  clientAddress: string;
  contactName: string;
  projectTitle: string;
  quoteRef: string;
  segmentLabel: string;
  sampleVolume: number;
  rushPriority: boolean;
  rush2day: boolean;
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
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        data-quote-print="true"
        className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/[0.12] bg-card print:max-h-none print:overflow-visible print:border-0 print:bg-white print:shadow-none"
      >
        <DialogTitle className="sr-only">Quote</DialogTitle>
        <QuotePreviewContent
          clientOrg={clientOrg}
          clientAddress={clientAddress}
          contactName={contactName}
          projectTitle={projectTitle}
          quoteRef={quoteRef}
          segmentLabel={segmentLabel}
          sampleVolume={sampleVolume}
          rushPriority={rushPriority}
          rush2day={rush2day}
          notes={notes}
          lines={lines}
          totals={totals}
          pricingSettings={pricingSettings}
        />
      </DialogContent>
    </Dialog>
  );
}
