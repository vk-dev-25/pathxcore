import type { Metadata } from "next";
import Link from "next/link";

import { TissueAddBlockCollapsible } from "@/components/tissue/tissue-add-block-collapsible";
import { TissueInternalInventoryTable } from "@/components/tissue/tissue-internal-inventory-table";
import { TissueExportCsvButtons } from "@/components/tissue/tissue-export-csv-buttons";
import { TissueTypePills } from "@/components/tissue/tissue-bank-public-client";
import { TissueChartsView } from "@/components/tissue/tissue-charts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getTissueChartsInternal,
  getTissueMetricsInternal,
  getTissueTypeOptionsInternalFull,
  listTissueInternal,
} from "@/lib/tissue/list-tissue";
import {
  parseTissueSearchParams,
  serializeTissueQuery,
} from "@/lib/tissue/search-params";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tissue Blocks | PathX",
  description: "Internal tissue inventory — filters, status, and export.",
};

const BASE = "/pathx/tissue-bank";

const fieldClass =
  "border-border/80 bg-background/80 text-foreground shadow-none";

export default async function PathXTissueBankPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const parsed = parseTissueSearchParams(sp);

  let list;
  let metrics;
  let charts;
  let tissueOptions: string[] = [];
  let loadError: string | null = null;

  try {
    [list, metrics, charts, tissueOptions] = await Promise.all([
      listTissueInternal(parsed),
      getTissueMetricsInternal(parsed.filters),
      getTissueChartsInternal(parsed.filters),
      getTissueTypeOptionsInternalFull(),
    ]);
  } catch (e) {
    console.error(e);
    loadError =
      "Could not load tissue inventory. Ensure the migration is applied and Supabase is reachable.";
    list = { rows: [], total: 0, page: 1, pageSize: 60 };
    metrics = { total: 0, tissueTypes: 0, female: 0, male: 0, malignant: 0 };
    charts = { topTissues: [], categoryCounts: [] };
  }

  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));
  const exportFilteredHref = `/api/tissue-bank/export${serializeTissueQuery({ ...parsed, basePath: "" })}`;
  const exportAllHref = "/api/tissue-bank/export";

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-10 sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          PathX workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tissue Blocks</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Internal inventory: add blocks, change status, and export. Public
          catalog:{" "}
          <Link
            href="/tissue-bank"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            /tissue-bank
          </Link>
          .
        </p>
      </div>

      <TissueAddBlockCollapsible />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total blocks", val: metrics.total, sub: "Matching filters" },
          { label: "Tissue types", val: metrics.tissueTypes, sub: "Unique (sampled)" },
          { label: "Female", val: metrics.female, sub: "Matching filters" },
          { label: "Male", val: metrics.male, sub: "Matching filters" },
          { label: "Malignant", val: metrics.malignant, sub: "Matching filters" },
        ].map((m) => (
          <Card key={m.label} className="border-border/80 shadow-none">
            <CardHeader className="p-4 pb-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {m.label}
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {m.val.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">{m.sub}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {loadError ? (
        <Card className="mt-8 border-destructive/30 bg-destructive/10 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Inventory unavailable</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="mt-8">
        <TissueChartsView
          charts={charts}
          variant="dashboard"
          catalogWideCaption="Top tissue types and diagnosis categories reflect rows matching your current filters (all statuses)."
        />
      </div>

      <Card className="mt-8 border-border/80 shadow-none">
        <CardContent className="pt-6">
          <TissueTypePills
            tissueTypes={tissueOptions}
            parsed={parsed}
            basePath={BASE}
            variant="dashboard"
          />
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/80 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Filter inventory</CardTitle>
          <CardDescription>
            Refine the table; URL updates for sharing. Summary metrics at the top
            match these filters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            action={BASE}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <input type="hidden" name="sort" value={parsed.sort} />
            <input type="hidden" name="dir" value={parsed.sortDir} />
            <input type="hidden" name="pageSize" value={String(parsed.pageSize)} />
            <div className="space-y-2">
              <Label>Tissue type</Label>
              <select
                name="tissue"
                defaultValue={parsed.filters.tissue ?? ""}
                className={cn(
                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                  fieldClass,
                )}
              >
                <option value="">All tissues</option>
                {tissueOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Diagnosis keyword</Label>
              <Input
                name="diagnosis"
                defaultValue={parsed.filters.diagnosis ?? ""}
                placeholder="e.g. leukemia, adenocarcinoma…"
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                name="category"
                defaultValue={parsed.filters.category ?? ""}
                className={cn(
                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                  fieldClass,
                )}
              >
                <option value="">All</option>
                <option>Malignant</option>
                <option>Benign</option>
                <option>Normal/Control</option>
                <option>Pre-malignant</option>
                <option>Unknown</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <select
                name="gender"
                defaultValue={parsed.filters.gender ?? ""}
                className={cn(
                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                  fieldClass,
                )}
              >
                <option value="">All</option>
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                defaultValue={parsed.filters.status ?? ""}
                className={cn(
                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                  fieldClass,
                )}
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="discarded">Discarded</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Catalog ID</Label>
              <Input
                name="catalogId"
                defaultValue={parsed.filters.catalogId ?? ""}
                placeholder="Partial match"
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label>Accession</Label>
              <Input
                name="accession"
                defaultValue={parsed.filters.accession ?? ""}
                placeholder="Partial match"
                className={fieldClass}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="font-medium">
                Apply
              </Button>
              <Button asChild variant="ghost" type="button">
                <Link href={BASE}>Clear</Link>
              </Button>
            </div>
          </form>
          <div className="mt-6 border-t border-border pt-6">
            <TissueExportCsvButtons
              exportFilteredUrl={exportFilteredHref}
              exportAllUrl={exportAllHref}
              variant="marketing"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 border-border/80 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Inventory</CardTitle>
          <CardDescription>{list.total.toLocaleString()} blocks</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TissueInternalInventoryTable
            rows={list.rows}
            parsed={parsed}
            basePath={BASE}
          />
        </CardContent>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span className="mr-auto">
            {list.total === 0
              ? "0"
              : `${(list.page - 1) * list.pageSize + 1}–${Math.min(
                  list.page * list.pageSize,
                  list.total,
                )}`}{" "}
            of {list.total.toLocaleString()}
          </span>
          <span className="text-xs">Rows per page:</span>
          {[20, 60, 120].map((ps) => (
            <Link
              key={ps}
              href={serializeTissueQuery({
                ...parsed,
                page: 1,
                pageSize: ps,
                basePath: BASE,
              })}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs hover:bg-muted",
                parsed.pageSize === ps && "font-semibold text-foreground",
              )}
            >
              {ps}
            </Link>
          ))}
          <Link
            className={cn(
              "rounded-md px-2 py-1 hover:bg-muted",
              list.page <= 1 && "pointer-events-none opacity-40",
            )}
            href={serializeTissueQuery({
              ...parsed,
              page: list.page - 1,
              basePath: BASE,
            })}
          >
            ← Prev
          </Link>
          <span className="px-2">
            Page {list.page} / {totalPages}
          </span>
          <Link
            className={cn(
              "rounded-md px-2 py-1 hover:bg-muted",
              list.page >= totalPages && "pointer-events-none opacity-40",
            )}
            href={serializeTissueQuery({
              ...parsed,
              page: list.page + 1,
              basePath: BASE,
            })}
          >
            Next →
          </Link>
        </div>
      </Card>
    </div>
  );
}
