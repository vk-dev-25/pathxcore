import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CellPelletCatalog } from "@/components/tissue/cell-pellet-catalog";
import {
  CELL_HERO_IMAGES,
  MicrographMosaic,
} from "@/components/tissue/tissue-images";
import { TissuePageHeader } from "@/components/tissue/tissue-page-header";
import { Button } from "@/components/ui/button";
import { TISSUE_ROUTES } from "@/lib/tissue/public-catalog";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "FFPE Cell Pellet Blocks | IHC Controls",
  description:
    "FFPE cell pellet blocks from characterized cell lines, for IHC run controls and antibody validation. Research use only.",
  path: TISSUE_ROUTES.cellPellets,
});

export default async function CellPelletsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tissue?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-14 sm:px-6">
      <TissuePageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Tissue Blocks", href: TISSUE_ROUTES.landing },
          { label: "Cell pellet blocks" },
        ]}
        eyebrow="FFPE cell pellets · IHC controls"
        title="Cell pellet blocks"
        aside={<MicrographMosaic srcs={CELL_HERO_IMAGES} />}
        actions={
          <>
            <Button asChild className="font-semibold">
              <Link href="/contact">
                Request a quote
                <ArrowRight className="ml-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold">
              <Link href="#your-cells">Send us your cells</Link>
            </Button>
          </>
        }
      >
        <p>
          FFPE cell pellets from characterized cell lines, for IHC run controls
          and antibody validation. We also make FFPE blocks and low-density cell
          TMAs from your own transfected, knockout, or knockdown cells.
        </p>
      </TissuePageHeader>

      <div className="mt-10">
        <CellPelletCatalog tissueParam={sp.tissue ?? null} />
      </div>
    </div>
  );
}
