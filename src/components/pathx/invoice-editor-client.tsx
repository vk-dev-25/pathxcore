"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { FileText, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InvoicePreviewDialog } from "@/components/pathx/invoice-preview-dialog";
import { formatAuditTrail } from "@/lib/format-audit-trail";
import { updateInvoiceAction } from "@/lib/invoices/update-invoice-action";
import { invoiceDraftToPreview } from "@/lib/invoices/invoice-preview";
import { isInvoiceOverdue, type InvoiceStatus } from "@/lib/invoices/types";
import {
  SEGMENT_OPTIONS,
  computeQuoteTotals,
  defaultPricingSettings,
  type PricingSettingsSnapshot,
  type Segment,
} from "@/lib/quote-pricing";
import { cn } from "@/lib/utils";

import {
  pathxCardClass as cardClass,
  pathxFieldClass as fieldClass,
} from "@/components/pathx/workspace-field-classes";

type CatalogServiceRow = {
  id: string;
  name: string;
  default_unit_price: number;
};

type DraftLine = {
  key: string;
  catalog_service_id: string | null;
  label: string;
  quantity: number;
  unit_price: number;
};

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function InvoiceEditorClient({
  invoice,
  catalog,
  pricingSettings: pricingSettingsProp,
}: {
  invoice: {
    id: string;
    source_quote_id: string | null;
    source_quote_reference: string | null;
    client_org_name: string;
    client_address: string;
    contact_name: string;
    project_title: string;
    invoice_reference: string;
    po_reference: string;
    status: InvoiceStatus;
    due_date: string;
    notes: string;
    segment: Segment;
    sample_volume: number;
    rush_priority: boolean;
    rush_2day: boolean;
    apply_volume_discount: boolean;
    created_at: string;
    updated_at: string;
    last_updated_by_email: string | null;
    lines: {
      id: string;
      catalog_service_id: string | null;
      label: string;
      quantity: number;
      unit_price: number;
    }[];
  };
  catalog: CatalogServiceRow[];
  pricingSettings?: PricingSettingsSnapshot;
}) {
  const router = useRouter();
  const pricingSettings = pricingSettingsProp ?? defaultPricingSettings();
  const [pending, startTransition] = useTransition();
  const [clientOrg, setClientOrg] = useState(invoice.client_org_name);
  const [clientAddress, setClientAddress] = useState(invoice.client_address);
  const [contactName, setContactName] = useState(invoice.contact_name);
  const [projectTitle, setProjectTitle] = useState(invoice.project_title);
  const invoiceRef = invoice.invoice_reference;
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status);
  const [dueDate, setDueDate] = useState(invoice.due_date);
  const [poReference, setPoReference] = useState(invoice.po_reference ?? "");
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [segment, setSegment] = useState<Segment>(invoice.segment);
  const [sampleVolume, setSampleVolume] = useState(invoice.sample_volume);
  const [rushPriority, setRushPriority] = useState(invoice.rush_priority);
  const [rush2day, setRush2day] = useState(invoice.rush_2day);
  const [applyVolumeDiscount, setApplyVolumeDiscount] = useState(
    invoice.apply_volume_discount,
  );
  const [pickId, setPickId] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [lines, setLines] = useState<DraftLine[]>(
    invoice.lines.map((line) => ({
      key: line.id,
      catalog_service_id: line.catalog_service_id,
      label: line.label,
      quantity: line.quantity,
      unit_price: line.unit_price,
    })),
  );

  const overdue = isInvoiceOverdue({ status, due_date: dueDate || null });
  const invoiceAuditLine = useMemo(
    () => formatAuditTrail(invoice.updated_at, invoice.last_updated_by_email),
    [invoice.updated_at, invoice.last_updated_by_email],
  );
  const totals = useMemo(
    () =>
      lines.length
        ? computeQuoteTotals(
            lines.map((line) => ({
              catalog_service_id: line.catalog_service_id,
              label: line.label,
              quantity: line.quantity,
              unit_price: line.unit_price,
              default_unit_price_snapshot: line.unit_price,
              is_price_overridden: false,
            })),
            segment,
            sampleVolume,
            rushPriority,
            rush2day,
            pricingSettings,
            { applyVolumeDiscount },
          )
        : null,
    [
      lines,
      segment,
      sampleVolume,
      rushPriority,
      rush2day,
      applyVolumeDiscount,
      pricingSettings,
    ],
  );
  const rpPct = pricingSettings.rush_priority_percent;
  const r2Pct = pricingSettings.rush_2day_percent;

  function addService() {
    if (!pickId) return;
    const selected = catalog.find((c) => c.id === pickId);
    if (!selected) return;
    const qty = Math.max(0.0001, addQty);
    setLines((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        catalog_service_id: selected.id,
        label: selected.name,
        quantity: qty,
        unit_price: selected.default_unit_price,
      },
    ]);
    setPickId("");
    setAddQty(1);
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((line) => line.key !== key));
  }

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function saveInvoice() {
    setError(null);
    startTransition(async () => {
      const res = await updateInvoiceAction({
        invoiceId: invoice.id,
        header: {
          client_org_name: clientOrg,
          client_address: clientAddress,
          contact_name: contactName,
          project_title: projectTitle,
          invoice_reference: invoiceRef,
          po_reference: poReference,
          notes,
          status,
          due_date: dueDate,
          segment,
          sample_volume: sampleVolume,
          rush_priority: rushPriority,
          rush_2day: rush2day,
          apply_volume_discount: applyVolumeDiscount,
        },
        lines: lines.map((line) => ({
          catalog_service_id: line.catalog_service_id,
          label: line.label,
          quantity: line.quantity,
          unit_price: line.unit_price,
        })),
      });
      if (res.ok) {
        router.push("/pathx/invoices");
      } else setError(res.error);
    });
  }

  const previewData = invoiceDraftToPreview({
    invoiceRef: invoiceRef,
    poReference,
    status,
    dueDate,
    createdAtIso: invoice.created_at,
    clientOrg,
    clientAddress,
    contactName,
    projectTitle,
    notes,
    lines: lines.map((l) => ({
      label: l.label,
      quantity: l.quantity,
      unit_price: l.unit_price,
    })),
    segment,
    sampleVolume,
    rushPriority,
    rush2day,
    applyVolumeDiscount,
    pricingSettings,
  });

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            PathX module
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Invoice editor
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Edit invoice details, pricing options, due date, status, and line
            items. Volume discount, segment, and rush match quote pricing.
          </p>
          {invoice.source_quote_id ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Source quote:{" "}
              <Link
                href={`/pathx/quotes?quoteId=${encodeURIComponent(invoice.source_quote_id)}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {invoice.source_quote_reference ?? invoice.source_quote_id}
              </Link>
            </p>
          ) : null}
          {invoiceAuditLine ? (
            <p className="mt-3 text-sm text-muted-foreground">{invoiceAuditLine}</p>
          ) : null}
        </div>

        {overdue ? (
          <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Overdue: this invoice is past due and not paid/cancelled.
          </div>
        ) : null}

        <Card className={cn(cardClass, "mt-8")}>
          <CardHeader>
            <CardTitle>Invoice details</CardTitle>
            <CardDescription>
              Header fields and lifecycle status.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice-ref">Invoice number</Label>
              <Input
                id="invoice-ref"
                value={invoiceRef}
                className={fieldClass}
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated number: year (Pacific) plus a 5-digit sequence
                starting at 02023 (e.g. PTDX-2026-02023). Linked quote is tracked
                separately.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-status">Status</Label>
              <select
                id="invoice-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className={cn(
                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                  fieldClass,
                )}
              >
                <option value="created">Created</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-due">Due date</Label>
              <Input
                id="invoice-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-po">PO reference</Label>
              <Input
                id="invoice-po"
                value={poReference}
                onChange={(e) => setPoReference(e.target.value)}
                placeholder="Optional"
                className={fieldClass}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="invoice-org">Client organization</Label>
              <Input
                id="invoice-org"
                value={clientOrg}
                onChange={(e) => setClientOrg(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-contact">Contact</Label>
              <Input
                id="invoice-contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-project">Project title</Label>
              <Input
                id="invoice-project"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="invoice-address">Client address</Label>
              <Input
                id="invoice-address"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className={fieldClass}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(cardClass, "mt-6")}>
          <CardHeader>
            <CardTitle>Segment & options</CardTitle>
            <CardDescription>
              Segment adjusts list pricing; volume can apply discount tiers;
              rush options add uplift on the amount after discounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-segment">Client segment</Label>
                <select
                  id="invoice-segment"
                  className={cn(
                    "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                    fieldClass,
                  )}
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as Segment)}
                >
                  {SEGMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-vol">Total sample / block volume</Label>
                <Input
                  id="invoice-vol"
                  type="number"
                  min={0}
                  step={1}
                  value={sampleVolume}
                  onChange={(e) =>
                    setSampleVolume(parseInt(e.target.value, 10) || 0)
                  }
                  className={fieldClass}
                />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={applyVolumeDiscount}
                onChange={(e) => setApplyVolumeDiscount(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-background/80 text-primary accent-primary focus:ring-2 focus:ring-primary/40"
              />
              <span>Apply volume discount</span>
            </label>
            <div className="flex flex-col gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3 sm:flex-row sm:items-center">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={rushPriority}
                  onChange={(e) => setRushPriority(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-background/80 text-primary accent-primary focus:ring-2 focus:ring-primary/40"
                />
                <span>
                  Rush / priority{" "}
                  <span className="text-muted-foreground">
                    (+{rpPct}% after volume discount)
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={rush2day}
                  onChange={(e) => setRush2day(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-background/80 text-primary accent-primary focus:ring-2 focus:ring-primary/40"
                />
                <span>
                  1–2 business day turnaround{" "}
                  <span className="text-muted-foreground">(+{r2Pct}%)</span>
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(cardClass, "mt-6")}>
          <CardHeader>
            <CardTitle>Line items</CardTitle>
            <CardDescription>
              Edit quantities and prices, or add a new service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="catalog-service">Service catalog</Label>
                <select
                  id="catalog-service"
                  value={pickId}
                  onChange={(e) => setPickId(e.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                    fieldClass,
                  )}
                >
                  <option value="">Select service…</option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({money(c.default_unit_price)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-qty">Qty</Label>
                <Input
                  id="add-qty"
                  type="number"
                  min={0.0001}
                  step={0.1}
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value) || 1)}
                  className={fieldClass}
                />
              </div>
              <Button type="button" onClick={addService} disabled={!pickId}>
                <Plus className="mr-2 h-4 w-4" />
                Add line
              </Button>
            </div>

            <Separator className="bg-white/[0.08]" />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2">Service</th>
                    <th className="w-[120px] px-3 py-2">Qty</th>
                    <th className="w-[140px] px-3 py-2">Unit price</th>
                    <th className="w-[140px] px-3 py-2 text-right">Line total</th>
                    <th className="w-[64px] px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.key} className="border-b border-white/[0.06] last:border-0">
                      <td className="px-3 py-2">
                        <Input
                          value={line.label}
                          onChange={(e) => updateLine(line.key, { label: e.target.value })}
                          className={fieldClass}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0.0001}
                          step={0.1}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.key, {
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                          className={fieldClass}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={line.unit_price}
                          onChange={(e) =>
                            updateLine(line.key, {
                              unit_price: Number(e.target.value) || 0,
                            })
                          }
                          className={fieldClass}
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums text-primary">
                        {money(line.quantity * line.unit_price)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(line.key)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-sm">
              {!totals ? (
                <p className="text-muted-foreground">Add services to see totals.</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Services subtotal</span>
                    <span className="tabular-nums font-medium">
                      {money(totals.subtotal_amount)}
                    </span>
                  </div>
                  {Math.abs(totals.segment_adjustment_amount) >= 0.005 ? (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Segment adjustment</span>
                      <span className="tabular-nums">
                        {money(totals.segment_adjustment_amount)}
                      </span>
                    </div>
                  ) : null}
                  {Math.abs(totals.volume_discount_amount) >= 0.005 ? (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Volume discount</span>
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums text-primary">
                          −{money(totals.volume_discount_amount)}
                        </span>
                        {applyVolumeDiscount ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setApplyVolumeDiscount(false)}
                            aria-label="Remove volume discount"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </span>
                    </div>
                  ) : null}
                  {Math.abs(totals.rush_uplift_amount) >= 0.005 ? (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Rush uplift</span>
                      <span className="tabular-nums">
                        {money(totals.rush_uplift_amount)}
                      </span>
                    </div>
                  ) : null}
                  <Separator className="bg-white/[0.08]" />
                  <div className="flex justify-between gap-4 text-base">
                    <span className="font-semibold">Total (USD)</span>
                    <span className="tabular-nums font-semibold text-primary">
                      {money(totals.total_amount)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(cardClass, "mt-6")}>
          <CardHeader className="space-y-1">
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Shown on the invoice preview and PDF when this field has text—appears
              after the bill-to block and before the line items table, with no
              heading (same as quotes).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className={cn(
                fieldClass,
                "min-h-[240px] w-full resize-y rounded-md border px-4 py-3 text-base leading-relaxed",
              )}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions or anything the client should see on the invoice…"
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Preview PDF
          </Button>
          <Button type="button" onClick={saveInvoice} disabled={pending}>
            <Save className="mr-2 h-4 w-4" />
            {pending ? "Saving…" : "Save invoice"}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/pathx/invoices">Back to invoices</Link>
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <InvoicePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
      />
    </div>
  );
}
