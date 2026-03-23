"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Loader2, Plus, RotateCcw, Search, Settings2, Trash2 } from "lucide-react";

import { QuotePreviewDialog } from "@/components/pathx/quote-preview-dialog";
import { saveQuoteAction } from "@/lib/quotes/save-quote-action";
import {
  computeQuoteTotals,
  defaultPricingSettings,
  roundMoney,
  SEGMENT_OPTIONS,
  type PricingSettingsSnapshot,
  type QuoteLineInput,
  type Segment,
} from "@/lib/quote-pricing";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type CatalogServiceRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  default_unit_price: number;
  sort_order: number;
  active?: boolean;
};

type DraftLine = {
  key: string;
  catalog_service_id: string;
  label: string;
  quantity: number;
  unit_price: number;
  default_unit_price: number;
  is_price_overridden: boolean;
};

/** Matches PathX / marketing: glass fields on charcoal. */
const fieldClass =
  "border-white/[0.12] bg-white/[0.04] text-foreground shadow-none backdrop-blur-sm placeholder:text-muted-foreground focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0";

const cardClass =
  "border border-white/[0.08] bg-card/50 shadow-none backdrop-blur-xl transition-[box-shadow,border-color] duration-300 hover:shadow-[0_0_40px_-24px_hsl(var(--primary)/0.25)]";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function newRef() {
  return `QX-${Date.now().toString(36).toUpperCase()}`;
}

export function QuoteBuilderClient({
  catalog,
  pricingSettings: pricingSettingsProp,
}: {
  catalog: CatalogServiceRow[];
  pricingSettings?: PricingSettingsSnapshot;
}) {
  const pricingSettings = pricingSettingsProp ?? defaultPricingSettings();
  const [segment, setSegment] = useState<Segment>("small_biopharma");
  const [sampleVolume, setSampleVolume] = useState(12);
  const [rushPriority, setRushPriority] = useState(false);
  const [rush2day, setRush2day] = useState(false);
  const [clientOrg, setClientOrg] = useState("");
  const [contactName, setContactName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [quoteRef, setQuoteRef] = useState(newRef);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [pickId, setPickId] = useState<string>("");
  const [addQty, setAddQty] = useState(1);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lineInputs: QuoteLineInput[] = useMemo(
    () =>
      lines.map((l) => ({
        catalog_service_id: l.catalog_service_id,
        label: l.label,
        quantity: l.quantity,
        unit_price: l.unit_price,
        default_unit_price_snapshot: l.default_unit_price,
        is_price_overridden: l.is_price_overridden,
      })),
    [lines],
  );

  const totals = useMemo(
    () =>
      lines.length
        ? computeQuoteTotals(
            lineInputs,
            segment,
            sampleVolume,
            rushPriority,
            rush2day,
            pricingSettings,
          )
        : null,
    [
      lineInputs,
      lines.length,
      segment,
      sampleVolume,
      rushPriority,
      rush2day,
      pricingSettings,
    ],
  );

  const segmentLabel =
    SEGMENT_OPTIONS.find((o) => o.value === segment)?.label ?? segment;
  const rpPct = pricingSettings.rush_priority_percent;
  const r2Pct = pricingSettings.rush_2day_percent;

  function addService() {
    const svc = catalog.find((c) => c.id === pickId);
    if (!svc) return;
    const price = Number(svc.default_unit_price);
    const qty = Math.max(0.01, addQty);
    setLines((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        catalog_service_id: svc.id,
        label: svc.name,
        quantity: qty,
        unit_price: price,
        default_unit_price: price,
        is_price_overridden: false,
      },
    ]);
    setPickId("");
    setAddQty(1);
  }

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    );
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function clearAll() {
    setLines([]);
    setClientOrg("");
    setContactName("");
    setProjectTitle("");
    setQuoteRef(newRef());
    setNotes("");
    setSegment("small_biopharma");
    setSampleVolume(12);
    setRushPriority(false);
    setRush2day(false);
    setAddQty(1);
    setSaveMsg(null);
    setSaveErr(null);
  }

  function save() {
    setSaveMsg(null);
    setSaveErr(null);
    startTransition(async () => {
      const result = await saveQuoteAction({
        client_org_name: clientOrg,
        contact_name: contactName,
        project_title: projectTitle,
        quote_reference: quoteRef,
        segment,
        sample_volume: sampleVolume,
        rush_priority: rushPriority,
        rush_2day: rush2day,
        notes,
        lines: lineInputs,
      });
      if (result.ok) {
        setSaveMsg(`Quote saved. Reference stored with id ${result.quoteId.slice(0, 8)}…`);
        setLines([]);
        setNotes("");
        setQuoteRef(newRef());
      } else {
        setSaveErr(result.error);
      }
    });
  }

  const catalogEmpty = catalog.length === 0;

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            PathX module
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            New quote
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Configure services, segment, and volume. Override any line price when
            needed—defaults follow quote price config; your quote is saved for the
            team.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/pathx/quotes">
              <Search className="mr-1.5 h-4 w-4" aria-hidden />
              Quote finder
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/pathx/admin/pricing">
              <Settings2 className="mr-1.5 h-4 w-4" aria-hidden />
              Quote price config
            </Link>
          </Button>
          <QuotePreviewDialog
            trigger={
              <Button type="button" variant="outline" size="sm" className="border-white/[0.14] bg-white/[0.04]">
                <Eye className="mr-1.5 h-4 w-4" />
                Preview quote
              </Button>
            }
            clientOrg={clientOrg}
            contactName={contactName}
            projectTitle={projectTitle}
            quoteRef={quoteRef}
            segmentLabel={segmentLabel}
            sampleVolume={sampleVolume}
            rushPriority={rushPriority}
            rush2day={rush2day}
            notes={notes}
            lines={lines.map((l) => ({
              label: l.label,
              quantity: l.quantity,
              unit_price: l.unit_price,
              lineTotal: roundMoney(l.quantity * l.unit_price),
              is_price_overridden: l.is_price_overridden,
            }))}
            totals={totals}
            pricingSettings={pricingSettings}
          />
          <Button
            type="button"
            variant="workspace"
            size="sm"
            className="font-medium"
            onClick={clearAll}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            className="font-semibold shadow-[0_0_28px_-8px_hsl(var(--primary)/0.75)]"
            disabled={pending || !lines.length || catalogEmpty}
            onClick={save}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save quote
          </Button>
        </div>
      </div>

      {catalogEmpty ? (
        <Card className="mt-10 border border-dashed border-amber-500/35 bg-amber-500/[0.06] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Catalog not available</CardTitle>
            <CardDescription>
              Run the SQL migration{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                20260323000002_quotes.sql
              </code>{" "}
              in the Supabase SQL editor, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {saveMsg ? (
        <p className="mt-8 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          {saveMsg}
        </p>
      ) : null}
      {saveErr ? (
        <p className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {saveErr}
        </p>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <Card className={cardClass}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Client information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Who this quote is for and how to reference it internally.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="org" className="text-foreground">
                  Client / organization name
                </Label>
                <Input
                  id="org"
                  value={clientOrg}
                  onChange={(e) => setClientOrg(e.target.value)}
                  placeholder="Organization"
                  className={cn(fieldClass)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-foreground">
                  Contact name
                </Label>
                <Input
                  id="contact"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Name"
                  className={cn(fieldClass)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project" className="text-foreground">
                  Project / study title
                </Label>
                <Input
                  id="project"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Title"
                  className={cn(fieldClass)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qref" className="text-foreground">
                  Quote reference
                </Label>
                <Input
                  id="qref"
                  value={quoteRef}
                  onChange={(e) => setQuoteRef(e.target.value)}
                  placeholder="QX-…"
                  className={cn(fieldClass)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Segment & options
              </CardTitle>
              <CardDescription>
                Segment adjusts list pricing; volume drives discount tiers; rush
                options add uplift on the amount after discounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="segment" className="text-foreground">
                  Client segment
                </Label>
                <select
                  id="segment"
                  className={cn(
                    "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors",
                    fieldClass,
                  )}
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as Segment)}
                >
                  {SEGMENT_OPTIONS.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      className="bg-card text-foreground"
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vol" className="text-foreground">
                  Total sample / block volume
                </Label>
                <Input
                  id="vol"
                  type="number"
                  min={0}
                  step={1}
                  value={sampleVolume}
                  onChange={(e) =>
                    setSampleVolume(parseInt(e.target.value, 10) || 0)
                  }
                  className={cn(fieldClass)}
                />
                <p className="text-xs text-muted-foreground">
                  Discount tier is chosen from total sample / block volume (see
                  tiers below). Percent off applies after segment adjustment.
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                <p className="text-xs font-medium text-foreground">
                  Volume discount tiers
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {pricingSettings.volume_tiers.map((t, i) => (
                    <li key={i}>
                      {t.min}–{t.max} blocks: {t.discountPercent}% off
                    </li>
                  ))}
                </ul>
              </div>
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

          <Card className={cardClass}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Services
              </CardTitle>
              <CardDescription>
                Add catalog lines, adjust quantity, and override unit price when
                needed (per-quote overrides only).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label className="text-foreground">Service</Label>
                  <select
                    className={cn(
                      "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                      fieldClass,
                    )}
                    value={pickId}
                    onChange={(e) => setPickId(e.target.value)}
                  >
                    <option value="">Select a service…</option>
                    {catalog.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-card text-foreground"
                      >
                        {c.name} ({money(Number(c.default_unit_price))} / unit)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full space-y-2 sm:w-32">
                  <Label htmlFor="add-qty" className="text-foreground">
                    Quantity
                  </Label>
                  <Input
                    id="add-qty"
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={addQty}
                    onChange={(e) =>
                      setAddQty(Math.max(0.01, parseFloat(e.target.value) || 0))
                    }
                    className={cn(fieldClass)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 border-white/[0.14] bg-white/[0.04] font-medium backdrop-blur-sm hover:bg-white/[0.08] sm:mb-0"
                  onClick={addService}
                  disabled={!pickId}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add line
                </Button>
              </div>

              {lines.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-8 text-center text-sm text-muted-foreground">
                  No lines yet. Pick a service above and click Add.
                </p>
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => {
                    const lineTotal = roundMoney(line.quantity * line.unit_price);
                    return (
                      <li
                        key={line.key}
                        className="rounded-xl border border-white/[0.1] bg-gradient-to-br from-card/90 to-card/40 p-4 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.08)] transition-colors hover:border-primary/25"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1 space-y-2">
                            <p className="font-semibold leading-tight text-foreground">
                              {line.label}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-foreground">
                                  Quantity
                                </Label>
                                <Input
                                  type="number"
                                  min={0.01}
                                  step={0.01}
                                  value={line.quantity}
                                  onChange={(e) =>
                                    updateLine(line.key, {
                                      quantity: Math.max(
                                        0.01,
                                        parseFloat(e.target.value) || 0,
                                      ),
                                    })
                                  }
                                  className={cn("h-9 w-28", fieldClass)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Catalog unit
                                </Label>
                                <p className="flex h-9 items-center rounded-md border border-white/[0.08] bg-white/[0.03] px-3 text-sm tabular-nums text-muted-foreground">
                                  {money(line.default_unit_price)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-foreground">
                                  {line.is_price_overridden
                                    ? "Custom unit price"
                                    : "Unit price (catalog)"}
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  disabled={!line.is_price_overridden}
                                  value={line.unit_price}
                                  onChange={(e) =>
                                    updateLine(line.key, {
                                      unit_price: Math.max(
                                        0,
                                        parseFloat(e.target.value) || 0,
                                      ),
                                    })
                                  }
                                  className={cn(
                                    "h-9 w-36",
                                    fieldClass,
                                    !line.is_price_overridden &&
                                      "cursor-not-allowed opacity-80",
                                  )}
                                />
                              </div>
                              <div className="flex flex-wrap items-end gap-2 pb-0.5">
                                {!line.is_price_overridden ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-primary/35 text-primary hover:bg-primary/10"
                                    onClick={() =>
                                      updateLine(line.key, {
                                        is_price_overridden: true,
                                      })
                                    }
                                  >
                                    Override unit price
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                      updateLine(line.key, {
                                        is_price_overridden: false,
                                        unit_price: line.default_unit_price,
                                      })
                                    }
                                  >
                                    Reset to catalog ({money(line.default_unit_price)})
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                  aria-label="Remove line"
                                  onClick={() => removeLine(line.key)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {line.is_price_overridden ? (
                              <p className="text-xs text-muted-foreground">
                                Overridden from catalog default{" "}
                                {money(line.default_unit_price)}
                              </p>
                            ) : null}
                          </div>
                          <div className="text-right lg:pt-6">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Line
                            </p>
                            <p className="text-lg font-semibold tabular-nums text-primary">
                              {money(lineTotal)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Notes
              </CardTitle>
              <CardDescription>
                Special instructions or assay context.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className={cn(
                  fieldClass,
                  "min-h-[100px] resize-y rounded-md border py-3",
                )}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for the lab team…"
              />
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
              aria-hidden
            />
            <Card
              className={cn(
                cardClass,
                "border-primary/15 bg-card/70 shadow-[0_0_48px_-20px_hsl(var(--primary)/0.4)]",
              )}
            >
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Quote summary
              </CardTitle>
              <CardDescription>Live totals from your lines and options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {!totals ? (
                <p className="text-muted-foreground">Add services to see totals.</p>
              ) : (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Services subtotal</span>
                    <span className="tabular-nums font-medium">
                      {money(totals.subtotal_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Segment adjustment</span>
                    <span className="tabular-nums">
                      {money(totals.segment_adjustment_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">After segment</span>
                    <span className="tabular-nums font-medium">
                      {money(totals.after_segment_amount)}
                    </span>
                  </div>
                  <Separator className="bg-white/[0.08]" />
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Volume discount</span>
                    <span className="tabular-nums text-primary">
                      −{money(totals.volume_discount_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">After volume</span>
                    <span className="tabular-nums">{money(totals.after_volume_amount)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Rush uplift</span>
                    <span className="tabular-nums">
                      {money(totals.rush_uplift_amount)}
                    </span>
                  </div>
                  <Separator className="bg-white/[0.08]" />
                  <div className="flex justify-between gap-4 text-base">
                    <span className="font-semibold">Total (USD)</span>
                    <span className="tabular-nums font-semibold text-primary">
                      {money(totals.total_amount)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}
