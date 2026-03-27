"use client";

import Link from "next/link";
import { useState } from "react";

import { TissueInventoryDetailDialog } from "@/components/tissue/tissue-inventory-detail-dialog";
import { calcAge, formatTissueSizeCm } from "@/lib/tissue/format";
import { serializeTissueQuery } from "@/lib/tissue/search-params";
import type {
  TissueInventoryRow,
  TissueListFilters,
  TissueSortKey,
} from "@/lib/tissue/types";
import { cn } from "@/lib/utils";

type Parsed = {
  page: number;
  pageSize: number;
  sort: TissueSortKey;
  sortDir: "asc" | "desc";
  filters: TissueListFilters;
};

function SortLink({
  label,
  col,
  current,
  basePath,
}: {
  label: string;
  col: TissueSortKey;
  current: Parsed;
  basePath: string;
}) {
  const nextDir =
    current.sort === col && current.sortDir === "asc" ? "desc" : "asc";
  const href = serializeTissueQuery({
    ...current,
    sort: col,
    sortDir: nextDir,
    page: 1,
    basePath,
  });
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <span className="text-[10px] opacity-50">
        {current.sort === col ? (current.sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </Link>
  );
}

export function TissueTypePills({
  tissueTypes,
  parsed,
  basePath = "/tissue-bank",
  variant = "marketing",
}: {
  tissueTypes: string[];
  parsed: Parsed;
  basePath?: string;
  variant?: "marketing" | "dashboard";
}) {
  const active = parsed.filters.tissue ?? "";

  function hrefForTissue(tissue: string | undefined) {
    return serializeTissueQuery({
      ...parsed,
      page: 1,
      filters: { ...parsed.filters, tissue: tissue || undefined },
      basePath,
    });
  }

  const inactivePill =
    variant === "marketing"
      ? "border-white/[0.12] bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground"
      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground";
  const activePill = "border-primary/50 bg-primary/15 text-foreground";

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Tissue type
      </p>
      <div className="-mx-1 flex max-h-[min(40vh,320px)] flex-wrap gap-2 overflow-y-auto px-1 pb-1">
        <Link
          href={hrefForTissue(undefined)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            !active ? activePill : inactivePill,
          )}
        >
          All tissues
        </Link>
        {tissueTypes.map((t) => (
          <Link
            key={t}
            href={hrefForTissue(t)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active === t ? activePill : inactivePill,
            )}
          >
            {t}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TissuePublicCatalogTable({
  rows,
  parsed,
  basePath = "/tissue-bank",
}: {
  rows: TissueInventoryRow[];
  parsed: Parsed;
  basePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TissueInventoryRow | null>(null);

  function openRow(r: TissueInventoryRow) {
    setSelected(r);
    setOpen(true);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1020px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">
                <SortLink
                  label="Catalog ID"
                  col="catalog_id"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-4 py-3">
                <SortLink label="Tissue" col="tissue" current={parsed} basePath={basePath} />
              </th>
              <th className="px-4 py-3">
                <SortLink label="Category" col="category" current={parsed} basePath={basePath} />
              </th>
              <th className="px-4 py-3">Size (cm)</th>
              <th className="px-4 py-3">
                <SortLink label="Gender" col="gender" current={parsed} basePath={basePath} />
              </th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">
                <SortLink
                  label="Primary diagnosis"
                  col="diag_short"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                role="button"
                tabIndex={0}
                className="cursor-pointer border-b border-white/[0.06] last:border-0 hover:bg-white/[0.04]"
                onClick={() => openRow(r)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openRow(r);
                  }
                }}
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                  {r.catalog_id || "—"}
                </td>
                <td className="max-w-[140px] truncate px-4 py-3">{r.tissue}</td>
                <td className="px-4 py-3">{r.category}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {formatTissueSizeCm(
                    r.size_length_cm,
                    r.size_width_cm,
                    r.size_height_cm,
                  )}
                </td>
                <td className="px-4 py-3">{r.gender ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">
                  {calcAge(r.dob) ?? "—"}
                </td>
                <td className="max-w-[320px] px-4 py-3 text-muted-foreground">
                  <span className="line-clamp-2">{r.diag_short || "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TissueInventoryDetailDialog
        row={selected}
        open={open}
        onOpenChange={setOpen}
        variant="marketing"
      />
    </>
  );
}
