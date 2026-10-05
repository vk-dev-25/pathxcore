import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Microscope,
  FileText,
  CalendarDays,
  Users,
  Ruler,
  ClipboardList,
} from "lucide-react";

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
    "Research-use human FFPE tissue blocks by indication: cancer and disease tissue with matched normal adjacent, plus normal control tissue. Custom sourcing through partner biobanks.",
  path: TISSUE_ROUTES.humanFfpe,
});

const includes = [
  {
    label: "Pathology review",
    icon: Microscope,
    tone: "bg-primary/15 text-primary",
  },
  {
    label: "Diagnosis",
    icon: FileText,
    tone: "bg-lab-purple/15 text-lab-purple",
  },
  { label: "Age", icon: CalendarDays, tone: "bg-amber-500/15 text-amber-500" },
  { label: "Sex", icon: Users, tone: "bg-pink-500/15 text-pink-500" },
  { label: "Block size", icon: Ruler, tone: "bg-sky-500/15 text-sky-500" },
];

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
              <Link href="#normal">Normal tissue</Link>
            </Button>
          </>
        }
      >
        <p>
          Research-use, formalin-fixed paraffin-embedded human tissue blocks:
          normal control tissue, and cancer and disease tissue by indication.
          Add what you need to a request and we&apos;ll reply with a
          specimen-level list and a quote.
        </p>
      </TissuePageHeader>

      <section aria-labelledby="includes-heading" className="mt-10">
        <h2
          id="includes-heading"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
        >
          Included with every block
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {includes.map(({ label, icon: Icon, tone }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
                aria-hidden
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
          <li className="col-span-2 flex items-center gap-3 rounded-xl border border-dashed border-border/80 px-3.5 py-3 sm:col-span-3 lg:col-span-1">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              aria-hidden
            >
              <ClipboardList className="h-[18px] w-[18px]" />
            </span>
            <span className="text-xs leading-snug text-muted-foreground">
              Treatment history and other metadata, when available
            </span>
          </li>
        </ul>
      </section>

      <div className="mt-14">
        <HumanFfpeCatalog />
      </div>
    </div>
  );
}
