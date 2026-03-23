import { createClient } from "@/lib/supabase/server";

export type QuoteListRow = {
  id: string;
  client_org_name: string | null;
  contact_name: string | null;
  project_title: string | null;
  quote_reference: string | null;
  total_amount: number;
  currency: string;
  created_at: string;
};

export async function loadQuotesForUser(): Promise<QuoteListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, client_org_name, contact_name, project_title, quote_reference, total_amount, currency, created_at",
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
    total_amount: Number(row.total_amount),
    currency: row.currency ?? "USD",
    created_at: row.created_at,
  }));
}
