import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  GitMerge,
  PenLine,
  ScanEye,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { RequestDialogButton } from "@/components/tissue/block-request";
import { HumanFfpeCatalog } from "@/components/tissue/human-ffpe-catalog";
import {
  FFPE_HERO_IMAGES,
  MicrographMosaic,
} from "@/components/tissue/tissue-images";
import { TissuePageHeader } from "@/components/tissue/tissue-page-header";
import { Button } from "@/components/ui/button";
import { TISSUE_ROUTES } from "@/lib/tissue/public-catalog";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Human FFPE Tissue Blocks | Cancer, Disease & Normal Tissue",
  description:
    "Research-use human FFPE tissue blocks by indication, pathologist reviewed, with annotated whole-slide H&E images available on request. Matched normal adjacent and custom sourcing.",
  path: TISSUE_ROUTES.humanFfpe,
});

const WHY: {
  title: string;
  body: string;
  icon: LucideIcon;
  tone: string;
  bar: string;
}[] = [
  {
    title: "Pathologist reviewed",
    body: "Blocks are reviewed by a pathologist. H&E images with regions of interest annotated are available on request.",
    icon: PenLine,
    tone: "bg-primary/15 text-primary",
    bar: "bg-primary",
  },
  {
    title: "See the H&E first",
    body: "Whole-slide H&E images of candidate blocks are available on request, before you decide.",
    icon: ScanEye,
    tone: "bg-lab-purple/15 text-lab-purple",
    bar: "bg-lab-purple",
  },
  {
    title: "Clinical context",
    body: "Diagnosis, age, sex, and block size with every block. Treatment history and other metadata when available.",
    icon: ClipboardList,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  {
    title: "Matched controls",
    body: "Normal control tissue and matched normal adjacent tissue for cancer indications.",
    icon: GitMerge,
    tone: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    bar: "bg-sky-500",
  },
];

const HE_STEPS = [
  "Tell us the indication and what you need",
  "We send whole-slide H&E images of candidate blocks, with pathologist annotations",
  "You choose the blocks for your study",
];

const HE_TEMPLATE = [
  "H&E image request (research use only)",
  "",
  "Indication / tissue:",
  "Diagnosis details (subtype, stage, grade):",
  "Number of candidate blocks to review:",
  "Matched normal adjacent needed (yes / no):",
  "Timeline:",
].join("\n");

/** Illustrative whole-slide viewer with a pathologist annotation outline. */
function WsiPreview() {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
          <span
            className="h-2.5 w-2.5 rounded-full bg-emerald-400"
            aria-hidden
          />
          <span className="ml-2 font-medium text-foreground">
            Whole-slide H&amp;E
          </span>
        </span>
        <span className="tabular-nums">20×</span>
      </div>
      <div className="relative aspect-[4/3]">
        <Image
          src="/images/lab/wsi-he-sections.jpg"
          alt="Example H&E image with a pathologist's annotated region outlined"
          fill
          sizes="(min-width: 1024px) 480px, 100vw"
          className="object-cover"
        />
        <svg
          viewBox="0 0 100 75"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path
            d="M22 20 C 34 10, 58 12, 70 22 S 82 48, 66 58 S 30 64, 22 50 S 12 28, 22 20 Z"
            fill="hsl(173 72% 42% / 0.12)"
            stroke="hsl(173 72% 42%)"
            strokeWidth="0.8"
            strokeDasharray="2.2 1.4"
          />
        </svg>
        <span className="absolute left-[58%] top-[10%] rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white shadow">
          Annotated region
        </span>
      </div>
      <figcaption className="border-t border-border/70 px-4 py-2 text-[11px] text-muted-foreground">
        Example view. H&amp;E images and annotations are available on request
        for the blocks you are considering.
      </figcaption>
    </figure>
  );
}

export default function HumanFfpePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-14 sm:px-6">
      <TissuePageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Tissue Blocks", href: TISSUE_ROUTES.landing },
          { label: "Human FFPE tissue" },
        ]}
        eyebrow="FFPE blocks · Research use"
        title="Human FFPE tissue"
        aside={<MicrographMosaic srcs={FFPE_HERO_IMAGES} />}
        actions={
          <>
            <Button asChild className="font-semibold">
              <Link href="#indications">
                Browse by indication
                <ArrowRight className="ml-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold">
              <Link href="#see-the-he">See the H&amp;E first</Link>
            </Button>
          </>
        }
      >
        <p>
          Research-use human FFPE tissue blocks, pathologist reviewed: normal control tissue, and cancer and disease tissue by
          indication. Tell us what you need and we&apos;ll work through the
          options with you.
        </p>
      </TissuePageHeader>

      <section aria-labelledby="why-heading" className="mt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Why our tissue
        </p>
        <h2
          id="why-heading"
          className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight"
        >
          The block decides the data. Know what you&apos;re getting before it
          reaches your assay.
        </h2>
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(({ title, body, icon: Icon, tone, bar }) => (
            <li
              key={title}
              className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 ${bar}`}
                aria-hidden
              />
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden
          />
          <p className="text-sm">
            <span className="font-semibold">Ethically sourced.</span>{" "}
            <span className="text-muted-foreground">
              All human tissue is collected under IRB-approved protocols, with
              donor consent for research, and is de-identified before it
              reaches you.
            </span>
          </p>
        </div>
      </section>

      <section
        id="see-the-he"
        aria-labelledby="see-the-he-heading"
        className="relative mt-16 scroll-mt-28 overflow-hidden rounded-2xl border border-lab-purple/30 bg-gradient-to-br from-lab-purple/15 via-card to-primary/15 px-6 py-10 sm:px-10"
      >
        <div
          className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lab-purple">
              Before you choose
            </p>
            <h2
              id="see-the-he-heading"
              className="mt-2 text-3xl font-semibold tracking-tight"
            >
              See the H&amp;E before you commit.
            </h2>
            <p className="mt-3 text-muted-foreground">
              On request, we scan candidate blocks and share whole-slide H&amp;E
              images with the pathologist&apos;s annotations, so you can confirm the tissue
              fits your study first.
            </p>
            <ol className="mt-6 space-y-3">
              {HE_STEPS.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lab-purple text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <RequestDialogButton
              label="Request H&E images"
              title="Request H&E images"
              intro="Tell us what you're looking for. We'll follow up by email with candidate blocks and their H&E images."
              template={HE_TEMPLATE}
              className="mt-7"
            />
          </div>
          <WsiPreview />
        </div>
      </section>

      <div className="mt-16">
        <HumanFfpeCatalog />
      </div>
    </div>
  );
}
