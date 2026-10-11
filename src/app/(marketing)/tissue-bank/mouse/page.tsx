import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MouseCatalog } from "@/components/tissue/mouse-catalog";
import { TissuePageHeader } from "@/components/tissue/tissue-page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stockedMouseStrains } from "@/lib/tissue/mouse-catalog";
import { TISSUE_ROUTES } from "@/lib/tissue/public-catalog";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Mouse FFPE Tissue Blocks | NSG-MHC DKO, C57BL/6, BALB/c",
  description:
    "Mouse FFPE tissue blocks and custom slides from NSG-MHC I/II DKO, C57BL/6, and BALB/c, other strains on request, and custom collection from your animals.",
  path: TISSUE_ROUTES.mouse,
});

function StrainPanel() {
  return (
    <div className="w-72 rounded-2xl border border-white/20 bg-card/70 p-5 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Core strains
      </p>
      <ul className="mt-3 space-y-2.5">
        {stockedMouseStrains.map((strain) => (
          <li key={strain.id} className="flex items-center gap-3">
            <span
              className={cn("h-8 w-1.5 rounded-full", strain.accent.bar)}
              aria-hidden
            />
            <div>
              <p className="font-semibold leading-tight">{strain.name}</p>
              <p className="text-xs text-muted-foreground">{strain.type}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        Other strains on request
      </p>
    </div>
  );
}

export default function MouseTissuePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-14 sm:px-6">
      <TissuePageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Tissue Blocks", href: TISSUE_ROUTES.landing },
          { label: "Mouse tissue" },
        ]}
        eyebrow="Mouse FFPE · Research use"
        title="Mouse tissue"
        aside={<StrainPanel />}
        actions={
          <>
            <Button asChild className="font-semibold">
              <Link href="#strains">
                Browse strains
                <ArrowRight className="ml-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold">
              <Link href="#custom-collection">Custom collection</Link>
            </Button>
          </>
        }
      >
        <p>
          FFPE tissue blocks and custom slides from immunodeficient and
          immunocompetent mouse strains, for humanized-model, immuno-oncology,
          and oncology studies. We can also collect and block tissue from your
          own animals.
        </p>
      </TissuePageHeader>

      <div className="mt-14">
        <MouseCatalog />
      </div>
    </div>
  );
}
