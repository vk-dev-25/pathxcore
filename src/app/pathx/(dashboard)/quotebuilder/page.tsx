import type { Metadata } from "next";

import { QuoteBuilderClient } from "@/components/pathx/quote-builder";
import type { CatalogServiceRow } from "@/components/pathx/quote-builder";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New quote | PathX",
  description:
    "Build a quote from the PathX service catalog, preview, and save for your team.",
};

export default async function PathXQuoteBuilderPage() {
  const supabase = await createClient();
  const [{ data }, pricingSettings] = await Promise.all([
    supabase
      .from("quote_catalog_services")
      .select("id, slug, name, description, default_unit_price, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    loadPricingSettings(),
  ]);

  const catalog: CatalogServiceRow[] = (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    default_unit_price: Number(row.default_unit_price),
    sort_order: row.sort_order,
  }));

  return (
    <QuoteBuilderClient catalog={catalog} pricingSettings={pricingSettings} />
  );
}
