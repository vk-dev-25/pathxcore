"use client";

import type { Dispatch, SetStateAction } from "react";
import { Filter } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props<T extends string> = {
  columnTitle?: string;
  allValues: readonly T[];
  included: Set<T>;
  setIncluded: Dispatch<SetStateAction<Set<T>>>;
  formatLabel?: (value: T) => string;
};

/** Excel-style column filter: checkbox list on the Status header. */
export function ExcelStatusColumnFilter<T extends string>({
  columnTitle = "Status",
  allValues,
  included,
  setIncluded,
  formatLabel = (v) => String(v),
}: Props<T>) {
  const allSelected = allValues.every((v) => included.has(v));
  const noneSelected = included.size === 0;
  const filterActive = !allSelected;

  const selectAllChecked: boolean | "indeterminate" = allSelected
    ? true
    : noneSelected
      ? false
      : "indeterminate";

  const toggle = (v: T) => {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider hover:text-foreground",
            filterActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          {columnTitle}
          <Filter
            className={cn("h-3.5 w-3.5", filterActive && "text-primary")}
            aria-hidden
          />
          {filterActive ? (
            <span className="sr-only">Filter active</span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-xs font-normal normal-case tracking-normal text-muted-foreground">
          Show rows where status is
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={selectAllChecked}
          onCheckedChange={(checked) => {
            setIncluded(checked ? new Set(allValues) : new Set());
          }}
          onSelect={(e) => e.preventDefault()}
        >
          (Select all)
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {allValues.map((v) => (
          <DropdownMenuCheckboxItem
            key={v}
            checked={included.has(v)}
            onCheckedChange={() => toggle(v)}
            onSelect={(e) => e.preventDefault()}
          >
            <span className="capitalize">{formatLabel(v)}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
