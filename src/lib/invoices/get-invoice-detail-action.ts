"use server";

import { isValidSegment, type Segment } from "@/lib/quote-pricing";
import { createClient } from "@/lib/supabase/server";
import { isInvoiceStatus, type InvoiceStatus } from "@/lib/invoices/types";

export type InvoiceDetailLine = {
  id: string;
  catalog_service_id: string | null;
  label: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type InvoiceDetailPayload = {
  id: string;
  source_quote_id: string | null;
  source_quote_reference: string | null;
  client_org_name: string;
  client_address: string;
  contact_name: string;
  project_title: string;
  invoice_reference: string;
  po_reference: string;
  status: InvoiceStatus;
  due_date: string;
  notes: string;
  segment: Segment;
  sample_volume: number;
  rush_priority: boolean;
  rush_2day: boolean;
  apply_volume_discount: boolean;
  subtotal_amount: number;
  segment_adjustment_amount: number;
  after_segment_amount: number;
  volume_discount_percent: number;
  volume_discount_amount: number;
  after_volume_amount: number;
  rush_uplift_amount: number;
  total_amount: number;
  created_at: string;
  /** Row `updated_at` — last header/lines save. */
  updated_at: string;
  last_updated_by_email: string | null;
  lines: InvoiceDetailLine[];
};

export async function getInvoiceDetailAction(
  invoiceId: string,
): Promise<{ ok: true; data: InvoiceDetailPayload } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: invoice, error: iErr } = await supabase
    .from("invoices")
    .select(
      "id, source_quote_id, client_org_name, client_address, contact_name, project_title, invoice_reference, po_reference, notes, status, due_date, segment, sample_volume, rush_priority, rush_2day, apply_volume_discount, subtotal_amount, segment_adjustment_amount, after_segment_amount, volume_discount_amount, after_volume_amount, rush_uplift_amount, total_amount, created_at, updated_at, last_updated_by_email",
    )
    .eq("id", invoiceId)
    .maybeSingle();
  if (iErr || !invoice) return { ok: false, error: "Invoice not found." };

  const { data: lines, error: lErr } = await supabase
    .from("invoice_line_items")
    .select("id, catalog_service_id, label, quantity, unit_price, line_total")
    .eq("invoice_id", invoiceId)
    .order("sort_order", { ascending: true });
  if (lErr) return { ok: false, error: "Could not load invoice lines." };

  let sourceQuoteReference: string | null = null;
  if (invoice.source_quote_id) {
    const { data: sourceQuote } = await supabase
      .from("quotes")
      .select("quote_reference")
      .eq("id", invoice.source_quote_id)
      .maybeSingle();
    sourceQuoteReference = sourceQuote?.quote_reference ?? null;
  }

  const status = isInvoiceStatus(invoice.status) ? invoice.status : "created";
  const segment: Segment = isValidSegment(String(invoice.segment ?? ""))
    ? (invoice.segment as Segment)
    : "small_biopharma";
  const afterSeg = Number(invoice.after_segment_amount) || 0;
  const volDisc = Number(invoice.volume_discount_amount) || 0;
  const volume_discount_percent =
    afterSeg > 0 ? Math.round((volDisc / afterSeg) * 10000) / 100 : 0;

  return {
    ok: true,
    data: {
      id: invoice.id,
      source_quote_id: invoice.source_quote_id,
      source_quote_reference: sourceQuoteReference,
      client_org_name: invoice.client_org_name ?? "",
      client_address: invoice.client_address ?? "",
      contact_name: invoice.contact_name ?? "",
      project_title: invoice.project_title ?? "",
      invoice_reference: invoice.invoice_reference ?? "",
      po_reference: invoice.po_reference ?? "",
      status,
      due_date: invoice.due_date ?? "",
      notes: invoice.notes ?? "",
      segment,
      sample_volume: Math.max(0, Math.floor(Number(invoice.sample_volume) || 0)),
      rush_priority: Boolean(invoice.rush_priority),
      rush_2day: Boolean(invoice.rush_2day),
      apply_volume_discount: invoice.apply_volume_discount !== false,
      subtotal_amount: Number(invoice.subtotal_amount) || 0,
      segment_adjustment_amount: Number(invoice.segment_adjustment_amount) || 0,
      after_segment_amount: afterSeg,
      volume_discount_percent,
      volume_discount_amount: volDisc,
      after_volume_amount: Number(invoice.after_volume_amount) || 0,
      rush_uplift_amount: Number(invoice.rush_uplift_amount) || 0,
      total_amount: Number(invoice.total_amount) || 0,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
      last_updated_by_email: invoice.last_updated_by_email ?? null,
      lines: (lines ?? []).map((line) => ({
        id: line.id,
        catalog_service_id: line.catalog_service_id,
        label: line.label,
        quantity: Number(line.quantity),
        unit_price: Number(line.unit_price),
        line_total: Number(line.line_total),
      })),
    },
  };
}
