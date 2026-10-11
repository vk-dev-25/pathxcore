"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Check, ChevronDown, FileText, Loader2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExcelStatusColumnFilter } from "@/components/pathx/excel-status-column-filter";
import { InvoicePreviewDialog } from "@/components/pathx/invoice-preview-dialog";
import { getInvoiceDetailAction } from "@/lib/invoices/get-invoice-detail-action";
import {
  invoiceDetailToPreview,
  type InvoicePreviewData,
} from "@/lib/invoices/invoice-preview";
import { formatShortDateTime } from "@/lib/format-audit-trail";
import { patchInvoiceStatusAction } from "@/lib/invoices/patch-invoice-status-action";
import { isInvoiceOverdue, type InvoiceStatus } from "@/lib/invoices/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  pathxCardClass as cardClass,
  pathxFieldClass as fieldClass,
} from "@/components/pathx/workspace-field-classes";

export type InvoiceListRow = {
  id: string;
  client_org_name: string | null;
  contact_name: string | null;
  project_title: string | null;
  invoice_reference: string | null;
  total_amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  last_updated_by_email: string | null;
};

type SortKey = "date_desc" | "date_asc" | "due_asc" | "due_desc" | "company_asc" | "company_desc";

const INVOICE_STATUS_ORDER: InvoiceStatus[] = ["created", "sent", "paid", "cancelled"];

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function haystack(row: InvoiceListRow): string {
  return [
    row.client_org_name,
    row.contact_name,
    row.project_title,
    row.invoice_reference,
    row.status,
    row.last_updated_by_email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function InvoiceFinderClient({ invoices }: { invoices: InvoiceListRow[] }) {
  const router = useRouter();
  const [statusPending, startStatusTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [statusIncluded, setStatusIncluded] = useState(
    () => new Set<InvoiceStatus>(INVOICE_STATUS_ORDER),
  );
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<InvoicePreviewData | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusUiOverride, setStatusUiOverride] = useState<
    Partial<Record<string, InvoiceStatus>>
  >({});

  const filteredSorted = useMemo(() => {
    let rows = invoices.filter((r) => statusIncluded.has(r.status));
    const q = query.trim().toLowerCase();
    if (q) rows = rows.filter((r) => haystack(r).includes(q));

    const companyKey = (r: InvoiceListRow) =>
      (r.client_org_name ?? "").trim().toLowerCase() || "\uffff";
    const dueTs = (r: InvoiceListRow) => (r.due_date ? new Date(r.due_date).getTime() : Number.MAX_SAFE_INTEGER);

    switch (sort) {
      case "date_desc":
        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "date_asc":
        rows.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "due_asc":
        rows.sort((a, b) => dueTs(a) - dueTs(b));
        break;
      case "due_desc":
        rows.sort((a, b) => dueTs(b) - dueTs(a));
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
  }, [invoices, query, sort, statusIncluded]);

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
            Invoice finder
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Search and sort invoices. Overdue invoices (past due date and not paid/cancelled)
            are highlighted in red.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild className="font-medium">
              <Link href="/pathx/quotes">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Create from quote
              </Link>
            </Button>
          </div>
        </div>

        <Card className={cn(cardClass, "mt-10")}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Filter &amp; sort</CardTitle>
            <CardDescription>
              Search and sort. Status filtering uses the funnel control on the Status
              column in the table below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="invoice-search" className="text-foreground">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invoice-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Company, contact, project, reference, status…"
                  className={cn("pl-9", fieldClass)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="w-full space-y-2 sm:w-56">
              <Label htmlFor="invoice-sort" className="text-foreground">
                Sort by
              </Label>
              <select
                id="invoice-sort"
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
                <option value="due_asc" className="bg-card text-foreground">
                  Due date (earliest first)
                </option>
                <option value="due_desc" className="bg-card text-foreground">
                  Due date (latest first)
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

        {statusError ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {statusError}
          </p>
        ) : null}

        <p className="mt-6 text-sm text-muted-foreground">
          {filteredSorted.length === invoices.length
            ? `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`
            : `${filteredSorted.length} of ${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        </p>

        {previewError ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {previewError}
          </p>
        ) : null}

        {invoices.length === 0 ? (
          <Card className={cn(cardClass, "mt-6 border-dashed")}>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No invoices yet. Open a quote and create your first invoice.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card/60 dark:border-white/[0.08] dark:bg-card/40">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground dark:border-white/[0.08]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3 align-bottom">
                    <ExcelStatusColumnFilter
                      allValues={INVOICE_STATUS_ORDER}
                      included={statusIncluded}
                      setIncluded={setStatusIncluded}
                    />
                  </th>
                  <th className="w-[72px] px-2 py-3 text-center">PDF</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="min-w-[168px] px-4 py-3">Last saved</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.length === 0 ? (
                  <tr className="border-b border-border dark:border-white/[0.06]">
                    <td colSpan={9} className="px-4 py-10 text-center align-top">
                      <div className="mx-auto max-w-md space-y-3 text-sm text-muted-foreground">
                        {statusIncluded.size === 0 ? (
                          <>
                            <p className="text-foreground">
                              No statuses selected. Use the Status column header (funnel
                              icon) to check at least one value.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="font-medium"
                              onClick={() =>
                                setStatusIncluded(new Set(INVOICE_STATUS_ORDER))
                              }
                            >
                              Show all statuses
                            </Button>
                          </>
                        ) : query.trim() ? (
                          <p>No invoices match your search.</p>
                        ) : (
                          <>
                            <p>No invoices match the current status selection.</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="font-medium"
                              onClick={() =>
                                setStatusIncluded(new Set(INVOICE_STATUS_ORDER))
                              }
                            >
                              Show all statuses
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSorted.map((row) => {
                  const displayStatus = statusUiOverride[row.id] ?? row.status;
                  const overdue = isInvoiceOverdue({
                    status: displayStatus,
                    due_date: row.due_date,
                  });
                  return (
                    <tr
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50 dark:border-white/[0.06] dark:hover:bg-white/[0.06]",
                        overdue && "bg-destructive/5",
                      )}
                      onClick={() => {
                        window.location.href = `/pathx/invoices/${row.id}`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          window.location.href = `/pathx/invoices/${row.id}`;
                        }
                      }}
                    >
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                        {formatDate(row.created_at)}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-3 tabular-nums",
                          overdue ? "font-medium text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {row.due_date ? formatDate(row.due_date) : "—"}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground">
                        {row.client_org_name ?? "—"}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                        {row.project_title?.trim() ? row.project_title.trim() : "—"}
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-muted-foreground">
                        {row.invoice_reference ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={statusPending}
                                className="h-8 min-w-[132px] justify-between gap-2 capitalize"
                                aria-label={`Invoice status: ${displayStatus}. Change status.`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>{displayStatus}</span>
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-44"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {INVOICE_STATUS_ORDER.map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  className="flex cursor-pointer items-center justify-between gap-3 capitalize"
                                  onSelect={() => {
                                    if (s === displayStatus) return;
                                    setStatusError(null);
                                    startStatusTransition(async () => {
                                      const res = await patchInvoiceStatusAction(row.id, s);
                                      if (!res.ok) {
                                        setStatusError(res.error);
                                        return;
                                      }
                                      setStatusUiOverride((m) => ({ ...m, [row.id]: s }));
                                      await router.refresh();
                                      setStatusUiOverride((m) => {
                                        const next = { ...m };
                                        delete next[row.id];
                                        return next;
                                      });
                                    });
                                  }}
                                >
                                  {s}
                                  {displayStatus === s ? (
                                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                                  ) : (
                                    <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {overdue ? (
                            <span className="text-xs font-medium uppercase tracking-wide text-destructive">
                              Overdue
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td
                        className="px-2 py-2 text-center"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Preview PDF"
                          disabled={previewLoadingId === row.id}
                          onClick={async () => {
                            setPreviewError(null);
                            setPreviewLoadingId(row.id);
                            const res = await getInvoiceDetailAction(row.id);
                            setPreviewLoadingId(null);
                            if (!res.ok) {
                              setPreviewError(res.error);
                              return;
                            }
                            setPreviewData(invoiceDetailToPreview(res.data));
                            setPreviewOpen(true);
                          }}
                        >
                          {previewLoadingId === row.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-primary">
                        {money(row.total_amount)}
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
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InvoicePreviewDialog
        open={previewOpen}
        onOpenChange={(o) => {
          setPreviewOpen(o);
          if (!o) setPreviewData(null);
        }}
        data={previewData}
      />
    </div>
  );
}
