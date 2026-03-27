"use client";

import Link from "next/link";
import { useState } from "react";

import { TissueInventoryDetailDialog } from "@/components/tissue/tissue-inventory-detail-dialog";
import {
  TissueRowActions,
  TissueRowEventDetails,
} from "@/components/tissue/tissue-bank-internal-client";
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

function statusStyle(s: string) {
  if (s === "available") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (s === "sold") return "bg-primary/15 text-primary";
  if (s === "discarded") return "bg-muted text-muted-foreground";
  return "bg-muted";
}

export function TissueInternalInventoryTable({
  rows,
  parsed,
  basePath,
}: {
  rows: TissueInventoryRow[];
  parsed: Parsed;
  basePath: string;
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
        <table className="w-full min-w-[1160px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">
                <SortLink
                  label="Catalog ID"
                  col="catalog_id"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-4 py-3">
                <SortLink
                  label="Accession"
                  col="accession"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sold / discarded</th>
              <th className="px-4 py-3">
                <SortLink label="Tissue" col="tissue" current={parsed} basePath={basePath} />
              </th>
              <th className="px-4 py-3">Size (cm)</th>
              <th className="px-4 py-3">
                <SortLink
                  label="Category"
                  col="category"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
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
              <th className="w-[120px] px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                role="button"
                tabIndex={0}
                className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/50"
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
                <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs">
                  {r.accession || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                      statusStyle(r.status),
                    )}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <TissueRowEventDetails row={r} />
                </td>
                <td className="max-w-[120px] truncate px-4 py-3">{r.tissue}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {formatTissueSizeCm(
                    r.size_length_cm,
                    r.size_width_cm,
                    r.size_height_cm,
                  )}
                </td>
                <td className="px-4 py-3">{r.category}</td>
                <td className="px-4 py-3">{r.gender ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">
                  {calcAge(r.dob) ?? "—"}
                </td>
                <td className="max-w-[220px] px-4 py-3 text-muted-foreground">
                  <span className="line-clamp-2">{r.diag_short || "—"}</span>
                </td>
                <td
                  className="px-4 py-3 text-right align-middle"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <TissueRowActions id={r.id} status={r.status} />
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
        variant="dashboard"
      />
    </>
  );
}
