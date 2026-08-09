/**
 * NOTE: `/tissue-bank` is temporarily redirected to https://tissuesxdx.com in
 * `next.config.ts` so this route does not run (avoids heavy DB work). Keep this
 * implementation; remove the redirect when bringing the catalog back on-site.
 */
import type { Metadata } from "next";
import Link from "next/link";

import {
  TissuePublicCatalogTable,
  TissueTypePills,
} from "@/components/tissue/tissue-bank-public-client";
import { TissueExportCsvButtons } from "@/components/tissue/tissue-export-csv-buttons";
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
  getTissueChartsPublicCatalog,
  getTissueMetricsPublic,
  getTissueTypeOptionsPublicFull,
  listTissuePublic,
} from "@/lib/tissue/list-tissue";
import {
  parseTissueSearchParams,
  serializeTissueQuery,
} from "@/lib/tissue/search-params";
import { marketingMetadata } from "@/lib/site-seo";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata({
    title: "Research Tissue Bank | Consented Specimens for Preclinical Research | PathXDx",
    description:
      "Research-consented human and animal specimens for preclinical and translational programs. Searchable by tissue type and specimen characteristics.",
    path: "/tissue-bank",
  });
}

const fieldClass =
  "border-white/[0.12] bg-white/[0.04] text-foreground shadow-none backdrop-blur-sm";

export default async function TissueBankPage({
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
      listTissuePublic(parsed),
      getTissueMetricsPublic(parsed.filters),
      getTissueChartsPublicCatalog(),
      getTissueTypeOptionsPublicFull(),
    ]);
  } catch (e) {
    console.error(e);
    loadError =
      "Could not load tissue catalog. Ensure Supabase migration is applied and SUPABASE_SERVICE_ROLE_KEY is set on the server.";
    list = { rows: [], total: 0, page: 1, pageSize: 60 };
    metrics = { total: 0, tissueTypes: 0, female: 0, male: 0, malignant: 0 };
    charts = { topTissues: [], categoryCounts: [] };
  }

  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));

  const exportFilteredHref = `/api/tissue-bank/export${serializeTissueQuery({ ...parsed, basePath: "" })}`;
  const exportAllHref = "/api/tissue-bank/export";

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1300px] px-4 py-10 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            PathXDx
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Tissue Blocks
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Public catalog of available blocks. Data is loaded securely on the
            server. No database credentials are exposed in the browser.
          </p>
        </div>

        {loadError ? (
          <Card className="mt-8 border-destructive/30 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-lg">Catalog unavailable</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Total blocks", val: metrics.total, sub: "Matching filters" },
            { label: "Tissue types", val: metrics.tissueTypes, sub: "Unique (sampled)" },
            { label: "Female", val: metrics.female, sub: "Matching filters" },
            { label: "Male", val: metrics.male, sub: "Matching filters" },
            { label: "Malignant", val: metrics.malignant, sub: "Matching filters" },
          ].map((m) => (
            <Card
              key={m.label}
              className="border-white/[0.08] bg-card/50 shadow-none backdrop-blur-xl"
            >
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

        <div className="mt-8">
          <TissueChartsView
            charts={charts}
            catalogWideCaption="Top tissue types and diagnosis categories reflect the full available catalog (not narrowed by filters below)."
          />
        </div>

        <Card className="mt-8 border-white/[0.08] bg-card/50 shadow-none backdrop-blur-xl">
          <CardContent className="pt-6">
            <TissueTypePills tissueTypes={tissueOptions} parsed={parsed} />
          </CardContent>
        </Card>

        <Card className="mt-6 border-white/[0.08] bg-card/50 shadow-none backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg">Filter inventory</CardTitle>
            <CardDescription>
              Refine the table; URL updates for sharing. Summary metrics at the
              top match these filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              method="get"
              action="/tissue-bank"
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
                <Label>Catalog ID</Label>
                <Input
                  name="catalogId"
                  defaultValue={parsed.filters.catalogId ?? ""}
                  placeholder="e.g. PTDX-PB-"
                  className={fieldClass}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" className="font-medium">
                  Apply
                </Button>
                <Button asChild variant="ghost" type="button">
                  <Link href="/tissue-bank">Clear</Link>
                </Button>
              </div>
            </form>
            <div className="mt-6 border-t border-white/[0.08] pt-6">
              <TissueExportCsvButtons
                exportFilteredUrl={exportFilteredHref}
                exportAllUrl={exportAllHref}
                variant="marketing"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 border-white/[0.08] bg-card/50 shadow-none backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Inventory</CardTitle>
              <CardDescription>
                {list.total.toLocaleString()} blocks. Click a row for full
                diagnosis
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TissuePublicCatalogTable rows={list.rows} parsed={parsed} />
          </CardContent>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.08] px-4 py-3 text-sm text-muted-foreground">
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
                  basePath: "/tissue-bank",
                })}
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-xs hover:bg-white/[0.06]",
                  parsed.pageSize === ps && "font-semibold text-foreground",
                )}
              >
                {ps}
              </Link>
            ))}
            <Link
              className={cn(
                "rounded-md px-2 py-1 hover:bg-white/[0.06]",
                list.page <= 1 && "pointer-events-none opacity-40",
              )}
              href={serializeTissueQuery({
                ...parsed,
                page: list.page - 1,
                basePath: "/tissue-bank",
              })}
            >
              ← Prev
            </Link>
            <span className="px-2">
              Page {list.page} / {totalPages}
            </span>
            <Link
              className={cn(
                "rounded-md px-2 py-1 hover:bg-white/[0.06]",
                list.page >= totalPages && "pointer-events-none opacity-40",
              )}
              href={serializeTissueQuery({
                ...parsed,
                page: list.page + 1,
                basePath: "/tissue-bank",
              })}
            >
              Next →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
