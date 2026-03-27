function coerceCm(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const n = parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

/** One-column display: L × W × H cm, or "Not entered" when all missing. */
export function formatTissueSizeCm(
  length: unknown,
  width: unknown,
  height: unknown,
): string {
  const l = coerceCm(length);
  const w = coerceCm(width);
  const h = coerceCm(height);
  if (l == null && w == null && h == null) return "Not entered";
  const fmt = (n: number | null) => (n == null ? "—" : String(n));
  return `${fmt(l)} × ${fmt(w)} × ${fmt(h)} cm`;
}

export function calcAge(dob: string | null | undefined): number | null {
  if (!dob || dob === "nan") return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const a = Math.floor(
    (new Date("2024-01-01").getTime() - d.getTime()) / 31557600000,
  );
  return a > 0 && a < 120 ? a : null;
}

/** Short local date/time for inventory event timestamps (ISO from DB). */
export function formatInventoryEventAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
