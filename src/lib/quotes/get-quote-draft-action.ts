"use server";

import { isValidSegment, type Segment } from "@/lib/quote-pricing";
import { createClient } from "@/lib/supabase/server";

export type QuoteDraftLine = {
  catalog_service_id: string | null;
  label: string;
  quantity: number;
  unit_price: number;
  default_unit_price_snapshot: number;
  is_price_overridden: boolean;
};

export type QuoteDraftPayload = {
  quoteId: string;
  ownerUserId: string;
  client_org_name: string;
  client_address: string;
  contact_name: string;
  project_title: string;
  quote_reference: string;
  segment: Segment;
  sample_volume: number;
  rush_priority: boolean;
  rush_2day: boolean;
  notes: string;
  lines: QuoteDraftLine[];
};

export async function getQuoteDraftAction(
  quoteId: string,
): Promise<
  { ok: true; data: QuoteDraftPayload } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: row, error: qErr } = await supabase
    .from("quotes")
    .select(
      "id, user_id, client_org_name, client_address, contact_name, project_title, quote_reference, segment, sample_volume, rush_priority, rush_2day, notes",
    )
    .eq("id", quoteId)
    .maybeSingle();

  if (qErr || !row) {
    return { ok: false, error: "Quote not found." };
  }

  const { data: lineRows, error: lErr } = await supabase
    .from("quote_line_items")
    .select(
      "catalog_service_id, label, quantity, unit_price, default_unit_price_snapshot, is_price_overridden",
    )
    .eq("quote_id", quoteId)
    .order("sort_order", { ascending: true });

  if (lErr) {
    return { ok: false, error: "Could not load line items." };
  }

  const segment = isValidSegment(row.segment) ? row.segment : "small_biopharma";

  const lines: QuoteDraftLine[] = (lineRows ?? []).map((l) => ({
    catalog_service_id: l.catalog_service_id as string | null,
    label: l.label,
    quantity: Number(l.quantity),
    unit_price: Number(l.unit_price),
    default_unit_price_snapshot: Number(l.default_unit_price_snapshot),
    is_price_overridden: Boolean(l.is_price_overridden),
  }));

  return {
    ok: true,
    data: {
      quoteId: row.id,
      ownerUserId: row.user_id as string,
      client_org_name: row.client_org_name ?? "",
      client_address: row.client_address ?? "",
      contact_name: row.contact_name ?? "",
      project_title: row.project_title ?? "",
      quote_reference: row.quote_reference ?? "",
      segment,
      sample_volume: Math.max(0, Math.floor(Number(row.sample_volume))),
      rush_priority: Boolean(row.rush_priority),
      rush_2day: Boolean(row.rush_2day),
      notes: row.notes ?? "",
      lines,
    },
  };
}
