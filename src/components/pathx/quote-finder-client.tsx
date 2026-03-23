"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { QuoteSavedPreviewDialog } from "@/components/pathx/quote-saved-preview-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type QuoteListRow = {
  id: string;
  client_org_name: string | null;
  contact_name: string | null;
  project_title: string | null;
  quote_reference: string | null;
  total_amount: number;
  created_at: string;
};

const fieldClass =
  "border-white/[0.12] bg-white/[0.04] text-foreground shadow-none backdrop-blur-sm placeholder:text-muted-foreground focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0";

const cardClass =
  "border border-white/[0.08] bg-card/50 shadow-none backdrop-blur-xl";

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
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function QuoteFinderClient({ quotes }: { quotes: QuoteListRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [previewId, setPreviewId] = useState<string | null>(null);

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
            Search and sort quotes you have saved. Only your own quotes are shown.
            Click a row to preview, print, or download JSON.
          </p>
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
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {quotes.length === 0
                ? "No saved quotes yet. Create one in Quote builder."
                : "No quotes match your search."}
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/[0.08] bg-card/40">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((row) => (
                  <tr
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer border-b border-white/[0.06] transition-colors hover:bg-white/[0.06] last:border-0"
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
