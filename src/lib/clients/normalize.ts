const LEGAL_SUFFIXES =
  /\b(incorporated|inc|llc|ltd|limited|corp|corporation|company|co|plc|gmbh|sarl|sa|ag|nv|bv|pty|llp)\b/g;

/**
 * Deterministic client-name key. MUST stay in sync with the SQL
 * `public.normalize_client_name` used by the migration/backfill.
 * Returns null for names that normalize to empty.
 */
export function normalizeClientName(input: string | null | undefined): string | null {
  let v = (input ?? "").toLowerCase();
  v = v.replace(/&/g, "and");
  v = v.replace(/[^a-z0-9]+/g, " ");
  v = v.replace(LEGAL_SUFFIXES, "");
  v = v.replace(/\s+/g, "");
  return v || null;
}
