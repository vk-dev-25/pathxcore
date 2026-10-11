"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

/** Catalog services as stacked “linked records” with qty, inside a sheet cell. */
export function LimsLinkedServicesCell({
  projectId,
  sampleId,
  lines,
  catalog,
  catalogLoading,
  onRefresh,
}: {
  projectId: string;
  sampleId: string;
  lines: LimsSampleServiceLineRow[];
  catalog: LimsCatalogServiceOption[];
  catalogLoading: boolean;
  onRefresh: () => void;
}) {
  const [pending, start] = useTransition();
  const [pickId, setPickId] = useState("");
  const [qty, setQty] = useState("1");
  const [msg, setMsg] = useState<string | null>(null);

  const catalogReady = !catalogLoading || catalog.length > 0;

  return (
    <div className="flex min-w-[200px] max-w-[280px] flex-col gap-2 align-top">
      <div className="max-h-36 space-y-1 overflow-y-auto pr-0.5">
        {lines.length === 0 ? (
          <p className="text-xs text-muted-foreground">No services</p>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs dark:border-white/[0.08]"
            >
              <span className="min-w-0 flex-1 truncate" title={line.label}>
                {line.label}
              </span>
              <Input
                type="number"
                min={0.0001}
                step="any"
                className={cn("h-7 w-14 shrink-0 tabular-nums", fieldClass)}
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                disabled={pending}
                aria-label={`Remove ${line.label}`}
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
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {catalogLoading && catalog.length === 0 ? (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Catalog…
        </div>
      ) : null}

      {catalogReady && catalog.length > 0 ? (
        <div className="flex flex-col gap-1.5 border-t border-border pt-2 dark:border-white/[0.06]">
          <select
            className={cn("h-8 w-full rounded-md px-2 text-xs", fieldClass)}
            value={pickId}
            disabled={pending}
            onChange={(e) => {
              setPickId(e.target.value);
              setMsg(null);
            }}
          >
            <option value="">Add service…</option>
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <Input
              type="number"
              min={0.0001}
              step="any"
              className={cn("h-8 flex-1 text-xs", fieldClass)}
              value={qty}
              disabled={pending}
              onChange={(e) => setQty(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0 px-2"
              disabled={pending || !pickId}
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
                  if (!res.ok) setMsg(res.error ?? "Add failed");
                  else {
                    setPickId("");
                    setQty("1");
                    onRefresh();
                  }
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {catalogReady && catalog.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No catalog services.</p>
      ) : null}

      {msg ? <p className="text-[11px] text-destructive">{msg}</p> : null}
    </div>
  );
}
