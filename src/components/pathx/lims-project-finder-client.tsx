"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LimsProjectListRow } from "@/app/pathx/(dashboard)/lims/projects/page";
import {
  formatLimsProjectStatusLabel,
  type LimsProjectStatus,
} from "@/lib/lims/types";
import { cn } from "@/lib/utils";

import {
  pathxCardClass as cardClass,
  pathxFieldClass as fieldClass,
} from "@/components/pathx/workspace-field-classes";

function statusBadge(s: LimsProjectStatus): string {
  if (s === "completed") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (s === "cancelled") return "bg-muted text-muted-foreground";
  if (s === "blocked") return "bg-destructive/15 text-destructive";
  if (s === "shipped") return "bg-primary/15 text-primary";
  if (s === "started") return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-muted/80 text-muted-foreground dark:bg-white/[0.06]";
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function haystack(r: LimsProjectListRow): string {
  return [
    r.project_reference,
    r.id,
    r.searchText,
    r.client_org_name,
    r.project_title,
    r.status,
    formatLimsProjectStatusLabel(r.status),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

type SortKey = "date_desc" | "date_asc" | "ref_asc";

export function LimsProjectFinderClient({
  projects,
}: {
  projects: LimsProjectListRow[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q ? projects.filter((r) => haystack(r).includes(q)) : [...projects];

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
      case "ref_asc":
        rows.sort((a, b) => a.project_reference.localeCompare(b.project_reference));
        break;
      default:
        break;
    }
    return rows;
  }, [projects, query, sort]);

  return (
    <>
      <Card className={cn(cardClass, "mt-10")}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Filter &amp; sort</CardTitle>
          <CardDescription>
            Search by project ID (PRJ…, legacy PTX-PRJ… / PTX-PR…, UUID), sample ID,
            client sample ID, slide ID, org, title, or status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="lims-search" className="text-foreground">
              Search
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lims-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="PRJ1, sample ref, client ID, slide ref, UUID…"
                className={cn("pl-9", fieldClass)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-2 sm:w-56">
            <Label htmlFor="lims-sort" className="text-foreground">
              Sort
            </Label>
            <select
              id="lims-sort"
              className={cn(
                "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
                fieldClass,
              )}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="date_desc" className="bg-card text-foreground">
                Newest first
              </option>
              <option value="date_asc" className="bg-card text-foreground">
                Oldest first
              </option>
              <option value="ref_asc" className="bg-card text-foreground">
                Project ID (A–Z)
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        {filteredSorted.length === projects.length
          ? `${projects.length} project${projects.length === 1 ? "" : "s"}`
          : `${filteredSorted.length} of ${projects.length} project${projects.length === 1 ? "" : "s"}`}
      </p>

      {filteredSorted.length === 0 ? (
        <Card className={cn(cardClass, "mt-6 border-dashed")}>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {projects.length === 0
              ? "No projects yet. Create one from a saved quote (preview → Create project)."
              : "No projects match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card/60 dark:border-white/[0.08] dark:bg-card/40">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground dark:border-white/[0.08]">
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Project ID</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50 dark:border-white/[0.06] dark:hover:bg-white/[0.06]"
                  onClick={() => {
                    window.location.href = `/pathx/lims/projects/${row.id}`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      window.location.href = `/pathx/lims/projects/${row.id}`;
                    }
                  }}
                >
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-primary">
                    {row.project_reference}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground">
                    {row.client_org_name ?? "—"}
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-muted-foreground">
                    {row.project_title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                        statusBadge(row.status),
                      )}
                    >
                      {formatLimsProjectStatusLabel(row.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
