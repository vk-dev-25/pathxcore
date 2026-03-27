import type { Metadata } from "next";

import {
  QuoteFinderClient,
  type QuoteListRow,
} from "@/components/pathx/quote-finder-client";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Quote finder | PathX",
  description: "Search and sort saved quotes from your PathX workspace.",
};

export default async function QuoteFinderPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; quoteId?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, client_org_name, contact_name, project_title, quote_reference, total_amount, created_at",
    )
    .order("created_at", { ascending: false });

  const quotes: QuoteListRow[] = (data ?? []).map((row) => ({
    id: row.id,
    client_org_name: row.client_org_name,
    contact_name: row.contact_name,
    project_title: row.project_title,
    quote_reference: row.quote_reference,
    total_amount: Number(row.total_amount),
    created_at: row.created_at,
  }));

  if (error) {
    console.error(error);
  }

  const initialQuery = sp.q?.trim() ?? "";
  const initialPreviewId = sp.quoteId?.trim() || null;

  return (
    <QuoteFinderClient
      quotes={quotes}
      initialQuery={initialQuery}
      initialPreviewId={initialPreviewId}
    />
  );
}
