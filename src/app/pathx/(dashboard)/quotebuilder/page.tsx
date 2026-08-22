import type { Metadata } from "next";

import {
  QuoteBuilderClient,
  type QuoteBuilderMode,
} from "@/components/pathx/quote-builder";
import type { CatalogServiceRow } from "@/components/pathx/quote-builder";
import { listClientsAction } from "@/lib/clients/list-clients-action";
import {
  getQuoteDraftAction,
  type QuoteDraftPayload,
} from "@/lib/quotes/get-quote-draft-action";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New quote | PathX",
  description:
    "Build a quote from the PathX service catalog, preview, and save for your team.",
};

export default async function PathXQuoteBuilderPage({
  searchParams,
}: {
  searchParams?: Promise<{ copyFrom?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const copyFrom = sp.copyFrom?.trim();
  let initialDraft: QuoteDraftPayload | null = null;
  let mode: QuoteBuilderMode = "create";
  if (copyFrom) {
    const res = await getQuoteDraftAction(copyFrom);
    if (res.ok) {
      initialDraft = res.data;
      mode = "copy";
    }
  }

  const supabase = await createClient();
  const [{ data }, pricingSettings, clients] = await Promise.all([
    supabase
      .from("quote_catalog_services")
      .select("id, slug, name, description, default_unit_price, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    loadPricingSettings(),
    listClientsAction(),
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
    <QuoteBuilderClient
      key={mode === "copy" && initialDraft ? `copy-${initialDraft.quoteId}` : "new"}
      catalog={catalog}
      pricingSettings={pricingSettings}
      mode={mode}
      initialDraft={initialDraft}
      clients={clients}
    />
  );
}
