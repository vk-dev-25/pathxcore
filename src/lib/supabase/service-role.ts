import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { jwtPayloadRole } from "@/lib/supabase/jwt-role";

/**
 * Server-only: validates access codes and writes signup_allowances.
 * Uses the service role key — never import this module from client components.
 */
export function createServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  const role = jwtPayloadRole(key);
  if (role !== "service_role") {
    throw new Error(
      role === "anon"
        ? "SUPABASE_SERVICE_ROLE_KEY is the anon key. In Supabase → Settings → API, copy the service_role secret (not the anon key). The anon key cannot read access_codes because of RLS."
        : "SUPABASE_SERVICE_ROLE_KEY must be the service_role JWT from Supabase (Settings → API).",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Anon client for server-side signInWithOtp (no cookie persistence). */
export function createAnonAuthClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
