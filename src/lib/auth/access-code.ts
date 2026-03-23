import type { PostgrestError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Trim, strip NBSP, uppercase — matches how codes are stored in SQL examples. */
export function normalizeAccessCode(raw: string): string {
  return raw
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/[\u2010-\u2015]/g, "-") // en/em dash → ASCII hyphen (copy/paste from docs)
    .trim()
    .toUpperCase();
}

type AccessCodeRow = {
  id: string;
  expires_at: string;
  max_uses: number;
  used_count: number;
};

function isRpcMissing(err: PostgrestError | null): boolean {
  if (!err) return false;
  const m = err.message ?? "";
  return (
    m.includes("does not exist") ||
    m.includes("Could not find the function") ||
    err.code === "42883"
  );
}

/** Supabase PostgREST rejects the Authorization JWT (wrong key, wrong project, or corrupted .env). */
function isInvalidApiKey(err: PostgrestError | null): boolean {
  if (!err) return false;
  const m = (err.message ?? "").toLowerCase();
  return (
    m.includes("invalid api key") ||
    m.includes("jwt expired") ||
    m.includes("invalid jwt")
  );
}

export function supabaseKeyErrorMessage(err: PostgrestError | null): string | null {
  if (!err || !isInvalidApiKey(err)) return null;
  return "Supabase rejected the server API key. Use the service_role secret from the same project as NEXT_PUBLIC_SUPABASE_URL (Dashboard → Settings → API). Paste it once, with no quotes or line breaks, then restart the dev server.";
}

/** Prefer DB trim/case match; fall back to .eq if RPC not deployed yet. */
async function fetchAccessCodeRow(
  service: SupabaseClient,
  rawAccessCode: string,
  select: "full" | "expires_only",
): Promise<{
  row:
    | (AccessCodeRow & { expires_at: string })
    | { expires_at: string }
    | null;
  fetchErr: PostgrestError | null;
}> {
  const rawInput = rawAccessCode.trim();

  const { data: rpcData, error: rpcErr } = await service.rpc(
    "match_access_code",
    { p_raw: rawInput },
  );

  if (!rpcErr && rpcData != null) {
    const arr = Array.isArray(rpcData) ? rpcData : [rpcData];
    const first = arr[0] as AccessCodeRow | undefined;
    if (first?.id && select === "full") {
      return { row: first, fetchErr: null };
    }
    if (first && select === "expires_only" && first.expires_at) {
      return { row: { expires_at: first.expires_at }, fetchErr: null };
    }
  }

  if (rpcErr && !isRpcMissing(rpcErr)) {
    console.error("match_access_code RPC:", rpcErr.message);
    return { row: null, fetchErr: rpcErr };
  }

  const code = normalizeAccessCode(rawAccessCode);
  if (!code) {
    return { row: null, fetchErr: null };
  }

  const columns =
    select === "full"
      ? "id, expires_at, max_uses, used_count"
      : "expires_at";

  const { data: eqRow, error: fetchErr } = await service
    .from("access_codes")
    .select(columns)
    .eq("code", code)
    .maybeSingle();

  return { row: eqRow as AccessCodeRow | null, fetchErr };
}

/** Creates signup_allowances after validating access_codes (used before auth.users insert). */
export async function grantSignupAllowance(
  service: SupabaseClient,
  email: string,
  accessCode: string,
): Promise<{ error?: string }> {
  const { row, fetchErr } = await fetchAccessCodeRow(
    service,
    accessCode,
    "full",
  );

  if (fetchErr) {
    return {
      error:
        supabaseKeyErrorMessage(fetchErr) ?? "Invalid or unknown access code.",
    };
  }

  const full = row as AccessCodeRow | null;
  if (!full?.id) {
    return { error: "Invalid or unknown access code." };
  }

  const now = Date.now();
  if (new Date(full.expires_at).getTime() <= now) {
    return { error: "This access code has expired." };
  }
  if (full.used_count >= full.max_uses) {
    return { error: "This access code has no uses remaining." };
  }

  const allowanceDeadline = Math.min(
    new Date(full.expires_at).getTime(),
    now + 15 * 60 * 1000,
  );

  const { error: delErr } = await service
    .from("signup_allowances")
    .delete()
    .eq("email", email)
    .is("consumed_at", null);

  if (delErr) {
    console.error(delErr);
    return { error: "Could not prepare signup. Try again." };
  }

  const { error: insErr } = await service.from("signup_allowances").insert({
    email,
    access_code_id: full.id,
    expires_at: new Date(allowanceDeadline).toISOString(),
  });

  if (insErr) {
    console.error(insErr);
    return { error: "Could not prepare signup. Try again." };
  }

  return {};
}

/** Password reset: code must exist and not be expired (usage limits do not apply). */
export async function validateAccessCodeForPasswordReset(
  service: SupabaseClient,
  accessCode: string,
): Promise<{ error?: string }> {
  const { row, fetchErr } = await fetchAccessCodeRow(
    service,
    accessCode,
    "expires_only",
  );

  if (fetchErr) {
    return {
      error:
        supabaseKeyErrorMessage(fetchErr) ?? "Invalid or unknown access code.",
    };
  }

  const exp = row?.expires_at;
  if (!exp) {
    return { error: "Invalid or unknown access code." };
  }

  if (new Date(exp).getTime() <= Date.now()) {
    return { error: "This access code has expired." };
  }

  return {};
}
