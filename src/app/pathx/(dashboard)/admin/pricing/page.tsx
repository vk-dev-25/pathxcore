import type { Metadata } from "next";

import { AdminPricingClient } from "@/components/pathx/admin-pricing-client";
import type { CatalogServiceRow } from "@/components/pathx/quote-builder";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Quote price config | PathX",
  description:
    "Configure catalog services, base prices, volume tiers, rush rates, and segment multipliers.",
};

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const [catalogRes, settings] = await Promise.all([
    supabase
      .from("quote_catalog_services")
      .select("id, slug, name, description, default_unit_price, sort_order, active")
      .order("sort_order", { ascending: true }),
    loadPricingSettings(),
  ]);

  const catalog: CatalogServiceRow[] = (catalogRes.data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    default_unit_price: Number(row.default_unit_price),
    sort_order: row.sort_order,
    active: row.active,
  }));

  return <AdminPricingClient initialCatalog={catalog} initialSettings={settings} />;
}
