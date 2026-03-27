"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { QuotePreviewContent } from "@/components/pathx/quote-preview-content";
import { createInvoiceFromQuoteAction } from "@/lib/invoices/create-invoice-from-quote-action";
import {
  getQuoteForPreviewAction,
  type QuoteForPreviewData,
} from "@/lib/quotes/get-quote-detail-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function downloadJson(payload: Record<string, unknown>, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function QuoteSavedPreviewDialog({
  quoteId,
  open,
  onOpenChange,
}: {
  quoteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuoteForPreviewData | null>(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  useEffect(() => {
    if (!open || !quoteId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    getQuoteForPreviewAction(quoteId).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setData(res.data);
    });

    return () => {
      cancelled = true;
    };
  }, [open, quoteId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quote-print="true"
        className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/[0.12] bg-card print:left-0 print:top-0 print:w-auto print:max-w-none print:translate-x-0 print:translate-y-0 print:max-h-none print:overflow-visible print:border-0 print:bg-white print:shadow-none print:rounded-none print:p-0"
      >
        <DialogTitle className="sr-only">Quote</DialogTitle>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground print:hidden">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading quote…
          </div>
        ) : error ? (
          <p className="py-4 text-sm text-destructive print:hidden">{error}</p>
        ) : data ? (
          <>
            <QuotePreviewContent
              issueDateIso={data.issuedAtIso}
              clientOrg={data.clientOrg}
              clientAddress={data.clientAddress}
              contactName={data.contactName}
              projectTitle={data.projectTitle}
              quoteRef={data.quoteRef}
              segmentLabel={data.segmentLabel}
              sampleVolume={data.sampleVolume}
              rushPriority={data.rushPriority}
              rush2day={data.rush2day}
              notes={data.notes}
              lines={data.lines}
              totals={data.totals}
              pricingSettings={data.pricingSettings}
              footerExtra={
                <div className="space-y-2">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={!quoteId || creatingInvoice}
                    onClick={async () => {
                      if (!quoteId) return;
                      setCreatingInvoice(true);
                      const res = await createInvoiceFromQuoteAction(quoteId);
                      setCreatingInvoice(false);
                      if (!res.ok) {
                        setError(res.error);
                        return;
                      }
                      onOpenChange(false);
                      router.push(`/pathx/invoices/${res.invoiceId}`);
                    }}
                  >
                    {creatingInvoice ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating invoice…
                      </>
                    ) : (
                      "Create invoice"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const fromRef = (data.quoteRef || "")
                        .replace(/[^a-zA-Z0-9._-]+/g, "_")
                        .slice(0, 48);
                      const safe =
                        fromRef || (quoteId ?? "quote").replace(/-/g, "").slice(0, 8);
                      downloadJson(data.downloadJson, `quote-${safe}.json`);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                  </Button>
                </div>
              }
            />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
