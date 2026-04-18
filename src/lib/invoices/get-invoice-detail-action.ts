"use server";

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
  status: InvoiceStatus;
  due_date: string;
  subtotal_amount: number;
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
      "id, source_quote_id, client_org_name, client_address, contact_name, project_title, invoice_reference, status, due_date, subtotal_amount, total_amount, created_at, updated_at, last_updated_by_email",
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
      status,
      due_date: invoice.due_date ?? "",
      subtotal_amount: Number(invoice.subtotal_amount),
      total_amount: Number(invoice.total_amount),
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
