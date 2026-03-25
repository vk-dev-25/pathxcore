import type { TissueCharts } from "@/lib/tissue/types";
import { cn } from "@/lib/utils";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(173 72% 42%)",
  "hsl(286 100% 68%)",
  "hsl(239 45% 55%)",
  "hsl(38 92% 50%)",
  "hsl(0 72% 51%)",
];

export function TissueChartsView({
  charts,
  variant = "marketing",
  catalogWideCaption,
}: {
  charts: TissueCharts;
  variant?: "marketing" | "dashboard";
  /** When set, explains that charts reflect the full catalog (not current filters). */
  catalogWideCaption?: string;
}) {
  const maxT = Math.max(1, ...charts.topTissues.map((t) => t.count));
  const displayCategories = charts.categoryCounts.filter(
    (c) => c.label !== "Other" || c.count > 0,
  );
  const maxC = Math.max(1, ...displayCategories.map((c) => c.count));

  const panel = cn(
    "rounded-xl border p-4",
    variant === "marketing"
      ? "border-white/[0.08] bg-card/50 backdrop-blur-xl"
      : "border-border bg-card shadow-none",
  );
  const barTrack =
    variant === "marketing" ? "bg-white/[0.06]" : "bg-muted";

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      {catalogWideCaption ? (
        <p className="col-span-full text-xs text-muted-foreground lg:col-span-2">
          {catalogWideCaption}
        </p>
      ) : null}
      <div className={panel}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Top tissue types
        </p>
        <div className="mt-4 space-y-2">
          {charts.topTissues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data.</p>
          ) : (
            charts.topTissues.map((t, i) => (
              <div key={t.label} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{ background: COLORS[i % COLORS.length] }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {t.label}
                </span>
                <span className="tabular-nums text-foreground">{t.count}</span>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 space-y-2">
          {charts.topTissues.slice(0, 8).map((t, i) => (
            <div key={`bar-${t.label}`} className={cn("h-2 overflow-hidden rounded", barTrack)}>
              <div
                className="h-full rounded"
                style={{
                  width: `${(t.count / maxT) * 100}%`,
                  background: COLORS[i % COLORS.length],
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className={panel}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Diagnosis category
        </p>
        <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
          {displayCategories.map((c) => (
            <li key={c.label} className="flex justify-between gap-2">
              <span>{c.label}</span>
              <span className="tabular-nums text-foreground">{c.count}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2">
          {displayCategories.map((c) => (
            <div key={`cat-${c.label}`} className={cn("h-2 overflow-hidden rounded", barTrack)}>
              <div
                className="h-full rounded bg-primary/70"
                style={{ width: `${(c.count / maxC) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
