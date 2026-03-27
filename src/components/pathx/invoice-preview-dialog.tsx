"use client";

import { InvoicePreviewContent } from "@/components/pathx/invoice-preview-content";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { InvoicePreviewData } from "@/lib/invoices/invoice-preview";

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: InvoicePreviewData | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quote-print="true"
        className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/[0.12] bg-card print:left-0 print:top-0 print:w-auto print:max-w-none print:translate-x-0 print:translate-y-0 print:max-h-none print:overflow-visible print:border-0 print:bg-white print:shadow-none print:rounded-none print:p-0"
      >
        <DialogTitle className="sr-only">Invoice preview</DialogTitle>
        {data ? <InvoicePreviewContent data={data} /> : null}
      </DialogContent>
    </Dialog>
  );
}
