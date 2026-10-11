"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, Plus, Search, X } from "lucide-react";

import {
  AddToRequestButton,
  BlockRequestBar,
  CustomRequestCard,
  useBlockRequest,
  type RequestItem,
} from "@/components/tissue/block-request";
import {
  TissueThumb,
  imageFitClass,
  normalHeSrc,
  systemHeSrc,
} from "@/components/tissue/tissue-images";
import { systemVisual } from "@/components/tissue/tissue-visuals";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  indicationGroups,
  normalControlTissues,
  organSystems,
  systemForTissue,
  type OrganSystem,
} from "@/lib/tissue/public-catalog";

type Request = ReturnType<typeof useBlockRequest>;
type Kind = "cancer" | "disease";

const FORMATS = ["FFPE block", "Unstained slides", "H&E slides"] as const;
type Format = (typeof FORMATS)[number];

/** Organ systems that have indications, in catalog order. */
const SYSTEMS = indicationGroups
  .map((group) => {
    const system = organSystems.find((s) => s.id === group.systemId);
    return system
      ? { system, cancer: group.cancer, disease: group.disease }
      : null;
  })
  .filter(
    (
      entry,
    ): entry is { system: OrganSystem; cancer: string[]; disease: string[] } =>
      entry !== null,
  );

const DEFAULT_SYSTEM =
  SYSTEMS.find((s) => s.system.id === "gastrointestinal")?.system.id ??
  SYSTEMS[0]?.system.id;

function configuredName(name: string, format: Format) {
  return `${name} · ${format}`;
}

function SectionHeading({
  eyebrow,
  title,
  children,
  tone,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  tone: "teal" | "purple";
}) {
  return (
    <div>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.2em]",
          tone === "teal" ? "text-primary" : "text-lab-purple",
        )}
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">{children}</p>
    </div>
  );
}

function KindBadge({ kind }: { kind: Kind }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        kind === "cancer"
          ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
          : "bg-sky-500/15 text-sky-700 dark:text-sky-400",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          kind === "cancer" ? "bg-rose-500" : "bg-sky-500",
        )}
        aria-hidden
      />
      {kind === "cancer" ? "Cancer" : "Disease"}
    </span>
  );
}

/**
 * Product-style card for one indication: pick a format, then add that
 * configuration to the enquiry.
 */
function IndicationCard({
  name,
  kind,
  systemName,
  request,
}: {
  name: string;
  kind: Kind;
  /** Shown in search results, where cards from several systems mix. */
  systemName?: string;
  request: Request;
}) {
  const [format, setFormat] = useState<Format>("FFPE block");
  const entry: RequestItem = { kind, name: configuredName(name, format) };
  const added = request.has(entry);
  const inRequest = request.items.filter(
    (item) =>
      item.kind === kind &&
      (item.name === name || item.name.startsWith(`${name} · `)),
  ).length;

  return (
    <li
      className={cn(
        "flex flex-col rounded-xl border bg-card p-4 transition-all hover:shadow-md",
        inRequest > 0 ? "border-primary/60" : "border-border/80",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {systemName ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {systemName}
            </p>
          ) : null}
          <h4 className="font-semibold leading-snug">{name}</h4>
          {inRequest > 0 ? (
            <p className="mt-0.5 text-xs font-medium text-primary">
              {inRequest} in your enquiry
            </p>
          ) : null}
        </div>
        <KindBadge kind={kind} />
      </div>

      <div
        className="mt-3 flex flex-wrap gap-1.5"
        role="group"
        aria-label={`Format for ${name}`}
      >
        {FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={format === f}
            onClick={() => setFormat(f)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-colors",
              format === f
                ? "border-primary bg-primary/10 font-medium text-foreground"
                : "border-border/80 text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => request.toggle(entry)}
        className={cn(
          "mt-4 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
          added
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : "border-primary/50 text-primary hover:bg-primary/10",
        )}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            Added · remove
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" aria-hidden />
            Add to enquiry
          </>
        )}
      </button>
    </li>
  );
}

function SystemTile({
  system,
  count,
  active,
  onSelect,
}: {
  system: OrganSystem;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  const he = systemHeSrc(system.id);
  return (
    <button
      type="button"
      id={system.id}
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "group relative flex aspect-[4/3] w-full scroll-mt-28 flex-col justify-end overflow-hidden rounded-xl p-3 text-left text-white ring-offset-2 ring-offset-background transition-all",
        active
          ? "ring-2 ring-primary"
          : "hover:-translate-y-0.5 hover:shadow-lg",
      )}
    >
      {he ? (
        <Image
          src={he}
          alt=""
          fill
          sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-110",
            imageFitClass(he),
          )}
        />
      ) : null}
      <span
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-colors",
          active && "from-primary/90 via-primary/30",
        )}
        aria-hidden
      />
      {active ? (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          <Check className="h-3.5 w-3.5" aria-hidden />
        </span>
      ) : null}
      <span className="relative text-base font-semibold leading-tight drop-shadow sm:text-lg">
        {system.name}
      </span>
      <span className="relative text-xs text-white/80">
        {count} {count === 1 ? "indication" : "indications"}
      </span>
    </button>
  );
}

export function HumanFfpeCatalog() {
  const request = useBlockRequest();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(
    DEFAULT_SYSTEM,
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // Header menu links arrive as #<system id>: open that system's panel.
  useEffect(() => {
    function fromHash() {
      const id = window.location.hash.slice(1);
      if (SYSTEMS.some((s) => s.system.id === id)) {
        setSelectedId(id);
        setQuery("");
      }
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const selected = SYSTEMS.find((s) => s.system.id === selectedId);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SYSTEMS.flatMap(({ system, cancer, disease }) => {
      const systemMatches = system.name.toLowerCase().includes(q);
      const keep = (name: string) =>
        systemMatches || name.toLowerCase().includes(q);
      return [
        ...cancer
          .filter(keep)
          .map((name) => ({ name, kind: "cancer" as const, system })),
        ...disease
          .filter(keep)
          .map((name) => ({ name, kind: "disease" as const, system })),
      ];
    });
  }, [query]);

  function selectSystem(id: string) {
    setSelectedId(id);
    setQuery("");
    window.history.replaceState(null, "", `#${id}`);
    requestAnimationFrame(() =>
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      }),
    );
  }

  const searching = query.trim() !== "";

  return (
    <>
      <section id="normal" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Controls"
          title="Normal / control tissue"
          tone="teal"
        >
          Normal human FFPE tissue for assay development, antibody validation,
          and run controls.
        </SectionHeading>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {normalControlTissues.map((item) => {
            const entry: RequestItem = { kind: "normal", name: item.label };
            const added = request.has(entry);
            const system = systemForTissue(item.tissue);
            const visual = systemVisual(system?.id);
            const he = normalHeSrc(item.label);
            return (
              <li
                key={item.label}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-xl border bg-card px-3.5 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  added ? "border-primary/70 shadow-md" : "border-border/80",
                  !added && visual.hover,
                )}
              >
                <span
                  className={cn("absolute inset-y-0 left-0 w-1", visual.bar)}
                  aria-hidden
                />
                {he ? (
                  <TissueThumb
                    src={he}
                    alt={`H&E of ${item.label.toLowerCase()} tissue`}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {system?.name}
                  </p>
                </div>
                <AddToRequestButton
                  compact
                  added={added}
                  name={`normal ${item.label}`}
                  onClick={() => request.toggle(entry)}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section id="indications" className="mt-20 scroll-mt-28">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="By indication"
            title="Cancer and disease tissue"
            tone="purple"
          >
            Pick an organ system, then choose a format for each indication.
          </SectionHeading>
          <div className="relative lg:w-80">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search all indications"
              aria-label="Search all indications"
              className="pl-9 pr-9"
            />
            {searching ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
                <span className="sr-only">Clear search</span>
              </button>
            ) : null}
          </div>
        </div>

        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SYSTEMS.map(({ system, cancer, disease }) => (
            <li key={system.id}>
              <SystemTile
                system={system}
                count={cancer.length + disease.length}
                active={!searching && system.id === selectedId}
                onSelect={() => selectSystem(system.id)}
              />
            </li>
          ))}
        </ul>

        <div
          ref={panelRef}
          className="mt-6 scroll-mt-28 overflow-hidden rounded-2xl border border-border/80 bg-muted/30"
          aria-live="polite"
        >
          {searching ? (
            <div className="p-5 sm:p-6">
              <h3 className="text-lg font-semibold tracking-tight">
                {results.length} {results.length === 1 ? "match" : "matches"}{" "}
                for &ldquo;{query.trim()}&rdquo;
              </h3>
              {results.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Not listed? Send a custom enquiry below and we&apos;ll source
                  it through our partner biobanks.
                </p>
              ) : (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((r) => (
                    <IndicationCard
                      key={`${r.system.id}:${r.name}`}
                      name={r.name}
                      kind={r.kind}
                      systemName={r.system.name}
                      request={request}
                    />
                  ))}
                </ul>
              )}
            </div>
          ) : selected ? (
            <>
              <div
                className={cn(
                  "flex flex-wrap items-center gap-4 border-b border-border/70 bg-gradient-to-r to-transparent px-5 py-5 sm:px-6",
                  systemVisual(selected.system.id).wash,
                )}
              >
                {systemHeSrc(selected.system.id) ? (
                  <TissueThumb
                    src={systemHeSrc(selected.system.id) as string}
                    alt={`H&E of ${selected.system.name.toLowerCase()} tissue`}
                    size={64}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {selected.system.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selected.system.description}
                  </p>
                </div>
              </div>
              <div className="space-y-6 p-5 sm:p-6">
                {(
                  [
                    ["cancer", selected.cancer],
                    ["disease", selected.disease],
                  ] as const
                ).map(([kind, names]) =>
                  names.length > 0 ? (
                    <div key={kind}>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {kind === "cancer" ? "Cancer" : "Disease and other"}
                      </h4>
                      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {names.map((name) => (
                          <IndicationCard
                            key={name}
                            name={name}
                            kind={kind}
                            request={request}
                          />
                        ))}
                      </ul>
                    </div>
                  ) : null,
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <div className="mt-16">
        <CustomRequestCard />
      </div>

      <BlockRequestBar items={request.items} onToggle={request.toggle} />
    </>
  );
}
