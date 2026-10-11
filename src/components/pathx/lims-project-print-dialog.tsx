"use client";

import { LimsProjectPrintContent } from "@/components/pathx/lims-project-print-content";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { LimsProjectDetailPayload } from "@/lib/lims/get-lims-project-detail-action";

export function LimsProjectPrintDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: LimsProjectDetailPayload;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-quote-print="true"
        className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/[0.12] bg-card print:left-0 print:top-0 print:w-auto print:max-w-none print:translate-x-0 print:translate-y-0 print:max-h-none print:overflow-visible print:border-0 print:bg-white print:shadow-none print:rounded-none print:p-0"
      >
        <DialogTitle className="sr-only">
          Print project {data.project_reference}
        </DialogTitle>
        <LimsProjectPrintContent data={data} />
      </DialogContent>
    </Dialog>
  );
}
