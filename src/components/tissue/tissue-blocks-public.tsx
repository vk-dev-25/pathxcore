"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  cellLineBlocks,
  ffpeArchive,
  organSystems,
  rangeRank,
  type ArchiveRow,
  type OrganSystem,
} from "@/lib/tissue/public-catalog";

type SortKey = keyof ArchiveRow;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "tissue", label: "Organ / tissue" },
  { key: "Normal/Control", label: "Normal / control", numeric: true },
  { key: "Benign", label: "Benign", numeric: true },
  { key: "Pre-malignant", label: "Pre-malignant", numeric: true },
  { key: "Malignant", label: "Malignant", numeric: true },
  { key: "total", label: "Total cases", numeric: true },
  { key: "inflammatory", label: "Inflammatory / infectious", numeric: true },
  { key: "age", label: "Age at collection" },
  { key: "sex", label: "Sex split" },
];

const TEXT_SORT = new Set<SortKey>(["tissue", "age", "sex"]);

function sortRows(rows: ArchiveRow[], key: SortKey, dir: 1 | -1) {
  return [...rows].sort((a, b) => {
    if (TEXT_SORT.has(key)) {
      return String(a[key] ?? "").localeCompare(String(b[key] ?? "")) * dir;
    }
    return (rangeRank(String(a[key])) - rangeRank(String(b[key]))) * dir;
  });
}

function SortedArchive({
  rows,
  defaultKey = "total",
  defaultDir = -1,
}: {
  rows: ArchiveRow[];
  defaultKey?: SortKey;
  defaultDir?: 1 | -1;
}) {
  const [sortKey, setSortKey] = useState<SortKey>(defaultKey);
  const [sortDir, setSortDir] = useState<1 | -1>(defaultDir);
  const sorted = useMemo(
    () => sortRows(rows, sortKey, sortDir),
    [rows, sortDir, sortKey],
  );

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 1 ? -1 : 1));
      return;
    }
    setSortKey(key);
    setSortDir(TEXT_SORT.has(key) ? 1 : -1);
  }

  return (
    <AvailabilityTable
      rows={sorted}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={onSort}
    />
  );
}

function AvailabilityTable({
  rows,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: ArchiveRow[];
  sortKey: SortKey;
  sortDir: 1 | -1;
  onSort: (key: SortKey) => void;
}) {
  return (
    <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-border/80 bg-muted/40">
            {COLUMNS.map((col) => {
              const active = sortKey === col.key;
              const Icon = !active ? ArrowUpDown : sortDir === 1 ? ArrowUp : ArrowDown;
              return (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    col.numeric && "text-right",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-foreground",
                      col.numeric && "ml-auto",
                      active && "text-primary",
                    )}
                  >
                    {col.label}
                    <Icon className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="sr-only">
                      {active
                        ? sortDir === 1
                          ? ", sorted ascending"
                          : ", sorted descending"
                        : ", sort"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.tissue}
              className="border-b border-border/60 last:border-0 hover:bg-muted/30"
            >
              <td className="px-3 py-2.5 font-medium">{row.tissue}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                {row["Normal/Control"]}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                {row.Benign}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                {row["Pre-malignant"]}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                {row.Malignant}
              </td>
              <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                {row.total}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                {row.inflammatory}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                {row.age}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                {row.sex}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TissueBlocksCatalog() {
  const [systemId, setSystemId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cellQuery, setCellQuery] = useState("");
  const [openCellLines, setOpenCellLines] = useState<Set<string>>(
    () => new Set(),
  );

  const selected = organSystems.find((system) => system.id === systemId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allowed = selected ? new Set(selected.tissues) : null;
    const filtered = ffpeArchive.rows.filter((row) => {
      if (allowed && !allowed.has(row.tissue)) return false;
      if (q && !row.tissue.toLowerCase().includes(q)) return false;
      return true;
    });
    return filtered;
  }, [query, selected]);

  const cellLines = useMemo(() => {
    const q = cellQuery.trim().toLowerCase();
    return cellLineBlocks.filter((line) => {
      if (!q) return true;
      return (
        line.cellType.toLowerCase().includes(q) ||
        line.origin.toLowerCase().includes(q) ||
        line.ihc.toLowerCase().includes(q)
      );
    });
  }, [cellQuery]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("system");
    if (id && organSystems.some((system) => system.id === id)) {
      setSystemId(id);
    }
  }, []);

  function chooseSystem(system: OrganSystem | null) {
    setSystemId(system?.id ?? null);
    document.getElementById("availability")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="mt-12 space-y-14">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Browse by organ system
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Choose a system to see the FFPE organs inside it, or search the
              full archive below.
            </p>
          </div>
          {selected ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSystemId(null)}
            >
              Show all tissues
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {organSystems.map((system) => {
            const active = system.id === systemId;
            return (
              <button
                key={system.id}
                type="button"
                aria-pressed={active}
                onClick={() => chooseSystem(active ? null : system)}
                className={cn(
                  "rounded-xl border bg-card px-4 py-4 text-left text-sm font-semibold leading-snug transition-colors",
                  active
                    ? "border-primary shadow-[inset_0_-3px_0_0_hsl(var(--primary))]"
                    : "border-border/80 hover:border-primary/45",
                )}
              >
                {system.name}
              </button>
            );
          })}
        </div>
      </section>

      <section id="availability" className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {selected
                ? `${selected.name} availability`
                : "FFPE archive availability"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {selected
                ? selected.description
                : ffpeArchive.subtitle}{" "}
              Counts are case ranges, not exact inventory.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "organ" : "organs"}
          </p>
        </div>

        <div className="relative mt-5 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search organ or tissue, e.g. breast, lung, colon"
            aria-label="Search organ or tissue"
            className="pl-9"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No organs match that search
              {selected ? ` in ${selected.name}` : ""}.
            </p>
          ) : (
            <SortedArchive rows={rows} />
          )}
        </div>

        <div className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
          {ffpeArchive.footnotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </section>

      <section id="cell-lines" className="scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight">
          Cell line FFPE blocks
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pellet blocks for antibody optimization and run controls in IHC, in
          addition to the human tissue archive. Open a line to see where it
          came from and how it is used in immunohistochemistry. Those notes
          describe the published control use of the line, not a stain result
          for a specific block.
        </p>

        <div className="relative mt-5 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={cellQuery}
            onChange={(event) => setCellQuery(event.target.value)}
            placeholder="Search cell line, e.g. A549, MCF-7"
            aria-label="Search cell line"
            className="pl-9"
          />
        </div>

        {cellLines.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No cell lines match that search.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {cellLines.map((line) => {
              const q = cellQuery.trim().toLowerCase();
              const matchesDetail =
                q.length > 0 &&
                (line.origin.toLowerCase().includes(q) ||
                  line.ihc.toLowerCase().includes(q));
              const expanded = openCellLines.has(line.cellType);
              return (
                <li
                  key={line.cellType}
                  className={cn(
                    "rounded-xl border bg-card",
                    expanded ? "border-primary/40" : "border-border/80",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() =>
                      setOpenCellLines((current) => {
                        const next = new Set(current);
                        if (next.has(line.cellType)) next.delete(line.cellType);
                        else next.add(line.cellType);
                        return next;
                      })
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="font-semibold tracking-tight">
                      {line.cellType}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-primary">
                        {line.format}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expanded && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </span>
                  </button>
                  {!expanded && matchesDetail ? (
                    <p className="px-4 pb-3 text-xs text-muted-foreground">
                      Matches origin or IHC use. Open to read it.
                    </p>
                  ) : null}
                  {expanded ? (
                    <div className="border-t border-border/70 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Origin
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {line.origin}
                      </p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        IHC use
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {line.ihc}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight">
          Other specimen types
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {ffpeArchive.nonTissueNote}
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
          <SortedArchive rows={ffpeArchive.nonTissueRows} />
        </div>
      </section>
    </div>
  );
}
