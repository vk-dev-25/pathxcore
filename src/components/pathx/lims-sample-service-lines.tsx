"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  LimsCatalogServiceOption,
  LimsSampleServiceLineRow,
} from "@/lib/lims/get-lims-project-detail-action";
import {
  addLimsSampleServiceLineAction,
  deleteLimsSampleServiceLineAction,
  updateLimsSampleServiceLineQuantityAction,
} from "@/lib/lims/sample-service-lines-actions";
import { cn } from "@/lib/utils";

import { pathxFieldClass as fieldClass } from "@/components/pathx/workspace-field-classes";

export function LimsSampleServiceLines({
  projectId,
  sampleId,
  lines,
  catalog,
  catalogLoading,
  onRefresh,
  showTitle = true,
}: {
  projectId: string;
  sampleId: string;
  lines: LimsSampleServiceLineRow[];
  catalog: LimsCatalogServiceOption[];
  catalogLoading: boolean;
  onRefresh: () => void;
  showTitle?: boolean;
}) {
  const [pending, start] = useTransition();
  const [pickId, setPickId] = useState("");
  const [qty, setQty] = useState("1");
  const [msg, setMsg] = useState<string | null>(null);

  const picked = pickId ? catalog.find((c) => c.id === pickId) : null;
  const catalogReady = !catalogLoading || catalog.length > 0;
  const noServices = catalogReady && catalog.length === 0;

  return (
    <div className="space-y-3">
      {showTitle ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Services from catalog
        </p>
      ) : null}
      {lines.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-border dark:border-white/[0.08]">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted-foreground dark:border-white/[0.08]">
                <th className="px-3 py-2">Service</th>
                <th className="w-28 px-3 py-2">Qty</th>
                <th className="w-12 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr
                  key={line.id}
                  className="border-b border-border last:border-0 dark:border-white/[0.06]"
                >
                  <td className="px-3 py-2">{line.label}</td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0.0001}
                      step="any"
                      className={cn("h-8 text-sm tabular-nums", fieldClass)}
                      defaultValue={String(line.quantity)}
                      key={`${line.id}-${line.quantity}`}
                      disabled={pending}
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!Number.isFinite(v) || v <= 0) return;
                        if (v === line.quantity) return;
                        start(async () => {
                          setMsg(null);
                          const res = await updateLimsSampleServiceLineQuantityAction({
                            projectId,
                            sampleId,
                            lineId: line.id,
                            quantity: v,
                          });
                          if (!res.ok) setMsg(res.error ?? "Update failed");
                          else onRefresh();
                        });
                      }}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          setMsg(null);
                          const res = await deleteLimsSampleServiceLineAction({
                            projectId,
                            sampleId,
                            lineId: line.id,
                          });
                          if (!res.ok) setMsg(res.error ?? "Remove failed");
                          else onRefresh();
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No catalog services added yet.</p>
      )}

      {catalogLoading && catalog.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.02]">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          Loading service catalog…
        </div>
      ) : null}

      {catalogReady && catalog.length > 0 ? (
        <>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Pick a service (from quote catalog)
            </Label>
            <div
              className="max-h-52 overflow-y-auto rounded-md border border-border bg-muted/20 p-2 dark:border-white/[0.08] dark:bg-white/[0.02]"
              role="listbox"
              aria-label="Catalog services"
            >
              <div className="flex flex-col gap-1.5">
                {catalog.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant={pickId === c.id ? "default" : "outline"}
                    size="sm"
                    className="h-auto min-h-9 w-full justify-start whitespace-normal px-3 py-2 text-left font-normal"
                    onClick={() => {
                      setPickId(c.id);
                      setMsg(null);
                    }}
                  >
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="w-full space-y-1 sm:w-24">
              <Label className="text-xs text-muted-foreground">Qty</Label>
              <Input
                type="number"
                min={0.0001}
                step="any"
                className={fieldClass}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <Button
              type="button"
              disabled={pending || !pickId}
              className="sm:shrink-0"
              onClick={() =>
                start(async () => {
                  setMsg(null);
                  const q = parseFloat(qty);
                  if (!Number.isFinite(q) || q <= 0) {
                    setMsg("Enter a valid quantity.");
                    return;
                  }
                  const svc = catalog.find((c) => c.id === pickId);
                  if (!svc) return;
                  const res = await addLimsSampleServiceLineAction({
                    projectId,
                    sampleId,
                    catalog_service_id: svc.id,
                    label: svc.name,
                    quantity: q,
                  });
                  if (!res.ok) setMsg(res.error ?? "Could not add");
                  else {
                    setPickId("");
                    setQty("1");
                    onRefresh();
                  }
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to sample
            </Button>
          </div>
          {picked ? (
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{picked.name}</span>
            </p>
          ) : null}
        </>
      ) : null}

      {noServices ? (
        <p className="text-sm text-muted-foreground">
          No services in <span className="font-mono text-xs">quote_catalog_services</span>.
          Add them under Admin → Pricing.
        </p>
      ) : null}

      {msg ? <p className="text-xs text-destructive">{msg}</p> : null}
    </div>
  );
}
