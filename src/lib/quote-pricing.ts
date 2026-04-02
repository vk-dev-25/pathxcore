export type Segment =
  | "academic"
  | "small_biopharma"
  | "mid_biopharma"
  | "large_biopharma";

export const SEGMENT_OPTIONS: { value: Segment; label: string }[] = [
  { value: "academic", label: "Academic / Non-profit" },
  { value: "small_biopharma", label: "Small biopharma" },
  { value: "mid_biopharma", label: "Mid biopharma" },
  { value: "large_biopharma", label: "Large biopharma" },
];

export type VolumeTier = {
  min: number;
  max: number;
  discountPercent: number;
};

/** Editable rules loaded from `quote_pricing_settings` (with safe fallbacks). */
export type PricingSettingsSnapshot = {
  rush_priority_percent: number;
  rush_2day_percent: number;
  quote_validity_days: number;
  lab_address: string;
  contact_email: string;
  segment_multipliers: Record<string, number>;
  volume_tiers: VolumeTier[];
};

const DEFAULT_VOLUME_TIERS: VolumeTier[] = [
  { min: 1, max: 15, discountPercent: 0 },
  { min: 16, max: 50, discountPercent: 5 },
  { min: 51, max: 150, discountPercent: 10 },
  { min: 151, max: 999999, discountPercent: 15 },
];

const DEFAULT_SEGMENT_MULTIPLIERS: Record<string, number> = {
  academic: 0.9,
  small_biopharma: 1,
  mid_biopharma: 1.12,
  large_biopharma: 1.22,
};

export function defaultPricingSettings(): PricingSettingsSnapshot {
  return {
    rush_priority_percent: 25,
    rush_2day_percent: 10,
    quote_validity_days: 30,
    lab_address: "",
    contact_email: "",
    segment_multipliers: { ...DEFAULT_SEGMENT_MULTIPLIERS },
    volume_tiers: DEFAULT_VOLUME_TIERS.map((t) => ({ ...t })),
  };
}

export function normalizeVolumeTiers(raw: unknown): VolumeTier[] {
  if (!Array.isArray(raw) || raw.length === 0) return defaultPricingSettings().volume_tiers;
  const out: VolumeTier[] = [];
  for (const row of raw) {
    if (
      row &&
      typeof row === "object" &&
      "min" in row &&
      "max" in row &&
      "discountPercent" in row
    ) {
      const min = Number((row as VolumeTier).min);
      const max = Number((row as VolumeTier).max);
      const discountPercent = Number((row as VolumeTier).discountPercent);
      if (
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        Number.isFinite(discountPercent)
      ) {
        out.push({
          min: Math.max(0, min),
          max: Math.max(min, max),
          discountPercent: Math.min(100, Math.max(0, discountPercent)),
        });
      }
    }
  }
  return out.length ? out.sort((a, b) => a.min - b.min) : defaultPricingSettings().volume_tiers;
}

export function normalizeSegmentMultipliers(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SEGMENT_MULTIPLIERS };
  const base = { ...DEFAULT_SEGMENT_MULTIPLIERS };
  for (const seg of Object.keys(DEFAULT_SEGMENT_MULTIPLIERS) as Segment[]) {
    const v = (raw as Record<string, unknown>)[seg];
    if (typeof v === "number" && Number.isFinite(v)) base[seg] = v;
    else if (typeof v === "string" && v.trim() !== "") {
      const n = parseFloat(v);
      if (Number.isFinite(n)) base[seg] = n;
    }
  }
  return base;
}

export function parsePricingSettingsRow(row: {
  rush_priority_percent: number | string;
  rush_2day_percent: number | string;
  quote_validity_days: number | string;
  lab_address: string | null;
  contact_email: string | null;
  segment_multipliers: unknown;
  volume_tiers: unknown;
}): PricingSettingsSnapshot {
  const rushP = Number(row.rush_priority_percent);
  const rush2 = Number(row.rush_2day_percent);
  const qd = Number(row.quote_validity_days);
  return {
    rush_priority_percent: Number.isFinite(rushP)
      ? Math.min(100, Math.max(0, rushP))
      : 25,
    rush_2day_percent: Number.isFinite(rush2)
      ? Math.min(100, Math.max(0, rush2))
      : 10,
    quote_validity_days: Number.isFinite(qd) && qd > 0 ? Math.floor(qd) : 30,
    lab_address: row.lab_address ?? "",
    contact_email: row.contact_email ?? "",
    segment_multipliers: normalizeSegmentMultipliers(row.segment_multipliers),
    volume_tiers: normalizeVolumeTiers(row.volume_tiers),
  };
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function segmentMultiplier(
  segment: Segment,
  settings?: PricingSettingsSnapshot,
): number {
  const m = settings?.segment_multipliers?.[segment];
  if (typeof m === "number" && Number.isFinite(m) && m > 0) return m;
  return DEFAULT_SEGMENT_MULTIPLIERS[segment] ?? 1;
}

/** Percent discount on amount after segment adjustment (0–100). */
export function volumeDiscountPercent(
  sampleVolume: number,
  settings?: PricingSettingsSnapshot,
): number {
  const tiers = settings?.volume_tiers?.length
    ? settings.volume_tiers
    : DEFAULT_VOLUME_TIERS;
  const v = Math.max(0, Math.floor(sampleVolume));
  if (v <= 0) return 0;
  for (const t of tiers) {
    if (v >= t.min && v <= t.max) return t.discountPercent;
  }
  const last = tiers[tiers.length - 1];
  return last ? last.discountPercent : 0;
}

export interface QuoteLineInput {
  /** Null when the line is custom / catalog row was removed. */
  catalog_service_id: string | null;
  label: string;
  quantity: number;
  unit_price: number;
  default_unit_price_snapshot: number;
  is_price_overridden: boolean;
}

export function computeQuoteTotals(
  lines: QuoteLineInput[],
  segment: Segment,
  sampleVolume: number,
  rushPriority: boolean,
  rush2day: boolean,
  settings?: PricingSettingsSnapshot,
) {
  const snap = settings ?? defaultPricingSettings();
  const servicesSubtotal = roundMoney(
    lines.reduce((s, l) => s + roundMoney(l.quantity * l.unit_price), 0),
  );
  const mult = segmentMultiplier(segment, snap);
  const afterSegment = roundMoney(servicesSubtotal * mult);
  const segmentAdjustmentAmount = roundMoney(afterSegment - servicesSubtotal);
  const volPct = volumeDiscountPercent(sampleVolume, snap);
  const volumeDiscountAmount = roundMoney(afterSegment * (volPct / 100));
  const afterVolume = roundMoney(afterSegment - volumeDiscountAmount);
  const rp = snap.rush_priority_percent / 100;
  const r2 = snap.rush_2day_percent / 100;
  let rushUplift = 0;
  if (rushPriority) rushUplift += roundMoney(afterVolume * rp);
  if (rush2day) rushUplift += roundMoney(afterVolume * r2);
  const totalAmount = roundMoney(afterVolume + rushUplift);

  return {
    subtotal_amount: servicesSubtotal,
    segment_adjustment_amount: segmentAdjustmentAmount,
    after_segment_amount: afterSegment,
    volume_discount_percent: volPct,
    volume_discount_amount: volumeDiscountAmount,
    after_volume_amount: afterVolume,
    rush_uplift_amount: rushUplift,
    total_amount: totalAmount,
  };
}

export function isValidSegment(s: string): s is Segment {
  return (
    s === "academic" ||
    s === "small_biopharma" ||
    s === "mid_biopharma" ||
    s === "large_biopharma"
  );
}
