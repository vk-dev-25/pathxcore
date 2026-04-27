"use server";

import { revalidatePath } from "next/cache";

import {
  computeQuoteTotals,
  isValidSegment,
  roundMoney,
  type QuoteLineInput,
  type Segment,
} from "@/lib/quote-pricing";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { createClient } from "@/lib/supabase/server";

export type SaveQuoteState =
  | { ok: true; quoteId: string }
  | { ok: false; error: string };

export async function saveQuoteAction(input: {
  client_org_name: string;
  client_address: string;
  contact_name: string;
  project_title: string;
  quote_reference: string;
  segment: string;
  sample_volume: number;
  rush_priority: boolean;
  rush_2day: boolean;
  apply_volume_discount?: boolean;
  notes: string;
  lines: QuoteLineInput[];
}): Promise<SaveQuoteState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to save a quote." };
  }

  if (!isValidSegment(input.segment)) {
    return { ok: false, error: "Invalid segment." };
  }
  const segment = input.segment as Segment;

  if (!input.lines.length) {
    return { ok: false, error: "Add at least one service line." };
  }

  for (const line of input.lines) {
    if (line.quantity <= 0 || line.unit_price < 0) {
      return {
        ok: false,
        error: "Each line needs a positive quantity and valid price.",
      };
    }
  }

  const pricingSettings = await loadPricingSettings();
  const totals = computeQuoteTotals(
    input.lines,
    segment,
    Math.max(0, Math.floor(input.sample_volume)),
    input.rush_priority,
    input.rush_2day,
    pricingSettings,
    { applyVolumeDiscount: input.apply_volume_discount ?? true },
  );

  const { data: quote, error: qErr } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      client_org_name: input.client_org_name.trim() || null,
      client_address: input.client_address.trim() || null,
      contact_name: input.contact_name.trim() || null,
      project_title: input.project_title.trim() || null,
      quote_reference: input.quote_reference.trim() || null,
      segment: input.segment,
      sample_volume: Math.max(0, Math.floor(input.sample_volume)),
      rush_priority: input.rush_priority,
      rush_2day: input.rush_2day,
      notes: input.notes.trim() || null,
      subtotal_amount: totals.subtotal_amount,
      segment_adjustment_amount: totals.segment_adjustment_amount,
      after_segment_amount: totals.after_segment_amount,
      volume_discount_amount: totals.volume_discount_amount,
      after_volume_amount: totals.after_volume_amount,
      rush_uplift_amount: totals.rush_uplift_amount,
      total_amount: totals.total_amount,
      created_by: user.id,
      created_by_email: user.email ?? null,
      last_updated_by: user.id,
      last_updated_by_email: user.email ?? null,
    })
    .select("id")
    .single();

  if (qErr || !quote) {
    console.error(qErr);
    return {
      ok: false,
      error:
        qErr?.message?.includes("relation") || qErr?.code === "42P01"
          ? "Quotes tables are missing. Run the Supabase migration for quotes (see supabase/migrations)."
          : "Could not save quote. Try again.",
    };
  }

  const lineRows = input.lines.map((l, i) => ({
    quote_id: quote.id,
    catalog_service_id: l.catalog_service_id?.trim() || null,
    label: l.label.trim(),
    quantity: l.quantity,
    unit_price: roundMoney(l.unit_price),
    default_unit_price_snapshot: roundMoney(l.default_unit_price_snapshot),
    is_price_overridden: l.is_price_overridden,
    line_total: roundMoney(l.quantity * l.unit_price),
    sort_order: i,
  }));

  const { error: lErr } = await supabase.from("quote_line_items").insert(lineRows);

  if (lErr) {
    console.error(lErr);
    await supabase.from("quotes").delete().eq("id", quote.id);
    return { ok: false, error: "Could not save line items. Try again." };
  }

  revalidatePath("/pathx/quotebuilder");
  return { ok: true, quoteId: quote.id };
}
