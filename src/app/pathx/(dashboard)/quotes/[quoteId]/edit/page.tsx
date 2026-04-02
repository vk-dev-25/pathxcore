import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuoteBuilderClient } from "@/components/pathx/quote-builder";
import type { CatalogServiceRow } from "@/components/pathx/quote-builder";
import { getQuoteDraftAction } from "@/lib/quotes/get-quote-draft-action";
import { loadPricingSettings } from "@/lib/quotes/load-pricing";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ quoteId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { quoteId } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("quotes")
    .select("quote_reference")
    .eq("id", quoteId)
    .maybeSingle();
  const ref = row?.quote_reference?.trim();
  return {
    title: ref ? `Edit ${ref} | PathX` : "Edit quote | PathX",
  };
}

export default async function EditQuotePage({ params }: Props) {
  const { quoteId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  const draftRes = await getQuoteDraftAction(quoteId);
  if (!draftRes.ok) {
    notFound();
  }

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
    <QuoteBuilderClient
      catalog={catalog}
      pricingSettings={pricingSettings}
      mode="edit"
      quoteId={quoteId}
      initialDraft={draftRes.data}
    />
  );
}
