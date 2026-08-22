import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { expertiseAreas } from "@/lib/site-content";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Areas of Expertise | Organ Systems & Technical Capabilities | PathXDx",
  description:
    "Histology, IHC, multiplex immunofluorescence, and quantitative image analysis across organ systems for preclinical and translational research programs.",
  path: "/areas-of-expertise",
});

export default function AreasOfExpertisePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Expertise
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Areas of expertise
        </h1>
        <p className="mt-4 text-muted-foreground">
          We support histology, IHC, multiplex immunofluorescence, and
          quantitative image analysis across organ systems commonly studied in
          preclinical, discovery, and translational research.
        </p>
        <p className="mt-3 text-muted-foreground">
          Share your study design and we&apos;ll tailor panels, stains, imaging,
          and analysis to your protocol.
        </p>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Organ systems</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {expertiseAreas.join(" · ")}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Working in an area not listed? Most tissue types are within scope.
          Ask us.
        </p>
      </section>

      <section className="mt-14 max-w-3xl space-y-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Technical capabilities
        </h2>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">Staining</p>
            <p className="mt-1">
              H&E · special stains with custom development · single-plex
              chromogenic IHC · multiplex immunofluorescence (3–4 plex) ·
              antibody optimization and protocol development
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Imaging</p>
            <p className="mt-1">
              Brightfield and fluorescence whole-slide scanning · digital slide
              management · image archiving
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Analysis</p>
            <p className="mt-1">
              Cell detection and classification · marker positivity and intensity
              quantification · co-expression analysis · spatial and density
              metrics · region-of-interest and annotation-based analysis
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Specimen handling</p>
            <p className="mt-1">
              FFPE and frozen workflows · serial and step sectioning · tissue
              microarray construction · research-consented tissue bank
            </p>
          </div>
        </div>
      </section>

      <div className="mt-12">
        <Button asChild>
          <Link href="/contact">Discuss your study</Link>
        </Button>
      </div>
    </div>
  );
}
