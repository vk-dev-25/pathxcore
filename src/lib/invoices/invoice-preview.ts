import type { InvoiceDetailPayload } from "@/lib/invoices/get-invoice-detail-action";
import type { InvoiceStatus } from "@/lib/invoices/types";

export type InvoicePreviewData = {
  invoice_reference: string;
  status: InvoiceStatus;
  due_date: string;
  created_at: string;
  client_org_name: string;
  client_address: string;
  contact_name: string;
  project_title: string;
  lines: {
    label: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  total_amount: number;
};

export function invoiceDetailToPreview(d: InvoiceDetailPayload): InvoicePreviewData {
  return {
    invoice_reference: d.invoice_reference || "—",
    status: d.status,
    due_date: d.due_date,
    created_at: d.created_at,
    client_org_name: d.client_org_name,
    client_address: d.client_address,
    contact_name: d.contact_name,
    project_title: d.project_title,
    lines: d.lines.map((l) => ({
      label: l.label,
      quantity: l.quantity,
      unit_price: l.unit_price,
      line_total: l.line_total,
    })),
    total_amount: d.total_amount,
  };
}

export function invoiceDraftToPreview(args: {
  invoiceRef: string;
  status: InvoiceStatus;
  dueDate: string;
  createdAtIso: string;
  clientOrg: string;
  clientAddress: string;
  contactName: string;
  projectTitle: string;
  lines: { label: string; quantity: number; unit_price: number }[];
}): InvoicePreviewData {
  const lines = args.lines.map((l) => {
    const line_total = l.quantity * l.unit_price;
    return {
      label: l.label,
      quantity: l.quantity,
      unit_price: l.unit_price,
      line_total,
    };
  });
  const total_amount = lines.reduce((s, l) => s + l.line_total, 0);
  return {
    invoice_reference: args.invoiceRef || "—",
    status: args.status,
    due_date: args.dueDate,
    created_at: args.createdAtIso,
    client_org_name: args.clientOrg,
    client_address: args.clientAddress,
    contact_name: args.contactName,
    project_title: args.projectTitle,
    lines,
    total_amount,
  };
}
