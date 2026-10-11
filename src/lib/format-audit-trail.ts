/** Date + time for tables (invoice/quote finder). */
export function formatShortDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

/** User-facing line for quote/invoice editor audit. */
export function formatAuditTrail(
  updatedAtIso: string | null | undefined,
  byEmail: string | null | undefined,
): string | null {
  const email = byEmail?.trim() || null;
  const when = updatedAtIso
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(updatedAtIso))
    : null;
  if (when && email) return `Last saved ${when} · ${email}`;
  if (when) return `Last saved ${when}`;
  if (email) return `Last saved by ${email}`;
  return null;
}
