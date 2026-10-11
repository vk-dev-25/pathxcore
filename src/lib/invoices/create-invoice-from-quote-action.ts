"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isValidSegment,
  roundMoney,
  volumeDiscountPercent,
  type Segment,
} from "@/lib/quote-pricing";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { createClient } from "@/lib/supabase/server";

export type CreateInvoiceFromQuoteResult =
  | { ok: true; invoiceId: string }
  | { ok: false; error: string };

function defaultDueDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

/** Calendar year in America/Los_Angeles (lab locale). */
function currentInvoiceYearPacific(): string {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "year")?.value ?? String(new Date().getUTCFullYear())
  );
}

const INVOICE_REF_SEQ_MIN = 2023;

function invoiceRefSuffixPadded(seq: number): string {
  return String(seq).padStart(5, "0");
}

/** e.g. PTDX-2026-02023, PTDX-2026-02024, … (year + 5-digit sequence from 2023). */
async function allocateInvoiceReference(supabase: SupabaseClient): Promise<string> {
  const year = currentInvoiceYearPacific();
  const prefix = `PTDX-${year}-`;

  const { data: rows } = await supabase
    .from("invoices")
    .select("invoice_reference")
    .like("invoice_reference", `${prefix}%`);

  let maxSeq = INVOICE_REF_SEQ_MIN - 1;
  for (const row of rows ?? []) {
    const ref = row.invoice_reference;
    if (typeof ref !== "string" || !ref.startsWith(prefix)) continue;
    const tail = ref.slice(prefix.length).trim();
    const n = parseInt(tail, 10);
    if (!Number.isNaN(n)) maxSeq = Math.max(maxSeq, n);
  }

  const next = maxSeq >= INVOICE_REF_SEQ_MIN ? maxSeq + 1 : INVOICE_REF_SEQ_MIN;

  for (let bump = 0; bump < 100_000; bump++) {
    const ref = `${prefix}${invoiceRefSuffixPadded(next + bump)}`;
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
        "id, client_org_name, client_address, contact_name, project_title, notes, segment, sample_volume, rush_priority, rush_2day, subtotal_amount, segment_adjustment_amount, after_segment_amount, volume_discount_amount, after_volume_amount, rush_uplift_amount, total_amount",
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

    const segment: Segment = isValidSegment(String(quote.segment ?? ""))
      ? (quote.segment as Segment)
      : "small_biopharma";
    const sampleVolume = Math.max(0, Math.floor(Number(quote.sample_volume) || 0));
    const volumeDiscountAmount = Number(quote.volume_discount_amount) || 0;
    const pricingSettings = await loadPricingSettings();
    const defaultVolPct = volumeDiscountPercent(sampleVolume, pricingSettings);
    const applyVolumeDiscount = !(defaultVolPct > 0 && volumeDiscountAmount === 0);

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
          notes: quote.notes ?? null,
          invoice_reference: invoiceReference,
          status: "created" as const,
          due_date: defaultDueDateIso(),
          segment,
          sample_volume: sampleVolume,
          rush_priority: Boolean(quote.rush_priority),
          rush_2day: Boolean(quote.rush_2day),
          apply_volume_discount: applyVolumeDiscount,
          subtotal_amount: Number(quote.subtotal_amount) || 0,
          segment_adjustment_amount: Number(quote.segment_adjustment_amount) || 0,
          after_segment_amount: Number(quote.after_segment_amount) || 0,
          volume_discount_amount: volumeDiscountAmount,
          after_volume_amount: Number(quote.after_volume_amount) || 0,
          rush_uplift_amount: Number(quote.rush_uplift_amount) || 0,
          total_amount: Number(quote.total_amount) || 0,
          last_updated_by: user.id,
          last_updated_by_email: user.email ?? null,
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
