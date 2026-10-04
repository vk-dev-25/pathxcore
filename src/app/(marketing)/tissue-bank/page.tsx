import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TissueBlocksCatalog } from "@/components/tissue/tissue-blocks-public";
import { Button } from "@/components/ui/button";
import { cellLineBlocks, ffpeArchive } from "@/lib/tissue/public-catalog";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Tissue Blocks | FFPE Archive by Organ",
  description:
    "PathXDx FFPE tissue block archive by organ and diagnostic category, plus cell-line FFPE blocks. Research use only. Request specimen-level detail or a quote.",
  path: "/tissue-bank",
});

const highlights = [
  { label: "Cases", value: `${ffpeArchive.totalBlocksDisplay} FFPE` },
  { label: "Organs", value: String(ffpeArchive.tissueTypes) },
  { label: "Format", value: "FFPE blocks" },
  { label: "Cell lines", value: `${cellLineBlocks.length} FFPE` },
];

export default function TissueBankPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Tissue blocks
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          FFPE tissue archive
        </h1>
        <p className="mt-4 text-muted-foreground">
          Research-use FFPE blocks summarized by organ and diagnostic category:
          normal and control, benign, pre-malignant, and malignant. Ranges show
          what is on hand. Specimen-level lists are available on request.
        </p>
        <p className="mt-3 text-muted-foreground">
          Cell-line FFPE blocks sit alongside the archive as IHC controls, with
          the tissue each line came from and how it is used in immunohistochemistry.
        </p>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border/80 bg-card px-4 py-3"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="font-semibold">
          <Link href="/contact">
            Request a quote
            <ArrowRight className="ml-0.5" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="font-semibold">
          <Link href="#availability">Browse availability</Link>
        </Button>
      </div>

      <TissueBlocksCatalog />

      <section className="mt-14 rounded-xl border border-primary/25 bg-primary/10 px-5 py-6 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Need specimen-level detail or a quote?
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tell us the organ or cell line, the diagnostic category, and the
          intended research use. We will reply by email.
        </p>
        <Button asChild className="mt-4 font-semibold">
          <Link href="/contact">
            Contact PathXDx
            <ArrowRight className="ml-0.5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
