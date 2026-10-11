import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  Layers,
  ListChecks,
  Microscope,
  Scan,
  ShieldCheck,
  Stethoscope,
  Tag,
  TestTube,
  Users,
  type LucideIcon,
} from "lucide-react";

import { LabGallery } from "@/components/lab-gallery";
import { TissuePageHeader } from "@/components/tissue/tissue-page-header";
import { Button } from "@/components/ui/button";
import {
  expertiseAreas,
  preclinicalSteps,
  serviceCapabilities,
} from "@/lib/site-content";
import { marketingMetadata } from "@/lib/site-seo";
import { TISSUE_ROUTES } from "@/lib/tissue/public-catalog";

export const metadata: Metadata = marketingMetadata({
  title:
    "Research Pathology Services | Histology, IHC, Multiplex IF & Whole-Slide Scanning | PathXDx",
  description:
    "Histology, IHC, multiplex immunofluorescence, pathologist evaluation, and whole-slide scanning across organ systems. Research use only.",
  path: "/preclinical-services",
});

const CAPABILITY_STYLE: Record<string, { icon: LucideIcon; tone: string }> = {
  "slide-scanning": { icon: Scan, tone: "bg-primary/15 text-primary" },
  multiplex: { icon: Layers, tone: "bg-lab-purple/15 text-lab-purple" },
  ihc: { icon: TestTube, tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  histology: { icon: Microscope, tone: "bg-pink-500/15 text-pink-700 dark:text-pink-400" },
  "pathologist-evaluation": {
    icon: Stethoscope,
    tone: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  },
};

const PILLARS = [
  {
    title: "Everything under one roof",
    body: "Histology, staining, and whole-slide scanning happen in our own lab. No pass-through vendors, no queue behind someone else's work, and one point of accountability from block to slide.",
    icon: Scan,
  },
  {
    title: "Multiplex without building it yourself",
    body: "Multiplex immunofluorescence takes real optimization to get right. We've done that work, so you don't need to stand up the capability internally for a single study.",
    icon: Layers,
  },
  {
    title: "A technologist who knows your protocol",
    body: "Named technologists are assigned to your program. They learn your tissue, your protocol, and your acceptance criteria.",
    icon: Users,
  },
  {
    title: "Straight answers on scope",
    body: "If a study design won't produce the data you need, we say so before you commit, not after.",
    icon: ShieldCheck,
  },
];

const TRACKING: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Accessioned on arrival",
    body: "Each sample gets a unique ID, logged with species, tissue, and the services you ordered.",
    icon: ClipboardList,
  },
  {
    title: "Labeled samples and slides",
    body: "Every sample and slide carries a printed label that matches its LIMS record.",
    icon: Tag,
  },
  {
    title: "Every step recorded",
    body: "Processing, sectioning, and staining steps are logged with who did them and when.",
    icon: ListChecks,
  },
];

const RECORD_STEPS: { step: string; done: boolean }[] = [
  { step: "Received and accessioned", done: true },
  { step: "Processed and embedded", done: true },
  { step: "Sectioned", done: true },
  { step: "Stained", done: false },
  { step: "Scanned", done: false },
];

/** Illustrative LIMS sample record (not a screenshot of the real system). */
function SampleRecordPreview() {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/50 px-5 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sample record
          </p>
          <p className="font-mono text-sm font-semibold">Sample 03 · Mouse liver</p>
        </div>
        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          In progress
        </span>
      </div>
      <ol className="space-y-2.5 px-5 py-4">
        {RECORD_STEPS.map(({ step, done }) => (
          <li key={step} className="flex items-center gap-2.5 text-sm">
            {done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <Circle
                className="h-4 w-4 shrink-0 text-muted-foreground/60"
                aria-hidden
              />
            )}
            <span className={done ? "" : "text-muted-foreground"}>{step}</span>
            {done ? (
              <span className="ml-auto text-xs text-muted-foreground">
                logged
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-1.5 border-t border-border/70 px-5 py-3">
        {["Slide 01", "Slide 02", "Slide 03"].map((slide) => (
          <span
            key={slide}
            className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-background px-2 py-0.5 font-mono text-xs"
          >
            <Tag className="h-3 w-3 text-primary" aria-hidden />
            {slide}
          </span>
        ))}
      </div>
      <figcaption className="border-t border-border/70 px-5 py-2 text-[11px] text-muted-foreground">
        Illustration
      </figcaption>
    </figure>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      {children ? (
        <p className="mt-2 max-w-2xl text-muted-foreground">{children}</p>
      ) : null}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <TissuePageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        eyebrow="Research use only"
        title="Research pathology services"
        actions={
          <>
            <Button asChild className="font-semibold">
              <Link href="/contact">
                Discuss your study
                <ArrowRight className="ml-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold">
              <Link href="#workflow">See the workflow</Link>
            </Button>
          </>
        }
      >
        <p>
          Histology, IHC, multiplex immunofluorescence, pathologist evaluation,
          and whole-slide scanning for preclinical, discovery, and
          translational programs. Share your study design and we&apos;ll tell
          you what&apos;s feasible, what it costs, and how long it takes before
          you commit.
        </p>
      </TissuePageHeader>

      <section id="capabilities" className="mt-16 scroll-mt-28">
        <SectionHeading eyebrow="Capabilities" title="What we do" />
        <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serviceCapabilities.map((cap) => {
            const style = CAPABILITY_STYLE[cap.id];
            const Icon = style?.icon ?? Microscope;
            return (
              <li
                key={cap.id}
                id={cap.id}
                className="flex scroll-mt-28 flex-col rounded-2xl border border-border/80 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${style?.tone ?? "bg-primary/15 text-primary"}`}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {cap.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cap.summary}
                </p>
                <ul className="mt-4 space-y-1.5 border-t border-border/70 pt-4">
                  {cap.details.map((detail) => (
                    <li key={detail} className="flex gap-2 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
          <li>
            <Link
              href={TISSUE_ROUTES.landing}
              className="group flex h-full flex-col justify-between rounded-2xl border border-lab-purple/30 bg-gradient-to-br from-lab-purple/15 via-card to-primary/15 p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Tissue blocks
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Human FFPE tissue by indication, cell pellet blocks, and mouse
                  tissue, plus blocks made from your own cells or animals.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Browse tissue blocks
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section id="gallery" className="mt-20 scroll-mt-28">
        <SectionHeading eyebrow="From our lab" title="Our work">
          Brightfield IHC, multiplex immunofluorescence, special stains, and
          whole-slide scans from the PathXDx lab.
        </SectionHeading>
        <div className="mt-7">
          <LabGallery />
        </div>
      </section>

      <section id="workflow" className="mt-20 scroll-mt-28">
        <SectionHeading eyebrow="Workflow" title="From receipt to results">
          How specimens move through the lab, with every step recorded in our
          LIMS.
        </SectionHeading>
        <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {preclinicalSteps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-border/80 bg-card p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <p className="mt-3 font-semibold tracking-tight">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section id="sample-tracking" className="mt-20 scroll-mt-28">
        <SectionHeading
          eyebrow="Sample tracking"
          title="Every sample tracked in our LIMS"
        >
          When you send us a study, each sample and slide is logged in our own
          laboratory information management system, from receipt to delivery.
        </SectionHeading>
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
          <ul className="space-y-3">
            {TRACKING.map(({ title, body, icon: Icon }) => (
              <li
                key={title}
                className="flex gap-4 rounded-xl border border-border/80 bg-card p-5"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <SampleRecordPreview />
        </div>
      </section>

      <section id="expertise" className="mt-20 scroll-mt-28">
        <SectionHeading eyebrow="Expertise" title="Organ systems we support">
          Most tissue types are within scope. Working in an area not listed?
          Ask us.
        </SectionHeading>
        <ul className="mt-6 flex flex-wrap gap-2">
          {expertiseAreas.map((area) => (
            <li
              key={area}
              className="rounded-full border border-border/80 bg-card px-4 py-1.5 text-sm"
            >
              {area}
            </li>
          ))}
        </ul>
      </section>

      <section id="why-pathxdx" className="mt-20 scroll-mt-28">
        <SectionHeading
          eyebrow="Why PathXDx"
          title="High-touch partnership, owned imaging capability"
        />
        <ul className="mt-7 grid gap-4 sm:grid-cols-2">
          {PILLARS.map(({ title, body, icon: Icon }) => (
            <li
              key={title}
              className="flex gap-4 rounded-xl border border-border/80 bg-card p-5"
            >
              <Icon className="h-7 w-7 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 rounded-2xl border border-primary/25 bg-primary/10 px-6 py-8 sm:px-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Ready to scope your study?
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tell us the tissue type, targets, study stage, and timeline. A
          technologist will help design the study and prepare a proposal.
        </p>
        <Button asChild className="mt-5 font-semibold">
          <Link href="/contact">
            Discuss your study
            <ArrowRight className="ml-0.5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
