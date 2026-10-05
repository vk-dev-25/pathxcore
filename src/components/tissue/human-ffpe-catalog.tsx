"use client";

import { useMemo, useState } from "react";
import { GitMerge, Search } from "lucide-react";

import {
  AddToRequestButton,
  BlockRequestBar,
  CustomRequestCard,
  useBlockRequest,
  type RequestItem,
} from "@/components/tissue/block-request";
import {
  TissueThumb,
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
} from "@/lib/tissue/public-catalog";

const systemById = new Map(organSystems.map((system) => [system.id, system]));

type Request = ReturnType<typeof useBlockRequest>;

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

function IndicationRow({
  name,
  kind,
  request,
}: {
  name: string;
  kind: "cancer" | "disease";
  request: Request;
}) {
  const entry: RequestItem = { kind, name };
  const matched: RequestItem = { kind: "matched", name };
  const added = request.has(entry);
  const hasMatched = request.has(matched);

  function toggleEntry() {
    // Removing a cancer item also drops its matched normal adjacent.
    if (added && hasMatched) request.toggle(matched);
    request.toggle(entry);
  }

  return (
    <li
      className={cn(
        "-mx-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60",
        added && "bg-primary/10 hover:bg-primary/15",
      )}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className={cn(added && "font-medium text-primary")}>{name}</span>
        <AddToRequestButton
          compact
          added={added}
          name={name}
          onClick={toggleEntry}
        />
      </div>
      {kind === "cancer" && added ? (
        <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-lab-purple">
          <input
            type="checkbox"
            checked={hasMatched}
            onChange={() => request.toggle(matched)}
            className="h-3.5 w-3.5 accent-[hsl(var(--lab-purple))]"
          />
          Add matched normal adjacent
        </label>
      ) : null}
    </li>
  );
}

export function HumanFfpeCatalog() {
  const request = useBlockRequest();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (text: string) => text.toLowerCase().includes(q);
    return indicationGroups
      .map((group) => {
        const system = systemById.get(group.systemId);
        if (!system) return null;
        const systemMatches = q !== "" && match(system.name);
        const keep = (name: string) => !q || systemMatches || match(name);
        return {
          system,
          cancer: group.cancer.filter(keep),
          disease: group.disease.filter(keep),
        };
      })
      .filter(
        (group): group is NonNullable<typeof group> =>
          group !== null && group.cancer.length + group.disease.length > 0,
      );
  }, [query]);

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
        <SectionHeading
          eyebrow="By indication"
          title="Cancer and disease tissue"
          tone="purple"
        >
          FFPE tissue by indication, grouped by organ system.
        </SectionHeading>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search indication or organ"
              aria-label="Search indication or organ"
              className="pl-9"
            />
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-lab-purple/30 bg-lab-purple/10 px-4 py-3 text-sm lg:max-w-xl">
            <GitMerge
              className="mt-0.5 h-4 w-4 shrink-0 text-lab-purple"
              aria-hidden
            />
            <p>
              <span className="font-semibold">
                Matched normal adjacent available
              </span>{" "}
              <span className="text-muted-foreground">
                for cancer indications. Add an indication, then tick the option
                under it.
              </span>
            </p>
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border/80 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            No indication matches that search. Send a custom request below and
            we&apos;ll source it.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {groups.map(({ system, cancer, disease }) => {
              const visual = systemVisual(system.id);
              const he = systemHeSrc(system.id);
              return (
                <section
                  key={system.id}
                  id={system.id}
                  aria-labelledby={`${system.id}-heading`}
                  className={cn(
                    "scroll-mt-28 overflow-hidden rounded-xl border border-border/80 bg-card transition-all hover:shadow-lg",
                    visual.hover,
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 border-b border-border/70 bg-gradient-to-r to-transparent px-5 py-3.5",
                      visual.wash,
                    )}
                  >
                    {he ? (
                      <TissueThumb
                        src={he}
                        alt={`H&E of ${system.name.toLowerCase()} tissue`}
                        size={48}
                      />
                    ) : null}
                    <h3
                      id={`${system.id}-heading`}
                      className="text-lg font-semibold tracking-tight"
                    >
                      {system.name}
                    </h3>
                  </div>
                  <div className="grid gap-x-6 px-5 py-4 sm:grid-cols-2">
                    {cancer.length > 0 ? (
                      <div>
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-500">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-rose-500"
                            aria-hidden
                          />
                          Cancer
                        </p>
                        <ul className="mt-2">
                          {cancer.map((name) => (
                            <IndicationRow
                              key={name}
                              name={name}
                              kind="cancer"
                              request={request}
                            />
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {disease.length > 0 ? (
                      <div className="mt-4 sm:mt-0">
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-sky-500">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-sky-500"
                            aria-hidden
                          />
                          Disease and other
                        </p>
                        <ul className="mt-2">
                          {disease.map((name) => (
                            <IndicationRow
                              key={name}
                              name={name}
                              kind="disease"
                              request={request}
                            />
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-16">
        <CustomRequestCard />
      </div>

      <BlockRequestBar items={request.items} onToggle={request.toggle} />
    </>
  );
}
