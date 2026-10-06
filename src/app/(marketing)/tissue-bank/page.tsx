import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
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

      <p className="mt-10 text-sm text-muted-foreground">
        Questions about ordering, H&amp;E images, or sourcing?{" "}
        <Link
          href="/faq"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          See common questions
        </Link>
        .
      </p>
    </div>
  );
}
