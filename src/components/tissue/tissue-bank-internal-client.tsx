"use client";

import { Loader2, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addTissueBlockAction,
  deleteTissueBlockAction,
  setTissueStatusAction,
} from "@/lib/tissue/tissue-actions";
import { formatInventoryEventAt } from "@/lib/tissue/format";
import type { TissueBlockStatus, TissueInventoryRow } from "@/lib/tissue/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "border-border/80 bg-background/80 text-foreground shadow-none";

const CATEGORIES = [
  "Malignant",
  "Benign",
  "Normal/Control",
  "Pre-malignant",
  "Unknown",
] as const;

export function TissueAddBlockForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const res = await addTissueBlockAction({
            dob: String(fd.get("dob") ?? ""),
            gender: String(fd.get("gender") ?? ""),
            tissue: String(fd.get("tissue") ?? ""),
            diag_short: String(fd.get("diag_short") ?? ""),
            diag_text: String(fd.get("diag_text") ?? ""),
            category: String(fd.get("category") ?? ""),
            source_tab: String(fd.get("source_tab") ?? "Sheet1"),
            size_length_cm: String(fd.get("size_length_cm") ?? ""),
            size_width_cm: String(fd.get("size_width_cm") ?? ""),
            size_height_cm: String(fd.get("size_height_cm") ?? ""),
          });
          if (res.ok) {
            setMessage("Block added.");
            form.reset();
            try {
              await router.refresh();
            } catch {
              /* RSC refresh failure should not surface as an action protocol error */
            }
          } else {
            setMessage(res.error);
          }
        });
      }}
    >
      <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
        Catalog ID (PTDX-&lt;tissue abbr&gt;-… seven digits) and accession (TS +
        current year + six-digit serial) are assigned automatically when you
        save.
      </p>
      <div className="space-y-2">
        <Label htmlFor="tissue-dob">DOB</Label>
        <Input id="tissue-dob" name="dob" type="date" className={fieldClass} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tissue-gender">Gender</Label>
        <select
          id="tissue-gender"
          name="gender"
          className={cn(
            "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
            fieldClass,
          )}
        >
          <option value="">—</option>
          <option value="F">Female</option>
          <option value="M">Male</option>
        </select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="tissue-type">Tissue</Label>
        <Input
          id="tissue-type"
          name="tissue"
          required
          className={fieldClass}
          placeholder="e.g. Lung, Bone marrow"
        />
      </div>
      <div className="space-y-2 sm:col-span-2 lg:col-span-3">
        <p className="text-sm font-medium leading-none">Size (cm)</p>
        <p className="text-xs text-muted-foreground">
          Optional. Length × width × height in centimeters.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="tissue-size-l" className="text-xs font-normal text-muted-foreground">
              Length
            </Label>
            <Input
              id="tissue-size-l"
              name="size_length_cm"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              className={fieldClass}
              placeholder="—"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tissue-size-w" className="text-xs font-normal text-muted-foreground">
              Width
            </Label>
            <Input
              id="tissue-size-w"
              name="size_width_cm"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              className={fieldClass}
              placeholder="—"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tissue-size-h" className="text-xs font-normal text-muted-foreground">
              Height
            </Label>
            <Input
              id="tissue-size-h"
              name="size_height_cm"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              className={fieldClass}
              placeholder="—"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tissue-category">Category</Label>
        <select
          id="tissue-category"
          name="category"
          required
          className={cn(
            "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
            fieldClass,
          )}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="tissue-diag-short">Primary diagnosis (short)</Label>
        <Input
          id="tissue-diag-short"
          name="diag_short"
          className={fieldClass}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="tissue-diag-text">Diagnosis (full)</Label>
        <Input id="tissue-diag-text" name="diag_text" className={fieldClass} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tissue-tab">Source tab</Label>
        <Input
          id="tissue-tab"
          name="source_tab"
          defaultValue="Sheet1"
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col justify-end gap-2 sm:col-span-2 lg:col-span-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={pending} className="font-medium">
            {pending ? "Saving…" : "Add block"}
          </Button>
          {message ? (
            <p className="text-sm text-muted-foreground" role="status">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

export function TissueRowEventDetails({ row }: { row: TissueInventoryRow }) {
  if (row.status === "sold") {
    const at = formatInventoryEventAt(row.sold_at);
    return (
      <div className="max-w-[220px] space-y-0.5 text-xs">
        <p className="tabular-nums text-muted-foreground">
          {at ? `Sold ${at}` : "Sold"}
        </p>
        {row.sold_note ? (
          <p className="line-clamp-2 text-muted-foreground">{row.sold_note}</p>
        ) : null}
      </div>
    );
  }
  if (row.status === "discarded") {
    const at = formatInventoryEventAt(row.discarded_at);
    return (
      <div className="max-w-[220px] space-y-0.5 text-xs">
        <p className="tabular-nums text-muted-foreground">
          {at ? `Discarded ${at}` : "Discarded"}
        </p>
        {row.discarded_note ? (
          <p className="line-clamp-2 text-muted-foreground">{row.discarded_note}</p>
        ) : null}
      </div>
    );
  }
  return <span className="text-muted-foreground">—</span>;
}

export function TissueRowActions({
  id,
  status,
}: {
  id: string;
  status: TissueBlockStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(
    next: TissueBlockStatus,
    note?: string,
  ) {
    start(async () => {
      const res = await setTissueStatusAction({ id, status: next, note });
      if (res.ok) router.refresh();
    });
  }

  function onStatus(next: TissueBlockStatus) {
    if (next === status) return;
    let note: string | undefined;
    if (next === "sold" || next === "discarded") {
      const entered = window.prompt(
        `Optional note (${next}) — leave blank for none:`,
      );
      if (entered === null) return;
      note = entered.trim() || undefined;
    }
    run(next, note);
  }

  function onDelete() {
    if (!window.confirm("Delete this tissue block? This cannot be undone.")) {
      return;
    }
    start(async () => {
      const res = await deleteTissueBlockAction(id);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5"
            disabled={pending}
            aria-label="Row actions"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            )}
            <span className="text-xs">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            disabled={pending}
            className={status === "available" ? "bg-primary/10 font-medium" : ""}
            onSelect={() => onStatus("available")}
          >
            Mark available
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={pending}
            className={status === "sold" ? "bg-primary/10 font-medium" : ""}
            onSelect={() => onStatus("sold")}
          >
            Mark sold
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={pending}
            className={status === "discarded" ? "bg-primary/10 font-medium" : ""}
            onSelect={() => onStatus("discarded")}
          >
            Mark discarded
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            className="text-destructive focus:text-destructive"
            onSelect={onDelete}
          >
            Delete block
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
