import type { Metadata } from "next";

import {
  QuoteFinderClient,
  type QuoteListRow,
} from "@/components/pathx/quote-finder-client";
import { isQuoteStatus } from "@/lib/quotes/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Quote finder | PathX",
  description: "Search and sort saved quotes from your PathX workspace.",
};

/** Always refetch list after status patches etc. — avoids stale RSC cache on router.refresh(). */
export const dynamic = "force-dynamic";

export default async function QuoteFinderPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; quoteId?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, client_org_name, contact_name, project_title, quote_reference, status, total_amount, created_at, updated_at, created_by_email, last_updated_by_email",
    )
    .order("created_at", { ascending: false });

  const quotes: QuoteListRow[] = (data ?? []).map((row) => ({
    id: row.id,
    client_org_name: row.client_org_name,
    contact_name: row.contact_name,
    project_title: row.project_title,
    quote_reference: row.quote_reference,
    status: isQuoteStatus(row.status) ? row.status : "created",
    total_amount: Number(row.total_amount),
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by_email: row.created_by_email ?? null,
    last_updated_by_email: row.last_updated_by_email ?? null,
    can_edit: Boolean(user?.id),
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
