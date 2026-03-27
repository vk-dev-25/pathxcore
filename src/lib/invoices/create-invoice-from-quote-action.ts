"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { roundMoney } from "@/lib/quote-pricing";
import { createClient } from "@/lib/supabase/server";

export type CreateInvoiceFromQuoteResult =
  | { ok: true; invoiceId: string }
  | { ok: false; error: string };

function defaultDueDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

async function allocateInvoiceReference(supabase: SupabaseClient): Promise<string> {
  const prefix = "PTDX-INVC-";
  const { data } = await supabase
    .from("invoices")
    .select("invoice_reference")
    .like("invoice_reference", `${prefix}%`)
    .order("invoice_reference", { ascending: false })
    .limit(1)
    .maybeSingle();

  let next = 1;
  if (data?.invoice_reference?.startsWith(prefix)) {
    const tail = data.invoice_reference.slice(prefix.length);
    const n = parseInt(tail, 10);
    if (!Number.isNaN(n)) next = n + 1;
  }

  for (let bump = 0; bump < 100_000; bump++) {
    const ref = `${prefix}${String(next + bump).padStart(6, "0")}`;
    const { count } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("invoice_reference", ref);
    if (count === 0) return ref;
  }
  throw new Error("invoice_reference_exhausted");
}

export async function createInvoiceFromQuoteAction(
  quoteId: string,
): Promise<CreateInvoiceFromQuoteResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    const { data: quote, error: qErr } = await supabase
      .from("quotes")
      .select(
        "id, client_org_name, client_address, contact_name, project_title",
      )
      .eq("id", quoteId)
      .maybeSingle();
    if (qErr || !quote) {
      return { ok: false, error: "Quote not found." };
    }

    const { data: quoteLines, error: lErr } = await supabase
      .from("quote_line_items")
      .select("id, catalog_service_id, label, quantity, unit_price, sort_order")
      .eq("quote_id", quoteId)
      .order("sort_order", { ascending: true });
    if (lErr) {
      return { ok: false, error: "Could not load quote line items." };
    }
    if (!quoteLines?.length) {
      return { ok: false, error: "Quote has no line items." };
    }

    const subtotal = roundMoney(
      quoteLines.reduce(
        (sum, line) => sum + roundMoney(Number(line.quantity) * Number(line.unit_price)),
        0,
      ),
    );

    let createdId: string | null = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      const invoiceReference = await allocateInvoiceReference(supabase);
      const { data: created, error: iErr } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          source_quote_id: quote.id,
          client_org_name: quote.client_org_name,
          client_address: quote.client_address,
          contact_name: quote.contact_name,
          project_title: quote.project_title,
          invoice_reference: invoiceReference,
          status: "created" as const,
          due_date: defaultDueDateIso(),
          subtotal_amount: subtotal,
          total_amount: subtotal,
        })
        .select("id")
        .single();
      if (!iErr && created?.id) {
        createdId = created.id;
        break;
      }
      if (iErr?.code !== "23505") {
        console.error(iErr);
        return { ok: false, error: "Could not create invoice." };
      }
    }
    if (!createdId) {
      return { ok: false, error: "Could not allocate unique invoice number." };
    }

    const rows = quoteLines.map((line, idx) => {
      const qty = Number(line.quantity);
      const unit = Number(line.unit_price);
      return {
        invoice_id: createdId,
        catalog_service_id: line.catalog_service_id,
        source_quote_line_id: line.id,
        label: line.label,
        quantity: qty,
        unit_price: unit,
        line_total: roundMoney(qty * unit),
        sort_order: idx,
      };
    });
    const { error: ilErr } = await supabase.from("invoice_line_items").insert(rows);
    if (ilErr) {
      console.error(ilErr);
      await supabase.from("invoices").delete().eq("id", createdId);
      return { ok: false, error: "Could not create invoice line items." };
    }

    revalidatePath("/pathx/invoices");
    revalidatePath(`/pathx/invoices/${createdId}`);
    revalidatePath("/pathx/quotes");
    return { ok: true, invoiceId: createdId };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create invoice." };
  }
}
