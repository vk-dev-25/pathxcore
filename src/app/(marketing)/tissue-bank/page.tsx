import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  FlaskConical,
  GitMerge,
  Microscope,
  PawPrint,
} from "lucide-react";

import { TissuePageHeader } from "@/components/tissue/tissue-page-header";
import { Button } from "@/components/ui/button";
import { TISSUE_ROUTES } from "@/lib/tissue/public-catalog";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Tissue Blocks | Human FFPE Tissue & Cell Pellet Blocks",
  description:
    "Research-use human FFPE tissue blocks by organ system, normal and control tissue, and FFPE cell pellet blocks for IHC controls.",
  path: TISSUE_ROUTES.landing,
});

const products = [
  {
    title: "Human FFPE tissue",
    body: "Cancer and disease FFPE tissue by indication, with matched normal adjacent tissue and custom sourcing.",
    href: TISSUE_ROUTES.humanFfpe,
    cta: "Browse human FFPE tissue",
    icon: Microscope,
    tone: "from-lab-purple/25 text-lab-purple",
  },
  {
    title: "Normal / control tissue",
    body: "Normal FFPE tissue from common control organs, for assay development and run controls.",
    href: `${TISSUE_ROUTES.humanFfpe}#normal`,
    cta: "See normal tissue",
    icon: GitMerge,
    tone: "from-primary/25 text-primary",
  },
  {
    title: "Cell pellet blocks",
    body: "FFPE cell pellets from characterized cell lines, plus blocks and cell TMAs made from your own cells.",
    href: TISSUE_ROUTES.cellPellets,
    cta: "Browse cell pellets",
    icon: FlaskConical,
    tone: "from-amber-500/25 text-amber-700 dark:text-amber-400",
  },
  {
    title: "Mouse tissue",
    body: "FFPE blocks and custom slides from NSG-MHC I/II DKO, C57BL/6, and BALB/c, plus collection from your animals.",
    href: TISSUE_ROUTES.mouse,
    cta: "Browse mouse tissue",
    icon: PawPrint,
    tone: "from-sky-500/25 text-sky-700 dark:text-sky-400",
  },
];

/** Tissue FAQ: only facts PathXDx has confirmed. */
const faqs: { q: string; a: string }[] = [
  {
    q: "Can I order directly on the website?",
    a: "Not quite. Add what you need to an enquiry and send it. We reply with a specimen-level list and a quote, and work through the details with you before anything is shipped.",
  },
  {
    q: "What information comes with each block?",
    a: "Diagnosis, age, sex, and block size. Treatment history and other clinical metadata are provided when available.",
  },
  {
    q: "Can I see the tissue before I choose?",
    a: "Yes. On request, we scan candidate blocks and share whole-slide H&E images with the pathologist's annotations.",
  },
  {
    q: "Is the human tissue ethically sourced?",
    a: "Yes. Human tissue is collected under IRB-approved protocols, with donor consent for research, and is de-identified.",
  },
  {
    q: "Can I get slides instead of blocks?",
    a: "Yes. Tissue is available as FFPE blocks, unstained slides, or H&E slides. Matched normal adjacent tissue is available for cancer indications.",
  },
  {
    q: "What if the tissue I need isn't listed?",
    a: "Send a custom enquiry. We source tissue beyond our catalog through partner biobanks, including specific subtypes, stages, and cases with treatment history.",
  },
  {
    q: "Can you make blocks from my own cells or animals?",
    a: "Yes. We make FFPE blocks and low-density cell TMAs from your transfected, knockout, or knockdown cells, and collect and block tissue from animals you provide.",
  },
];

const steps = [
  {
    title: "Build an enquiry",
    body: "Add the human tissue, cell pellets, or mouse tissue you need from any catalog.",
  },
  {
    title: "Get a specimen list",
    body: "We reply with matching blocks, including diagnosis, age, sex, and block size.",
  },
  {
    title: "Confirm and quote",
    body: "Pick the specimens you want and we send a quote.",
  },
];

export default function TissueBlocksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <TissuePageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Tissue Blocks" }]}
        eyebrow="Research use only"
        title="Tissue blocks"
        actions={
          <Button asChild className="font-semibold">
            <Link href="/contact">
              Request a quote
              <ArrowRight className="ml-0.5" />
            </Link>
          </Button>
        }
      >
        <p>
          Research-use human FFPE tissue and cell pellet blocks for IHC,
          multiplex immunofluorescence, and assay development.
        </p>
      </TissuePageHeader>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map(({ icon: Icon, ...product }) => (
          <li key={product.title}>
            <Link
              href={product.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl ${product.tone}`}
                aria-hidden
              />
              <span
                className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br to-transparent ${product.tone}`}
                aria-hidden
              >
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="relative mt-5 text-lg font-semibold tracking-tight">
                {product.title}
              </h2>
              <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {product.body}
              </p>
              <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {product.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          How ordering works
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-primary/70 pt-4">
              <p className="text-sm font-semibold tabular-nums text-primary">
                {i + 1}
              </p>
              <p className="mt-1 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted-foreground">
          All blocks are for research use only. Human tissue is collected under IRB-approved protocols, with donor consent for research, and is de-identified.
        </p>
      </section>

      <section id="faq" className="mt-16 scroll-mt-28">
        <h2 className="text-2xl font-semibold tracking-tight">
          Common questions
        </h2>
        <div className="mt-6 divide-y divide-border/70 rounded-2xl border border-border/80 bg-card">
          {faqs.map((faq) => (
            <details key={faq.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
