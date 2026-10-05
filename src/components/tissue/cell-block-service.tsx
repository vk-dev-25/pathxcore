"use client";

import { useState } from "react";
import {
  ArrowRight,
  Combine,
  Dna,
  FlaskConical,
  LayoutGrid,
  Microscope,
  Scissors,
  Square,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

import { RequestFormDialog } from "@/components/tissue/block-request";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CELL_TYPES: {
  title: string;
  body: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    title: "Transfected lines",
    body: "Overexpression of your own target or custom marker, as a positive control.",
    icon: Dna,
    tone: "bg-emerald-500/15 text-emerald-500",
  },
  {
    title: "Knockout lines",
    body: "CRISPR or other knockouts, as a true negative control for antibody specificity.",
    icon: Scissors,
    tone: "bg-rose-500/15 text-rose-500",
  },
  {
    title: "Knockdown lines",
    body: "siRNA or shRNA knockdowns to show reduced staining against the parent line.",
    icon: TrendingDown,
    tone: "bg-amber-500/15 text-amber-500",
  },
  {
    title: "Isogenic pairs",
    body: "Parent and modified lines blocked side by side for a matched positive and negative.",
    icon: Combine,
    tone: "bg-lab-purple/15 text-lab-purple",
  },
  {
    title: "Treated cells",
    body: "Drug-treated, stimulated, or time-course samples for pharmacodynamic IHC.",
    icon: FlaskConical,
    tone: "bg-sky-500/15 text-sky-500",
  },
  {
    title: "Primary and other cells",
    body: "Primary, patient-derived, or any other cells you need in FFPE.",
    icon: Microscope,
    tone: "bg-primary/15 text-primary",
  },
];

const FORMATS: {
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Cell pellet blocks",
    body: "One FFPE block per cell line or condition.",
    icon: Square,
  },
  {
    title: "Low-density cell TMA",
    body: "Several cell lines or conditions on one block, so positive and negative controls stain on the same slide in every IHC run.",
    icon: LayoutGrid,
  },
];

const STEPS = [
  {
    title: "Tell us about your cells",
    body: "Cell lines, modifications, targets, and the format you need.",
  },
  {
    title: "Ship your cells",
    body: "We confirm cell numbers and send shipping instructions.",
  },
  {
    title: "We make the FFPE blocks",
    body: "Your cells are fixed, pelleted, and paraffin-embedded as blocks or a cell TMA.",
  },
  {
    title: "Receive blocks or slides",
    body: "Get the blocks back, or add sections, H&E, or IHC on our side.",
  },
];

const TEMPLATE = [
  "Custom cell block request (research use only)",
  "",
  "Cells supplied by (us / me):",
  "Cell line(s):",
  "Species:",
  "Modification (transfected / knockout / knockdown / treated / none):",
  "Target or marker:",
  "Number of lines or conditions:",
  "Format (cell pellet blocks / low-density cell TMA):",
  "Number of blocks:",
  "Also needed (sections, H&E, IHC):",
  "Biosafety notes:",
  "Timeline:",
].join("\n");

/**
 * Service section: clients send their own cells (transfected, knockout,
 * knockdown, etc.) and we make FFPE cell pellet blocks or a low-density cell
 * TMA for IHC assays.
 */
export function CellBlockService() {
  const [open, setOpen] = useState(false);

  return (
    <section
      id="your-cells"
      aria-labelledby="your-cells-heading"
      className="relative scroll-mt-28 overflow-hidden rounded-2xl border border-lab-purple/30 bg-gradient-to-br from-lab-purple/15 via-card to-primary/15 px-6 py-10 sm:px-10"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-lab-purple/20 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lab-purple">
          Custom cell blocks
        </p>
        <h2
          id="your-cells-heading"
          className="mt-2 text-3xl font-semibold tracking-tight"
        >
          Send us your cells. We&apos;ll make the FFPE blocks.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Turn your own cell lines into FFPE controls for antibody validation
          and IHC assay development, including lines with your own custom
          markers.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CELL_TYPES.map(({ title, body, icon: Icon, tone }) => (
            <li
              key={title}
              className="flex gap-3 rounded-xl border border-border/80 bg-card/80 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  tone,
                )}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Formats
            </h3>
            <ul className="mt-3 space-y-3">
              {FORMATS.map(({ title, body, icon: Icon }) => (
                <li
                  key={title}
                  className="flex gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold tracking-tight">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              How it works
            </h3>
            <ol className="mt-3 grid gap-3 sm:grid-cols-2">
              {STEPS.map((step, i) => (
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
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            type="button"
            className="font-semibold"
            onClick={() => setOpen(true)}
          >
            Request blocks from your cells
            <ArrowRight aria-hidden />
          </Button>
          <p className="text-sm text-muted-foreground">
            Need a catalog line we don&apos;t list? Use the same form.
          </p>
        </div>
      </div>

      <RequestFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Blocks from your cells"
        intro="Fill in what you can. We'll confirm cell numbers, shipping, and timing by email."
        template={TEMPLATE}
      />
    </section>
  );
}
