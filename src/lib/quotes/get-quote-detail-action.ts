"use server";

import {
  isValidSegment,
  SEGMENT_OPTIONS,
  type PricingSettingsSnapshot,
} from "@/lib/quote-pricing";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { createClient } from "@/lib/supabase/server";

export type QuotePreviewLinePayload = {
  label: string;
  quantity: number;
  unit_price: number;
  lineTotal: number;
  is_price_overridden: boolean;
};

export type QuoteForPreviewData = {
  clientOrg: string;
  contactName: string;
  projectTitle: string;
  quoteRef: string;
  segmentLabel: string;
  sampleVolume: number;
  rushPriority: boolean;
  rush2day: boolean;
  notes: string;
  lines: QuotePreviewLinePayload[];
  totals: {
    subtotal_amount: number;
    segment_adjustment_amount: number;
    after_segment_amount: number;
    volume_discount_percent: number;
    volume_discount_amount: number;
    after_volume_amount: number;
    rush_uplift_amount: number;
    total_amount: number;
  };
  issuedAtIso: string;
  downloadJson: Record<string, unknown>;
  pricingSettings: PricingSettingsSnapshot;
};

export async function getQuoteForPreviewAction(
  quoteId: string,
): Promise<
  | { ok: true; data: QuoteForPreviewData }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: q, error: qErr } = await supabase
    .from("quotes")
    .select(
      "id, client_org_name, contact_name, project_title, quote_reference, segment, sample_volume, rush_priority, rush_2day, notes, subtotal_amount, segment_adjustment_amount, after_segment_amount, volume_discount_amount, after_volume_amount, rush_uplift_amount, total_amount, created_at",
    )
    .eq("id", quoteId)
    .maybeSingle();

  if (qErr || !q) {
    return { ok: false, error: "Quote not found." };
  }

  const { data: lineRows, error: lErr } = await supabase
    .from("quote_line_items")
    .select("label, quantity, unit_price, line_total, is_price_overridden")
    .eq("quote_id", quoteId)
    .order("sort_order", { ascending: true });

  if (lErr) {
    return { ok: false, error: "Could not load line items." };
  }

  const pricingSettings = await loadPricingSettings();
  const segment = isValidSegment(q.segment) ? q.segment : "small_biopharma";
  const segmentLabel =
    SEGMENT_OPTIONS.find((o) => o.value === segment)?.label ?? q.segment;

  const afterSeg = Number(q.after_segment_amount);
  const volDisc = Number(q.volume_discount_amount);
  const volume_discount_percent =
    afterSeg > 0 ? Math.round((volDisc / afterSeg) * 10000) / 100 : 0;

  const lines: QuotePreviewLinePayload[] = (lineRows ?? []).map((l) => ({
    label: l.label,
    quantity: Number(l.quantity),
    unit_price: Number(l.unit_price),
    lineTotal: Number(l.line_total),
    is_price_overridden: l.is_price_overridden,
  }));

  const downloadJson = {
    quote: {
      id: q.id,
      reference: q.quote_reference,
      client_org_name: q.client_org_name,
      contact_name: q.contact_name,
      project_title: q.project_title,
      segment: q.segment,
      sample_volume: q.sample_volume,
      rush_priority: q.rush_priority,
      rush_2day: q.rush_2day,
      notes: q.notes,
      amounts: {
        subtotal: Number(q.subtotal_amount),
        segment_adjustment: Number(q.segment_adjustment_amount),
        after_segment: afterSeg,
        volume_discount: volDisc,
        after_volume: Number(q.after_volume_amount),
        rush_uplift: Number(q.rush_uplift_amount),
        total: Number(q.total_amount),
      },
      created_at: q.created_at,
    },
    line_items: (lineRows ?? []).map((l) => ({
      label: l.label,
      quantity: Number(l.quantity),
      unit_price: Number(l.unit_price),
      line_total: Number(l.line_total),
      is_price_overridden: l.is_price_overridden,
    })),
  };

  return {
    ok: true,
    data: {
      clientOrg: q.client_org_name ?? "",
      contactName: q.contact_name ?? "",
      projectTitle: q.project_title ?? "",
      quoteRef: q.quote_reference ?? "",
      segmentLabel,
      sampleVolume: q.sample_volume,
      rushPriority: q.rush_priority,
      rush2day: q.rush_2day,
      notes: q.notes ?? "",
      lines,
      totals: {
        subtotal_amount: Number(q.subtotal_amount),
        segment_adjustment_amount: Number(q.segment_adjustment_amount),
        after_segment_amount: afterSeg,
        volume_discount_percent,
        volume_discount_amount: volDisc,
        after_volume_amount: Number(q.after_volume_amount),
        rush_uplift_amount: Number(q.rush_uplift_amount),
        total_amount: Number(q.total_amount),
      },
      issuedAtIso: q.created_at,
      downloadJson,
      pricingSettings,
    },
  };
}
