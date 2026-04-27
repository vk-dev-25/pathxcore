import { createClient } from "@/lib/supabase/server";
import { isQuoteStatus, type QuoteStatus } from "@/lib/quotes/types";

export type QuoteListRow = {
  id: string;
  client_org_name: string | null;
  contact_name: string | null;
  project_title: string | null;
  quote_reference: string | null;
  status: QuoteStatus;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  created_by_email: string | null;
  last_updated_by_email: string | null;
};

export async function loadQuotesForUser(): Promise<QuoteListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, client_org_name, contact_name, project_title, quote_reference, status, total_amount, currency, created_at, updated_at, created_by_email, last_updated_by_email",
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    client_org_name: row.client_org_name,
    contact_name: row.contact_name,
    project_title: row.project_title,
    quote_reference: row.quote_reference,
    status: isQuoteStatus(row.status) ? row.status : "created",
    total_amount: Number(row.total_amount),
    currency: row.currency ?? "USD",
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by_email: row.created_by_email ?? null,
    last_updated_by_email: row.last_updated_by_email ?? null,
  }));
}
