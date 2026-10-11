/** Returns a canonical UUID string or null if not a valid UUID. */
export function parseCatalogServiceUuid(
  raw: string | null | undefined,
): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s,
    )
  ) {
    return null;
  }
  return s.toLowerCase();
}

/**
 * Keep catalog FK only when the id exists in the catalog; otherwise null
 * (orphan / custom lines still save).
 */
export function catalogIdForInsert(
  raw: string | null | undefined,
  validCatalogIds: Set<string>,
): string | null {
  const id = parseCatalogServiceUuid(raw);
  if (!id) return null;
  return validCatalogIds.has(id) ? id : null;
}
