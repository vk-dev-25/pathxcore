"use server";

import type { ClientSuggestion } from "@/lib/clients/types";
import { createClient } from "@/lib/supabase/server";

/** Clients for the quote-builder / tracker autocomplete (staff only via RLS). */
export async function listClientsAction(): Promise<ClientSuggestion[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, org_name, address, contact_name, primary_contact_email, client_aliases(alias_text)",
    )
    .order("org_name", { ascending: true });

  if (error || !data) {
    if (error) console.error("listClientsAction", error.message);
    return [];
  }

  return data.map((row) => {
    const aliasRows = (row.client_aliases ?? []) as { alias_text: string }[];
    return {
      id: row.id as string,
      org_name: (row.org_name as string) ?? "",
      address: (row.address as string | null) ?? null,
      contact_name: (row.contact_name as string | null) ?? null,
      primary_contact_email: (row.primary_contact_email as string | null) ?? null,
      aliases: aliasRows.map((a) => a.alias_text).filter(Boolean),
    };
  });
}
