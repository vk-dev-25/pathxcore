/** URL-safe slug for `quote_catalog_services.slug` (lowercase, underscores). */
export function slugifyCatalogSlug(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return s.length > 0 ? s : "service";
}
