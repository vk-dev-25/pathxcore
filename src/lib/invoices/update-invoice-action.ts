"use server";

import { revalidatePath } from "next/cache";

import {
  computeQuoteTotals,
  isValidSegment,
  roundMoney,
  type Segment,
} from "@/lib/quote-pricing";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { createClient } from "@/lib/supabase/server";
import {
  isInvoiceStatus,
  type InvoiceHeaderInput,
  type InvoiceLineInput,
} from "@/lib/invoices/types";

export type UpdateInvoiceResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateInvoiceAction(input: {
  invoiceId: string;
  header: InvoiceHeaderInput;
  lines: InvoiceLineInput[];
}): Promise<UpdateInvoiceResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    if (!isInvoiceStatus(input.header.status)) {
      return { ok: false, error: "Invalid invoice status." };
    }
    if (!isValidSegment(input.header.segment)) {
      return { ok: false, error: "Invalid client segment." };
    }
    if (!input.lines.length) {
      return { ok: false, error: "Invoice needs at least one line item." };
    }
    for (const line of input.lines) {
      if (!line.label.trim() || line.quantity <= 0 || line.unit_price < 0) {
        return {
          ok: false,
          error: "Each line needs a label, positive quantity, and valid price.",
        };
      }
    }

    const segment = input.header.segment as Segment;
    const sampleVolume = Math.max(0, Math.floor(Number(input.header.sample_volume) || 0));
    const pricingSettings = await loadPricingSettings();
    const totals = computeQuoteTotals(
      input.lines.map((line) => ({
        catalog_service_id: line.catalog_service_id,
        label: line.label.trim(),
        quantity: line.quantity,
        unit_price: line.unit_price,
        default_unit_price_snapshot: line.unit_price,
        is_price_overridden: false,
      })),
      segment,
      sampleVolume,
      Boolean(input.header.rush_priority),
      Boolean(input.header.rush_2day),
      pricingSettings,
      { applyVolumeDiscount: Boolean(input.header.apply_volume_discount) },
    );

    const { data: updatedHeader, error: hErr } = await supabase
      .from("invoices")
      .update({
        client_org_name: input.header.client_org_name.trim() || null,
        client_address: input.header.client_address.trim() || null,
        contact_name: input.header.contact_name.trim() || null,
        project_title: input.header.project_title.trim() || null,
        po_reference: input.header.po_reference.trim() || null,
        notes: input.header.notes.trim() || null,
        status: input.header.status,
        due_date: input.header.due_date || null,
        segment,
        sample_volume: sampleVolume,
        rush_priority: Boolean(input.header.rush_priority),
        rush_2day: Boolean(input.header.rush_2day),
        apply_volume_discount: Boolean(input.header.apply_volume_discount),
        subtotal_amount: totals.subtotal_amount,
        segment_adjustment_amount: totals.segment_adjustment_amount,
        after_segment_amount: totals.after_segment_amount,
        volume_discount_amount: totals.volume_discount_amount,
        after_volume_amount: totals.after_volume_amount,
        rush_uplift_amount: totals.rush_uplift_amount,
        total_amount: totals.total_amount,
        updated_at: new Date().toISOString(),
        last_updated_by: user.id,
        last_updated_by_email: user.email ?? null,
      })
      .eq("id", input.invoiceId)
      .select("id");
    if (hErr) {
      console.error(hErr);
      return { ok: false, error: "Could not update invoice." };
    }
    if (!updatedHeader?.length) {
      return {
        ok: false,
        error: "Invoice not found or you do not have permission to edit it.",
      };
    }

    const { error: delErr } = await supabase
      .from("invoice_line_items")
      .delete()
      .eq("invoice_id", input.invoiceId);
    if (delErr) {
      console.error(delErr);
      return { ok: false, error: "Could not update invoice line items." };
    }

    const rows = input.lines.map((line, idx) => ({
      invoice_id: input.invoiceId,
      catalog_service_id: line.catalog_service_id,
      label: line.label.trim(),
      quantity: line.quantity,
      unit_price: roundMoney(line.unit_price),
      line_total: roundMoney(line.quantity * line.unit_price),
      sort_order: idx,
    }));
    const { error: insErr } = await supabase.from("invoice_line_items").insert(rows);
    if (insErr) {
      console.error(insErr);
      return { ok: false, error: "Could not update invoice line items." };
    }

    revalidatePath("/pathx/invoices");
    revalidatePath(`/pathx/invoices/${input.invoiceId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update invoice." };
  }
}
