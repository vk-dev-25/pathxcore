"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, FileText, Plus, Search, Settings2 } from "lucide-react";

import { QuoteSavedPreviewDialog } from "@/components/pathx/quote-saved-preview-dialog";
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
import { formatShortDateTime } from "@/lib/format-audit-trail";
import { cn } from "@/lib/utils";

import {
  pathxCardClass as cardClass,
  pathxFieldClass as fieldClass,
} from "@/components/pathx/workspace-field-classes";

export type QuoteListRow = {
  id: string;
  client_org_name: string | null;
  contact_name: string | null;
  project_title: string | null;
  quote_reference: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  created_by_email: string | null;
  last_updated_by_email: string | null;
  /** Signed-in user can open edit (shared workspace). */
  can_edit?: boolean;
};

type SortKey = "date_desc" | "date_asc" | "company_asc" | "company_desc";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function haystack(q: QuoteListRow): string {
  return [
    q.client_org_name,
    q.contact_name,
    q.project_title,
    q.quote_reference,
    q.created_by_email,
    q.last_updated_by_email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function QuoteFinderClient({
  quotes,
  initialQuery = "",
  initialPreviewId = null,
}: {
  quotes: QuoteListRow[];
  initialQuery?: string;
  initialPreviewId?: string | null;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [previewId, setPreviewId] = useState<string | null>(initialPreviewId);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? quotes.filter((r) => haystack(r).includes(q))
      : [...quotes];

    const companyKey = (r: QuoteListRow) =>
      (r.client_org_name ?? "").trim().toLowerCase() || "\uffff";

    switch (sort) {
      case "date_desc":
        rows.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "date_asc":
        rows.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
      case "company_asc":
        rows.sort((a, b) => companyKey(a).localeCompare(companyKey(b)));
        break;
      case "company_desc":
        rows.sort((a, b) => companyKey(b).localeCompare(companyKey(a)));
        break;
      default:
        break;
    }
    return rows;
  }, [quotes, query, sort]);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            PathX module
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Quote finder
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Search and sort saved quotes from everyone on PathX. Click a row to
            preview, print, or download JSON.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild className="font-medium">
              <Link href="/pathx/quotebuilder">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                New quote
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-medium"
            >
              <Link href="/pathx/invoices">
                <FileText className="mr-2 h-4 w-4" aria-hidden />
                Invoices
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-medium"
            >
              <Link href="/pathx/admin/pricing">
                <Settings2 className="mr-2 h-4 w-4" aria-hidden />
                Quote price config
              </Link>
            </Button>
          </div>
        </div>

        <Card className={cn(cardClass, "mt-10")}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Filter &amp; sort</CardTitle>
            <CardDescription>
              Match text in organization, contact, project, or reference. Sort by
              date or company name.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="quote-search" className="text-foreground">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="quote-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Company, contact, project, reference…"
                  className={cn("pl-9", fieldClass)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="w-full space-y-2 sm:w-56">
              <Label htmlFor="quote-sort" className="text-foreground">
                Sort by
              </Label>
              <select
                id="quote-sort"
                className={cn(
                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                  fieldClass,
                )}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="date_desc" className="bg-card text-foreground">
                  Date (newest first)
                </option>
                <option value="date_asc" className="bg-card text-foreground">
                  Date (oldest first)
                </option>
                <option value="company_asc" className="bg-card text-foreground">
                  Company (A–Z)
                </option>
                <option value="company_desc" className="bg-card text-foreground">
                  Company (Z–A)
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-sm text-muted-foreground">
          {filteredSorted.length === quotes.length
            ? `${quotes.length} quote${quotes.length === 1 ? "" : "s"}`
            : `${filteredSorted.length} of ${quotes.length} quote${quotes.length === 1 ? "" : "s"}`}
        </p>

        {filteredSorted.length === 0 ? (
          <Card className={cn(cardClass, "mt-6 border-dashed")}>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center text-sm text-muted-foreground">
              {quotes.length === 0 ? (
                <>
                  <p>No saved quotes yet. Create one to get started.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild size="sm" className="font-medium">
                      <Link href="/pathx/quotebuilder">
                        <Plus className="mr-2 h-4 w-4" aria-hidden />
                        New quote
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="font-medium">
                      <Link href="/pathx/admin/pricing">
                        <Settings2 className="mr-2 h-4 w-4" aria-hidden />
                        Quote price config
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                "No quotes match your search."
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card/60 dark:border-white/[0.08] dark:bg-card/40">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground dark:border-white/[0.08]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="min-w-[160px] px-4 py-3">Created</th>
                  <th className="min-w-[160px] px-4 py-3">Last updated</th>
                  <th className="w-[200px] px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((row) => (
                  <tr
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50 dark:border-white/[0.06] dark:hover:bg-white/[0.06]"
                    onClick={() => setPreviewId(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPreviewId(row.id);
                      }
                    }}
                  >
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground">
                      {row.client_org_name ?? "—"}
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-3 text-muted-foreground">
                      {row.quote_reference ?? "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                      {row.project_title ?? "—"}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-muted-foreground">
                      {row.contact_name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-primary">
                      {money(row.total_amount)}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top text-xs text-muted-foreground">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground/90">
                          {row.created_by_email?.trim() || "—"}
                        </div>
                        <div className="tabular-nums">
                          {formatShortDateTime(row.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top text-xs text-muted-foreground">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground/90">
                          {row.last_updated_by_email?.trim() || "—"}
                        </div>
                        <div className="tabular-nums">
                          {formatShortDateTime(row.updated_at)}
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-4 py-2 text-right"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {row.can_edit ? (
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                            <Link href={`/pathx/quotes/${row.id}/edit`}>Edit</Link>
                          </Button>
                        ) : null}
                        <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                          <Link href={`/pathx/quotebuilder?copyFrom=${encodeURIComponent(row.id)}`}>
                            <Copy className="mr-1 h-3.5 w-3.5" aria-hidden />
                            Copy
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <QuoteSavedPreviewDialog
          quoteId={previewId}
          open={previewId !== null}
          onOpenChange={(o) => {
            if (!o) setPreviewId(null);
          }}
        />
      </div>
    </div>
  );
}
