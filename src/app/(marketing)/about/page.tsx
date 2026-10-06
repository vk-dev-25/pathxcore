import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  Microscope,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { TissuePageHeader } from "@/components/tissue/tissue-page-header";
import { Button } from "@/components/ui/button";
import { TISSUE_ROUTES } from "@/lib/tissue/public-catalog";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "About PathXDx | Research Pathology Lab, Brisbane, CA",
  description:
    "PathXDx is a research pathology laboratory in Brisbane, California, supporting biotech, pharma, CRO, and academic programs with lab services and FFPE tissue blocks.",
  path: "/about",
});

const POINTS: {
  title: string;
  body: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    title: "Our own lab",
    body: "Histology, IHC, multiplex immunofluorescence, and whole-slide scanning, all under one roof.",
    icon: Microscope,
    tone: "bg-primary/15 text-primary",
  },
  {
    title: "A technologist for every program",
    body: "A dedicated technologist helps design your study, explains each step, and stays with it to delivery.",
    icon: Users,
    tone: "bg-lab-purple/15 text-lab-purple",
  },
  {
    title: "Tissue to work with",
    body: "Human, cell pellet, and mouse FFPE blocks from our archive and partner biobanks.",
    icon: FlaskConical,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <TissuePageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        eyebrow="Brisbane, California"
        title="About PathXDx"
        actions={
          <>
            <Button asChild className="font-semibold">
              <Link href="/contact">
                Discuss your study
                <ArrowRight className="ml-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold">
              <Link href="/preclinical-services">Our services</Link>
            </Button>
          </>
        }
      >
        <p>
          PathXDx is a research pathology laboratory supporting biotech, pharma,
          CRO, and academic programs, from routine histology and IHC through
          multiplex immunofluorescence and whole-slide scanning, plus the FFPE
          tissue to run them on.
        </p>
      </TissuePageHeader>

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {POINTS.map(({ title, body, icon: Icon, tone }) => (
          <li
            key={title}
            className="rounded-2xl border border-border/80 bg-card p-6"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-semibold tracking-tight">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden
        />
        <p className="text-sm">
          <span className="font-semibold">Research use only.</span>{" "}
          <span className="text-muted-foreground">
            Human tissue is collected under IRB-approved protocols, with donor
            consent for research, and is de-identified. See our{" "}
            <Link
              href={TISSUE_ROUTES.landing}
              className="text-primary underline-offset-4 hover:underline"
            >
              tissue blocks
            </Link>
            .
          </span>
        </p>
      </div>
    </div>
  );
}
