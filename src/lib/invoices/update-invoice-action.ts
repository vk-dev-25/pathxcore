"use server";

import { revalidatePath } from "next/cache";

import { roundMoney } from "@/lib/quote-pricing";
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

    const subtotal = roundMoney(
      input.lines.reduce(
        (sum, line) => sum + roundMoney(line.quantity * line.unit_price),
        0,
      ),
    );

    const { error: hErr } = await supabase
      .from("invoices")
      .update({
        client_org_name: input.header.client_org_name.trim() || null,
        client_address: input.header.client_address.trim() || null,
        contact_name: input.header.contact_name.trim() || null,
        project_title: input.header.project_title.trim() || null,
        status: input.header.status,
        due_date: input.header.due_date || null,
        subtotal_amount: subtotal,
        total_amount: subtotal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.invoiceId);
    if (hErr) {
      console.error(hErr);
      return { ok: false, error: "Could not update invoice." };
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
