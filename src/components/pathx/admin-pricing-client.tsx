"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Plus, Search, Trash2 } from "lucide-react";

import {
  deleteCatalogServiceAction,
  insertCatalogServiceAction,
  updateCatalogRowsAction,
  updatePricingSettingsAction,
} from "@/lib/quotes/pricing-admin-actions";
import { slugifyCatalogSlug } from "@/lib/quotes/catalog-slug";
import {
  SEGMENT_OPTIONS,
  type PricingSettingsSnapshot,
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
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialCatalog.map((c) => [c.id, c.name])),
  );
  const [slugs, setSlugs] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialCatalog.map((c) => [c.id, c.slug])),
  );
  const [descriptions, setDescriptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialCatalog.map((c) => [c.id, c.description ?? ""])),
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("0");
  const [newSort, setNewSort] = useState("1");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [addPending, startAddTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
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
    setNames((prev) => {
      const next = { ...prev };
      for (const c of initialCatalog) {
        if (next[c.id] === undefined) next[c.id] = c.name;
      }
      return next;
    });
    setSlugs((prev) => {
      const next = { ...prev };
      for (const c of initialCatalog) {
        if (next[c.id] === undefined) next[c.id] = c.slug;
      }
      return next;
    });
    setDescriptions((prev) => {
      const next = { ...prev };
      for (const c of initialCatalog) {
        if (next[c.id] === undefined) next[c.id] = c.description ?? "";
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
      const catalogRows = initialCatalog.map((c) => ({
        id: c.id,
        name: names[c.id] ?? c.name,
        slug: slugs[c.id] ?? c.slug,
        description: descriptions[c.id] ?? "",
        default_unit_price: parseFloat(prices[c.id] ?? "") || 0,
      }));
      const bad = catalogRows.some((r) => r.default_unit_price < 0);
      if (bad) {
        setErr("All catalog prices must be zero or positive.");
        return;
      }

      const catRes = await updateCatalogRowsAction(catalogRows);
      if (!catRes.ok) {
        setErr(catRes.error);
        return;
      }

      const setRes = await updatePricingSettingsAction(settings);
      if (!setRes.ok) {
        setErr(setRes.error);
        return;
      }
      setMsg("All changes saved.");
    });
  }

  function deleteService(id: string, displayName: string) {
    setMsg(null);
    setErr(null);
    const ok = window.confirm(
      `Delete “${displayName}”? Saved quote lines keep their text but will no longer link to this catalog row.`,
    );
    if (!ok) return;
    setDeletingId(id);
    startDeleteTransition(async () => {
      const res = await deleteCatalogServiceAction({ id });
      setDeletingId(null);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMsg("Service removed.");
      router.refresh();
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
              Edit catalog services, base unit prices, rush rates, and segment
              multipliers. Changes apply to new quotes and saved quote totals.
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
                <CardTitle className="text-lg">Base services</CardTitle>
                <CardDescription>
                  Edit display name, slug, description, and default unit price. Save changes
                  applies updates. Delete removes the catalog row (existing quote lines keep
                  their labels).
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
                        className="space-y-3 rounded-lg border border-border bg-muted/20 px-3 py-3 dark:border-white/[0.08] dark:bg-white/[0.02]"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor={`name-${c.id}`} className="text-xs">
                              Display name
                            </Label>
                            <Input
                              id={`name-${c.id}`}
                              value={names[c.id] ?? ""}
                              onChange={(e) =>
                                setNames((p) => ({ ...p, [c.id]: e.target.value }))
                              }
                              className={cn("h-9", fieldClass)}
                              autoComplete="off"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`slug-${c.id}`} className="text-xs">
                              Slug (unique)
                            </Label>
                            <Input
                              id={`slug-${c.id}`}
                              value={slugs[c.id] ?? ""}
                              onChange={(e) =>
                                setSlugs((p) => ({ ...p, [c.id]: e.target.value }))
                              }
                              className={cn("h-9 font-mono text-xs", fieldClass)}
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`desc-${c.id}`} className="text-xs">
                            Description
                          </Label>
                          <Input
                            id={`desc-${c.id}`}
                            value={descriptions[c.id] ?? ""}
                            onChange={(e) =>
                              setDescriptions((p) => ({ ...p, [c.id]: e.target.value }))
                            }
                            className={cn("h-9", fieldClass)}
                            placeholder="Optional"
                            autoComplete="off"
                          />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          {c.active === false ? (
                            <p className="text-xs text-amber-600 dark:text-amber-500">Inactive</p>
                          ) : null}
                          <div className="flex flex-wrap items-end gap-2 sm:ml-auto">
                            <div className="space-y-1.5">
                              <Label className="text-xs" htmlFor={`price-${c.id}`}>
                                Default price
                              </Label>
                              <div className="flex items-center gap-2">
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
                                <span className="pb-2 text-sm text-muted-foreground">USD</span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-destructive/35 text-destructive hover:bg-destructive/10"
                              disabled={deletePending}
                              aria-label={`Delete ${c.name}`}
                              onClick={() => deleteService(c.id, names[c.id] ?? c.name)}
                            >
                              {deletingId === c.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                              ) : (
                                <Trash2 className="h-4 w-4" aria-hidden />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
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
