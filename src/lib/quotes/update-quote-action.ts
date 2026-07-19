"use server";

import { revalidatePath } from "next/cache";

import {
  computeQuoteTotals,
  isValidSegment,
  roundMoney,
  type QuoteLineInput,
  type Segment,
} from "@/lib/quote-pricing";
import { findOrCreateClient } from "@/lib/clients/upsert-client";
import { catalogIdForInsert } from "@/lib/quotes/quote-line-catalog-id";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { isQuoteStatus, type QuoteStatus } from "@/lib/quotes/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import type { SaveQuoteState } from "@/lib/quotes/save-quote-action";

export async function updateQuoteAction(input: {
  quoteId: string;
  client_org_name: string;
  client_address: string;
  contact_name: string;
  project_title: string;
  quote_reference: string;
  status?: string;
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

  let db = supabase as typeof supabase;
  try {
    db = createServiceRoleClient() as typeof supabase;
  } catch (e) {
    console.warn(
      "updateQuoteAction: service role client unavailable, using session client (RLS must allow edits):",
      e,
    );
  }

  if (!isValidSegment(input.segment)) {
    return { ok: false, error: "Invalid segment." };
  }
  const segment = input.segment as Segment;
  const rawStatus = input.status ?? "";
  const status: QuoteStatus = isQuoteStatus(rawStatus) ? rawStatus : "created";

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

  const { data: existing, error: exErr } = await db
    .from("quotes")
    .select("id")
    .eq("id", input.quoteId)
    .maybeSingle();

  if (exErr || !existing) {
    return { ok: false, error: "Quote not found." };
  }

  const { data: catalogRows } = await db
    .from("quote_catalog_services")
    .select("id");
  const validCatalogIds = new Set(
    (catalogRows ?? []).map((r) => String(r.id).toLowerCase()),
  );

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

  let clientId: string | null = null;
  try {
    clientId = await findOrCreateClient(db, {
      org_name: input.client_org_name,
      address: input.client_address,
      contact_name: input.contact_name,
      created_by: user.id,
    });
  } catch (e) {
    console.warn("updateQuoteAction: client link skipped:", e);
  }

  const { error: uErr } = await db
    .from("quotes")
    .update({
      client_id: clientId,
      client_org_name: input.client_org_name.trim() || null,
      client_address: input.client_address.trim() || null,
      contact_name: input.contact_name.trim() || null,
      project_title: input.project_title.trim() || null,
      quote_reference: input.quote_reference.trim() || null,
      status,
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
      updated_at: new Date().toISOString(),
      last_updated_by: user.id,
      last_updated_by_email: user.email ?? null,
    })
    .eq("id", input.quoteId);

  if (uErr) {
    console.error(uErr);
    return { ok: false, error: "Could not update quote. Try again." };
  }

  const { error: dErr } = await db
    .from("quote_line_items")
    .delete()
    .eq("quote_id", input.quoteId);

  if (dErr) {
    console.error(dErr);
    return { ok: false, error: "Could not replace line items. Try again." };
  }

  const lineRows = input.lines.map((l, i) => ({
    quote_id: input.quoteId,
    catalog_service_id: catalogIdForInsert(l.catalog_service_id, validCatalogIds),
    label: l.label.trim(),
    quantity: l.quantity,
    unit_price: roundMoney(l.unit_price),
    default_unit_price_snapshot: roundMoney(l.default_unit_price_snapshot),
    is_price_overridden: l.is_price_overridden,
    line_total: roundMoney(l.quantity * l.unit_price),
    sort_order: i,
  }));

  const { error: iErr } = await db.from("quote_line_items").insert(lineRows);

  if (iErr) {
    console.error(iErr);
    const hint =
      iErr.code === "23503"
        ? " A catalog reference was invalid."
        : iErr.message?.includes("row-level security") ||
            iErr.code === "42501"
          ? " Database permissions blocked the save (run the quotes RLS migration or set SUPABASE_SERVICE_ROLE_KEY on the server)."
          : "";
    return {
      ok: false,
      error: `Could not save line items. Try again.${hint}`,
    };
  }

  revalidatePath("/pathx/quotebuilder");
  revalidatePath("/pathx/quotes");
  revalidatePath(`/pathx/quotes/${input.quoteId}/edit`);
  return { ok: true, quoteId: input.quoteId };
}
