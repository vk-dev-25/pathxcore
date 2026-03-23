import {
  defaultPricingSettings,
  parsePricingSettingsRow,
  type PricingSettingsSnapshot,
} from "@/lib/quote-pricing";
import { createClient } from "@/lib/supabase/server";

export async function loadPricingSettings(): Promise<PricingSettingsSnapshot> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quote_pricing_settings")
    .select(
      "rush_priority_percent, rush_2day_percent, quote_validity_days, lab_address, contact_email, segment_multipliers, volume_tiers",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return defaultPricingSettings();
  }

  return parsePricingSettingsRow(data);
}
