"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  FlaskConical,
  Layers,
  Microscope,
  Plus,
  ScanSearch,
  ShieldCheck,
  Square,
  type LucideIcon,
} from "lucide-react";

import {
  BlockRequestBar,
  RequestFormDialog,
  useBlockRequest,
  type RequestItem,
} from "@/components/tissue/block-request";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  mouseOrganPanel,
  onRequestMouseStrains,
  stockedMouseStrains,
} from "@/lib/tissue/mouse-catalog";

const PRODUCTS = ["FFPE blocks", "Custom FFPE slides"] as const;

const ORDER_OPTIONS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "FFPE blocks",
    body: "Single-organ blocks or multi-organ blocks from one animal.",
    icon: Square,
  },
  {
    title: "Custom FFPE slides",
    body: "Unstained sections cut to your thickness and slide type, or stained with H&E, IHC, or multiplex IF.",
    icon: Layers,
  },
];

const USE_CASES: {
  title: string;
  body: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    title: "Antibody specificity",
    body: "Show that anti-human antibodies used in humanized-mouse studies don't stain mouse tissue.",
    icon: ShieldCheck,
    tone: "bg-lab-purple/15 text-lab-purple",
  },
  {
    title: "Baseline histology",
    body: "Know what normal looks like in each strain before reading study tissue.",
    icon: ScanSearch,
    tone: "bg-primary/15 text-primary",
  },
  {
    title: "Assay development",
    body: "Set up and validate IHC and multiplex IF panels before study samples arrive.",
    icon: Microscope,
    tone: "bg-sky-500/15 text-sky-500",
  },
  {
    title: "Study controls",
    body: "Strain-matched normal tissue for syngeneic, xenograft, and humanized models.",
    icon: FlaskConical,
    tone: "bg-amber-500/15 text-amber-500",
  },
];

const COLLECTION_STEPS = [
  {
    title: "Plan the collection",
    body: "Agree the organ list, fixation, and block or slide format for your study.",
  },
  {
    title: "Arrange the animals",
    body: "We confirm logistics for your animals or tissues and timing with you.",
  },
  {
    title: "Collection and fixation",
    body: "Tissues are collected to your organ list and fixed in formalin.",
  },
  {
    title: "Blocks and slides back",
    body: "We process and embed to FFPE, then return blocks, slides, or stained sections.",
  },
];

const OTHER_STRAIN_TEMPLATE = [
  "Mouse FFPE enquiry: other strain (research use only)",
  "",
  "Strain or line:",
  "Sex and age:",
  "Organs:",
  "Blocks or slides (unstained / H&E / IHC / multiplex IF):",
  "Quantity:",
  "Timeline:",
].join("\n");

const COLLECTION_TEMPLATE = [
  "Custom collection from my animals (research use only)",
  "",
  "Species and strain:",
  "Number of animals, sex, and age:",
  "Study type (e.g. efficacy, toxicology, humanized model):",
  "Organs to collect:",
  "Fixation needs:",
  "Output (FFPE blocks / unstained slides / H&E / IHC / multiplex IF):",
  "Location and timing:",
].join("\n");

function SectionHeading({
  eyebrow,
  title,
  children,
  tone = "teal",
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  tone?: "teal" | "purple";
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
      {children ? (
        <p className="mt-2 max-w-2xl text-muted-foreground">{children}</p>
      ) : null}
    </div>
  );
}

export function MouseCatalog() {
  const request = useBlockRequest();
  const [dialog, setDialog] = useState<"other" | "collection" | null>(null);

  return (
    <>
      <section id="strains" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Core strains"
          title="Tissue for humanized, syngeneic, and knockout studies"
        >
          FFPE tissue blocks and custom slides from these strains, ready to
          order.
        </SectionHeading>

        <ul className="mt-7 grid gap-4 lg:grid-cols-3">
          {stockedMouseStrains.map((strain) => (
            <li
              key={strain.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className={cn(
                  "relative bg-gradient-to-br to-transparent px-6 pb-5 pt-6",
                  strain.accent.wash,
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-1",
                    strain.accent.bar,
                  )}
                  aria-hidden
                />
                <p
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                    strain.accent.chip,
                  )}
                >
                  {strain.type}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  {strain.name}
                </h3>
                {strain.sexes ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {strain.sexes.join(" and ")} available
                  </p>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {strain.summary}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Used for
                </p>
                <ul className="mt-2 space-y-1.5">
                  {strain.usedFor.map((use) => (
                    <li key={use} className="flex gap-2 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      {use}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {PRODUCTS.map((product) => {
                    const entry: RequestItem = {
                      kind: "mouse",
                      name: `${strain.name}: ${product}`,
                    };
                    const added = request.has(entry);
                    return (
                      <button
                        key={product}
                        type="button"
                        aria-pressed={added}
                        onClick={() => request.toggle(entry)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          added
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/80 text-foreground hover:border-primary hover:text-primary",
                        )}
                      >
                        {added ? (
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {product}
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="rounded-2xl border border-border/80 bg-card p-6">
            <h3 className="font-semibold tracking-tight">
              Standard organ panel
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Availability varies by strain and sex. Tell us the organs you need
              in your enquiry.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {mouseOrganPanel.map((organ) => (
                <li
                  key={organ}
                  className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-sm"
                >
                  {organ}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <h3 className="font-semibold tracking-tight">What you can order</h3>
            <ul className="mt-4 space-y-4">
              {ORDER_OPTIONS.map(({ title, body, icon: Icon }) => (
                <li key={title} className="flex gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          eyebrow="Why it matters"
          title="Built for mouse studies"
        >
          Strain-matched mouse tissue for the work that surrounds an in vivo
          study.
        </SectionHeading>
        <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map(({ title, body, icon: Icon, tone }) => (
            <li
              key={title}
              className="rounded-xl border border-border/80 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  tone,
                )}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold tracking-tight">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="other-strains" className="mt-20 scroll-mt-28">
        <SectionHeading
          eyebrow="On request"
          title="Other strains"
          tone="purple"
        >
          Blocks and slides from other strains are available on request.
        </SectionHeading>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {onRequestMouseStrains.map((group) => (
            <div
              key={group.group}
              className="rounded-xl border border-border/80 bg-card p-5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {group.group}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.strains.map((strain) => (
                  <li
                    key={strain}
                    className="rounded-full border border-lab-purple/30 bg-lab-purple/10 px-3 py-1 text-sm"
                  >
                    {strain}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-6 font-semibold"
          onClick={() => setDialog("other")}
        >
          Request another strain
          <ArrowRight aria-hidden />
        </Button>
      </section>

      <section
        id="custom-collection"
        aria-labelledby="custom-collection-heading"
        className="relative mt-20 scroll-mt-28 overflow-hidden rounded-2xl border border-lab-purple/30 bg-gradient-to-br from-lab-purple/15 via-card to-primary/15 px-6 py-10 sm:px-10"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-lab-purple/20 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lab-purple">
            Custom collection
          </p>
          <h2
            id="custom-collection-heading"
            className="mt-2 text-3xl font-semibold tracking-tight"
          >
            Your animals, our FFPE blocks.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            We collect tissue from animals you provide and turn it into FFPE
            blocks and slides, to your organ list and study design.
          </p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COLLECTION_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-border/80 bg-card/80 p-4"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lab-purple text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <p className="mt-2 font-semibold tracking-tight">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <Button
            type="button"
            className="mt-8 font-semibold"
            onClick={() => setDialog("collection")}
          >
            Plan a custom collection
            <ArrowRight aria-hidden />
          </Button>
        </div>
      </section>

      <RequestFormDialog
        open={dialog === "other"}
        onOpenChange={(open) => setDialog(open ? "other" : null)}
        title="Request another strain"
        intro="Tell us the strain and what you need. We'll check availability through our partners and reply by email."
        template={OTHER_STRAIN_TEMPLATE}
      />
      <RequestFormDialog
        open={dialog === "collection"}
        onOpenChange={(open) => setDialog(open ? "collection" : null)}
        title="Custom collection from your animals"
        intro="Fill in what you can. We'll confirm logistics, timing, and pricing by email."
        template={COLLECTION_TEMPLATE}
      />

      <BlockRequestBar items={request.items} onToggle={request.toggle} />
    </>
  );
}
