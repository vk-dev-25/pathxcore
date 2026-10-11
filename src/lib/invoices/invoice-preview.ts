import type { InvoiceDetailPayload } from "@/lib/invoices/get-invoice-detail-action";
import type { InvoiceStatus } from "@/lib/invoices/types";
import {
  computeQuoteTotals,
  isValidSegment,
  type PricingSettingsSnapshot,
  type Segment,
} from "@/lib/quote-pricing";

export type InvoicePreviewTotals = {
  subtotal_amount: number;
  segment_adjustment_amount: number;
  after_segment_amount: number;
  volume_discount_percent: number;
  volume_discount_amount: number;
  after_volume_amount: number;
  rush_uplift_amount: number;
  total_amount: number;
};

export type InvoicePreviewData = {
  invoice_reference: string;
  po_reference: string;
  status: InvoiceStatus;
  due_date: string;
  created_at: string;
  client_org_name: string;
  client_address: string;
  contact_name: string;
  project_title: string;
  notes: string;
  lines: {
    label: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  totals: InvoicePreviewTotals;
  total_amount: number;
};

export function invoiceDetailToPreview(d: InvoiceDetailPayload): InvoicePreviewData {
  const totals: InvoicePreviewTotals = {
    subtotal_amount: d.subtotal_amount,
    segment_adjustment_amount: d.segment_adjustment_amount,
    after_segment_amount: d.after_segment_amount,
    volume_discount_percent: d.volume_discount_percent,
    volume_discount_amount: d.volume_discount_amount,
    after_volume_amount: d.after_volume_amount,
    rush_uplift_amount: d.rush_uplift_amount,
    total_amount: d.total_amount,
  };
  return {
    invoice_reference: d.invoice_reference || "—",
    po_reference: d.po_reference ?? "",
    status: d.status,
    due_date: d.due_date,
    created_at: d.created_at,
    client_org_name: d.client_org_name,
    client_address: d.client_address,
    contact_name: d.contact_name,
    project_title: d.project_title,
    notes: d.notes ?? "",
    lines: d.lines.map((l) => ({
      label: l.label,
      quantity: l.quantity,
      unit_price: l.unit_price,
      line_total: l.line_total,
    })),
    totals,
    total_amount: d.total_amount,
  };
}

export function invoiceDraftToPreview(args: {
  invoiceRef: string;
  poReference: string;
  status: InvoiceStatus;
  dueDate: string;
  createdAtIso: string;
  clientOrg: string;
  clientAddress: string;
  contactName: string;
  projectTitle: string;
  notes: string;
  lines: { label: string; quantity: number; unit_price: number }[];
  segment: string;
  sampleVolume: number;
  rushPriority: boolean;
  rush2day: boolean;
  applyVolumeDiscount: boolean;
  pricingSettings: PricingSettingsSnapshot;
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
  const segment: Segment = isValidSegment(args.segment)
    ? args.segment
    : "small_biopharma";
  const totals = computeQuoteTotals(
    lines.map((l) => ({
      catalog_service_id: null,
      label: l.label,
      quantity: l.quantity,
      unit_price: l.unit_price,
      default_unit_price_snapshot: l.unit_price,
      is_price_overridden: false,
    })),
    segment,
    args.sampleVolume,
    args.rushPriority,
    args.rush2day,
    args.pricingSettings,
    { applyVolumeDiscount: args.applyVolumeDiscount },
  );
  return {
    invoice_reference: args.invoiceRef || "—",
    po_reference: args.poReference ?? "",
    status: args.status,
    due_date: args.dueDate,
    created_at: args.createdAtIso,
    client_org_name: args.clientOrg,
    client_address: args.clientAddress,
    contact_name: args.contactName,
    project_title: args.projectTitle,
    notes: args.notes ?? "",
    lines,
    totals,
    total_amount: totals.total_amount,
  };
}
