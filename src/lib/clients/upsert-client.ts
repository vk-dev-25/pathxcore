import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeClientName } from "@/lib/clients/normalize";

/**
 * Find (by normalized name or alias) or create a canonical client, and record
 * the raw spelling as an alias. Returns the client id, or null when the name is
 * blank. Pass a service-role client so this works regardless of caller RLS.
 */
export async function findOrCreateClient(
  db: SupabaseClient,
  input: {
    org_name: string;
    address?: string | null;
    contact_name?: string | null;
    created_by?: string | null;
  },
): Promise<string | null> {
  const orgName = (input.org_name ?? "").trim();
  const key = normalizeClientName(orgName);
  if (!key) return null;

  const { data: existing } = await db
    .from("clients")
    .select("id")
    .eq("name_key", key)
    .maybeSingle();
  if (existing?.id) {
    await ensureAlias(db, existing.id as string, orgName, key);
    return existing.id as string;
  }

  const { data: aliasHit } = await db
    .from("client_aliases")
    .select("client_id")
    .eq("alias_key", key)
    .maybeSingle();
  if (aliasHit?.client_id) return aliasHit.client_id as string;

  const { data: created, error } = await db
    .from("clients")
    .insert({
      org_name: orgName,
      name_key: key,
      address: input.address?.trim() || null,
      contact_name: input.contact_name?.trim() || null,
      created_by: input.created_by ?? null,
    })
    .select("id")
    .single();

  if (error || !created) {
    // Lost a race on the unique name_key: re-read.
    const { data: raced } = await db
      .from("clients")
      .select("id")
      .eq("name_key", key)
      .maybeSingle();
    if (raced?.id) {
      await ensureAlias(db, raced.id as string, orgName, key);
      return raced.id as string;
    }
    if (error) console.error("findOrCreateClient", error.message);
    return null;
  }

  await ensureAlias(db, created.id as string, orgName, key);
  return created.id as string;
}

async function ensureAlias(
  db: SupabaseClient,
  clientId: string,
  aliasText: string,
  aliasKey: string,
): Promise<void> {
  await db
    .from("client_aliases")
    .upsert(
      { client_id: clientId, alias_text: aliasText, alias_key: aliasKey },
      { onConflict: "alias_key", ignoreDuplicates: true },
    );
}
