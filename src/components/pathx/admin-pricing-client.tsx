"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Plus, Search, Trash2 } from "lucide-react";

import {
  insertCatalogServiceAction,
  updateCatalogPricesAction,
  updatePricingSettingsAction,
} from "@/lib/quotes/pricing-admin-actions";
import { slugifyCatalogSlug } from "@/lib/quotes/catalog-slug";
import {
  SEGMENT_OPTIONS,
  type PricingSettingsSnapshot,
  type Segment,
  type VolumeTier,
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
import { cn } from "@/lib/utils";

import type { CatalogServiceRow } from "@/components/pathx/quote-builder";
import {
  pathxCardClassHover as cardClass,
  pathxFieldClass as fieldClass,
} from "@/components/pathx/workspace-field-classes";

export function AdminPricingClient({
  initialCatalog,
  initialSettings,
}: {
  initialCatalog: (CatalogServiceRow & { active?: boolean })[];
  initialSettings: PricingSettingsSnapshot;
}) {
  const router = useRouter();
  const slugTouchedRef = useRef(false);
  const [settings, setSettings] =
    useState<PricingSettingsSnapshot>(initialSettings);
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const c of initialCatalog) {
      m[c.id] = String(c.default_unit_price);
    }
    return m;
  });
  const [tiers, setTiers] = useState<VolumeTier[]>(() =>
    [...initialSettings.volume_tiers].sort((a, b) => a.min - b.min),
  );
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("0");
  const [newSort, setNewSort] = useState("1");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [addPending, startAddTransition] = useTransition();
  const [addServiceOpen, setAddServiceOpen] = useState(false);

  const nextSortOrder = useMemo(
    () =>
      initialCatalog.length === 0
        ? 1
        : Math.max(...initialCatalog.map((c) => c.sort_order)) + 1,
    [initialCatalog],
  );

  useEffect(() => {
    setNewSort(String(nextSortOrder));
  }, [nextSortOrder]);

  useEffect(() => {
    setPrices((prev) => {
      const next = { ...prev };
      for (const c of initialCatalog) {
        if (next[c.id] === undefined) next[c.id] = String(c.default_unit_price);
      }
      return next;
    });
  }, [initialCatalog]);

  function setSegMult(seg: Segment, v: string) {
    const n = parseFloat(v);
    setSettings((s) => ({
      ...s,
      segment_multipliers: {
        ...s.segment_multipliers,
        [seg]: Number.isFinite(n) ? n : s.segment_multipliers[seg] ?? 1,
      },
    }));
  }

  function addTier() {
    const last = tiers[tiers.length - 1];
    const start = last ? last.max + 1 : 1;
    setTiers((t) => [
      ...t,
      { min: start, max: start + 100, discountPercent: 0 },
    ]);
  }

  function updateTier(i: number, patch: Partial<VolumeTier>) {
    setTiers((t) =>
      t.map((row, j) => (j === i ? { ...row, ...patch } : row)),
    );
  }

  function removeTier(i: number) {
    setTiers((t) => t.filter((_, j) => j !== i));
  }

  function onNewNameChange(v: string) {
    setNewName(v);
    if (!slugTouchedRef.current) {
      setNewSlug(slugifyCatalogSlug(v));
    }
  }

  function onNewSlugChange(v: string) {
    slugTouchedRef.current = true;
    setNewSlug(v);
  }

  function addNewService() {
    setMsg(null);
    setErr(null);
    startAddTransition(async () => {
      const res = await insertCatalogServiceAction({
        name: newName,
        slug: newSlug || slugifyCatalogSlug(newName),
        description: newDesc,
        default_unit_price: parseFloat(newPrice) || 0,
        sort_order: parseInt(newSort, 10) || nextSortOrder,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMsg("Service added.");
      setNewName("");
      setNewDesc("");
      setNewPrice("0");
      setNewSlug("");
      slugTouchedRef.current = false;
      setAddServiceOpen(false);
      router.refresh();
    });
  }

  function saveAll() {
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const priceRows = initialCatalog.map((c) => ({
        id: c.id,
        default_unit_price: parseFloat(prices[c.id] ?? "") || 0,
      }));
      const bad = priceRows.some((r) => r.default_unit_price < 0);
      if (bad) {
        setErr("All catalog prices must be zero or positive.");
        return;
      }

      const catRes = await updateCatalogPricesAction(priceRows);
      if (!catRes.ok) {
        setErr(catRes.error);
        return;
      }

      const snap: PricingSettingsSnapshot = {
        ...settings,
        volume_tiers: tiers,
      };
      const setRes = await updatePricingSettingsAction(snap);
      if (!setRes.ok) {
        setErr(setRes.error);
        return;
      }
      setMsg("All changes saved.");
    });
  }

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
              Quote price config
            </h1>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Edit catalog services, base unit prices, volume tiers, rush rates, and
              segment multipliers. Changes apply to new quotes and saved quote
              totals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <Button asChild variant="outline" size="sm" className="font-medium">
              <Link href="/pathx/quotebuilder">
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                New quote
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/pathx/quotes">
                <Search className="mr-1.5 h-4 w-4" aria-hidden />
                Quote finder
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 space-y-8">
            <Card className={cardClass}>
              <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Add new service</CardTitle>
                  <CardDescription>
                    Optional — expand when you need a new catalog line with its own
                    slug and default price.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-white/[0.14] bg-white/[0.04] font-medium"
                  aria-expanded={addServiceOpen}
                  aria-controls="add-service-form"
                  id="add-service-toggle"
                  onClick={() => setAddServiceOpen((o) => !o)}
                >
                  <ChevronDown
                    className={cn(
                      "mr-2 h-4 w-4 transition-transform duration-200",
                      addServiceOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                  {addServiceOpen ? "Hide form" : "Show form"}
                </Button>
              </CardHeader>
              {addServiceOpen ? (
                <CardContent
                  id="add-service-form"
                  role="region"
                  aria-labelledby="add-service-toggle"
                  className="grid gap-4 border-t border-white/[0.06] pt-6 sm:grid-cols-2"
                >
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="new-name">Service name</Label>
                    <Input
                      id="new-name"
                      value={newName}
                      onChange={(e) => onNewNameChange(e.target.value)}
                      placeholder="e.g. H&E — glass slide"
                      className={cn(fieldClass)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="new-slug">Slug</Label>
                    <Input
                      id="new-slug"
                      value={newSlug}
                      onChange={(e) => onNewSlugChange(e.target.value)}
                      placeholder="auto from name"
                      className={cn(fieldClass)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lowercase letters, numbers, underscores. Must be unique.
                    </p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="new-desc">Description (optional)</Label>
                    <textarea
                      id="new-desc"
                      className={cn(
                        fieldClass,
                        "min-h-[64px] w-full resize-y rounded-md border py-2",
                      )}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-price">Default unit price (USD)</Label>
                    <Input
                      id="new-price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className={cn(fieldClass)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-sort">Sort order</Label>
                    <Input
                      id="new-sort"
                      type="number"
                      min={0}
                      step={1}
                      value={newSort}
                      onChange={(e) => setNewSort(e.target.value)}
                      className={cn(fieldClass)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-primary/35 text-primary hover:bg-primary/10"
                      disabled={addPending || !newName.trim()}
                      onClick={addNewService}
                    >
                      {addPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Add service
                    </Button>
                  </div>
                </CardContent>
              ) : null}
            </Card>

            <div className="space-y-3">
              {msg ? (
                <p className="rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                  {msg}
                </p>
              ) : null}
              {err ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {err}
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="font-semibold shadow-[0_0_28px_-8px_hsl(var(--primary)/0.75)]"
                  disabled={pending}
                  onClick={saveAll}
                >
                  {pending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save changes
                </Button>
              </div>
            </div>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-lg">Base service prices</CardTitle>
                <CardDescription>
                  Editable — affects all new quotes and default line prices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {initialCatalog.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-6 text-center text-sm text-muted-foreground">
                    No services yet. Add one above, or run the quotes migration in
                    Supabase if the catalog failed to load.
                  </p>
                ) : (
                  <>
                    {initialCatalog.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-col gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{c.name}</p>
                          {c.description ? (
                            <p className="text-xs text-muted-foreground">
                              {c.description}
                            </p>
                          ) : null}
                          {c.active === false ? (
                            <p className="text-xs text-amber-600/90">Inactive</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Label className="sr-only" htmlFor={`price-${c.id}`}>
                            Price
                          </Label>
                          <Input
                            id={`price-${c.id}`}
                            type="number"
                            min={0}
                            step={0.01}
                            value={prices[c.id] ?? ""}
                            onChange={(e) =>
                              setPrices((p) => ({ ...p, [c.id]: e.target.value }))
                            }
                            className={cn("h-9 w-36", fieldClass)}
                          />
                          <span className="text-sm text-muted-foreground">USD</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Volume discount tiers</CardTitle>
                    <CardDescription>
                      Sample / block count ranges and percent off (after segment
                      adjustment).
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-white/[0.14] bg-white/[0.04]"
                    onClick={addTier}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tiers.map((t, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-end gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs">Min</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={t.min}
                        onChange={(e) =>
                          updateTier(i, {
                            min: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className={cn("h-9 w-24", fieldClass)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={t.max}
                        onChange={(e) =>
                          updateTier(i, {
                            max: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className={cn("h-9 w-24", fieldClass)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Discount %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={t.discountPercent}
                        onChange={(e) =>
                          updateTier(i, {
                            discountPercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={cn("h-9 w-24", fieldClass)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove tier"
                      onClick={() => removeTier(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-lg">Segment multipliers</CardTitle>
                <CardDescription>
                  Applied to services subtotal before volume discount.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {SEGMENT_OPTIONS.map((o) => (
                  <div key={o.value} className="space-y-2">
                    <Label htmlFor={`seg-${o.value}`}>{o.label}</Label>
                    <Input
                      id={`seg-${o.value}`}
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={settings.segment_multipliers[o.value] ?? ""}
                      onChange={(e) => setSegMult(o.value, e.target.value)}
                      className={cn(fieldClass)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Turnaround &amp; general settings
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rush-p">Rush / priority surcharge (%)</Label>
                  <Input
                    id="rush-p"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={settings.rush_priority_percent}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        rush_priority_percent: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={cn(fieldClass)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rush-2">1–2 day turnaround (%)</Label>
                  <Input
                    id="rush-2"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={settings.rush_2day_percent}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        rush_2day_percent: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={cn(fieldClass)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="valid">Quote validity (days)</Label>
                  <Input
                    id="valid"
                    type="number"
                    min={1}
                    step={1}
                    value={settings.quote_validity_days}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        quote_validity_days: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    className={cn(fieldClass)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="lab">Lab / company address</Label>
                  <textarea
                    id="lab"
                    className={cn(
                      fieldClass,
                      "min-h-[72px] w-full resize-y rounded-md border py-2",
                    )}
                    value={settings.lab_address}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, lab_address: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Contact email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        contact_email: e.target.value,
                      }))
                    }
                    className={cn(fieldClass)}
                  />
                </div>
              </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
