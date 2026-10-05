"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import {
  AddToRequestButton,
  BlockRequestBar,
  useBlockRequest,
} from "@/components/tissue/block-request";
import { CellBlockService } from "@/components/tissue/cell-block-service";
import { TissueThumb, cellLineIhc } from "@/components/tissue/tissue-images";
import { cellTissueVisual } from "@/components/tissue/tissue-visuals";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { cellLineBlocks, type MarkerStatus } from "@/lib/tissue/public-catalog";

const MARKER_STATUS_LABEL: Record<MarkerStatus, string> = {
  pos: "+",
  neg: "−",
  low: "low",
};

const MARKER_STATUS_CLASS: Record<MarkerStatus, string> = {
  pos: "border-emerald-500/40 bg-emerald-500/15 text-emerald-500",
  neg: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  low: "border-dashed border-amber-500/50 bg-amber-500/10 text-amber-500",
};

const TISSUES = [...new Set(cellLineBlocks.map((l) => l.tissue))].sort((a, b) =>
  a.localeCompare(b),
);

const MARKERS = [
  ...new Set(cellLineBlocks.flatMap((l) => l.markers.map((m) => m.name))),
].sort((a, b) => a.localeCompare(b));

export function CellPelletCatalog() {
  const request = useBlockRequest();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [tissue, setTissue] = useState("");
  const [marker, setMarker] = useState("");

  // Header menu links arrive as ?tissue=<tissue of origin>.
  useEffect(() => {
    const fromUrl = searchParams.get("tissue");
    if (fromUrl && TISSUES.includes(fromUrl)) {
      setTissue(fromUrl);
      setQuery("");
      setMarker("");
    }
  }, [searchParams]);

  const lines = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cellLineBlocks.filter((line) => {
      if (tissue && line.tissue !== tissue) return false;
      if (marker && !line.markers.some((m) => m.name === marker)) return false;
      if (
        q &&
        ![line.cellType, line.tissue, line.origin, line.ihc]
          .join(" ")
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [query, tissue, marker]);

  const filtering = query.trim() !== "" || tissue !== "" || marker !== "";

  return (
    <>
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cell line or use"
              aria-label="Search cell line or use"
              className="pl-9"
            />
          </div>
          <select
            value={marker}
            onChange={(event) => setMarker(event.target.value)}
            aria-label="IHC marker"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All IHC markers</option>
            {MARKERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {filtering ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTissue("");
                setMarker("");
              }}
              className="px-2 text-sm text-primary underline-offset-4 hover:underline sm:ml-auto"
            >
              Clear all
            </button>
          ) : null}
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Tissue of origin"
        >
          <button
            type="button"
            aria-pressed={tissue === ""}
            onClick={() => setTissue("")}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              tissue === ""
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/80 text-muted-foreground hover:text-foreground",
            )}
          >
            All tissues
          </button>
          {TISSUES.map((t) => {
            const visual = cellTissueVisual(t);
            const active = tissue === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setTissue(active ? "" : t)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? cn("border-transparent font-medium", visual.chip)
                    : cn(
                        "border-border/80 text-muted-foreground hover:text-foreground",
                        visual.hover,
                      ),
                )}
              >
                <span
                  className={cn("h-2 w-2 rounded-full", visual.bar)}
                  aria-hidden
                />
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Marker tags:{" "}
        <span className="font-medium text-emerald-500">+ positive</span>
        {" · "}
        <span className="font-medium text-rose-500">− negative</span>
        {" · "}
        <span className="font-medium text-amber-500">low</span>
      </p>

      {lines.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border/80 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          No cell lines match. Clear a filter, or send a custom request below.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lines.map((line) => {
            const entry = { kind: "cell" as const, name: line.cellType };
            const added = request.has(entry);
            const visual = cellTissueVisual(line.tissue);
            const ihc = cellLineIhc(line);
            return (
              <li
                key={line.cellType}
                className={cn(
                  "flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  added ? "border-primary/70 shadow-md" : "border-border/80",
                  !added && visual.hover,
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 bg-gradient-to-r to-transparent px-5 py-4",
                    visual.wash,
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <TissueThumb
                      src={ihc.src}
                      alt={`Example ${ihc.label} immunohistochemistry`}
                      size={56}
                      label={ihc.label.replace(" example", "")}
                    />
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold leading-tight tracking-tight">
                        {line.cellType}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {line.tissue}
                      </p>
                    </div>
                  </div>
                  <AddToRequestButton
                    added={added}
                    name={line.cellType}
                    onClick={() => request.toggle(entry)}
                  />
                </div>

                <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
                  {line.markers.length > 0 ? (
                    <ul
                      className="flex flex-wrap gap-1.5"
                      aria-label="Marker profile"
                    >
                      {line.markers.map((m) => (
                        <li
                          key={m.name}
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-xs font-semibold",
                            MARKER_STATUS_CLASS[m.status],
                          )}
                        >
                          {m.name} {MARKER_STATUS_LABEL[m.status]}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <p className="mb-4 mt-4 text-sm leading-relaxed text-muted-foreground">
                    {line.origin}
                  </p>
                  <p className="mt-auto border-t border-border/70 pt-3 text-sm leading-relaxed">
                    <span className="font-medium">IHC use: </span>
                    <span className="text-muted-foreground">{line.ihc}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Marker profiles reflect the published identity of each line and how it
        is used as an IHC control. Thumbnails are illustrative IHC examples of
        the labelled marker in tissue (Ki-67 where no marker image is
        available), not stains of these cell blocks.
      </p>

      <div className="mt-12">
        <CellBlockService />
      </div>

      <BlockRequestBar items={request.items} onToggle={request.toggle} />
    </>
  );
}
