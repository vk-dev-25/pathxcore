import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { LabGalleryStrip } from "@/components/lab-gallery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { homePageMetadata } from "@/lib/site-seo";
import { TISSUE_ROUTES } from "@/lib/tissue/public-catalog";

export const metadata: Metadata = homePageMetadata;

const heroClaims = [
  "Research pathology partner for biotech, pharma, and CROs",
  "Histology, IHC, and multiplex IF, with whole-slide scans delivered",
  "Human, cell pellet, and mouse FFPE blocks",
];

const news = [
  {
    title: "Mouse FFPE tissue blocks",
    body: "NSG-MHC I/II DKO, C57BL/6, and BALB/c tissue, plus collection from your own animals.",
    href: TISSUE_ROUTES.mouse,
    image: "/images/lab/special-stain-lung-mouse.jpg",
  },
  {
    title: "Blocks from your cells",
    body: "Send transfected, knockout, or knockdown cells. We return FFPE blocks or a low-density cell TMA.",
    href: `${TISSUE_ROUTES.cellPellets}#your-cells`,
    image: "/images/lab/ihc-tissue-array.jpg",
  },
  {
    title: "Human FFPE by indication",
    body: "Cancer and disease tissue by indication, sourced through partner biobanks.",
    href: `${TISSUE_ROUTES.humanFfpe}#indications`,
    image: "/images/lab/dual-ihc-liver-human.jpg",
  },
];

type Tile = {
  title: string;
  body: string;
  href: string;
  image: string;
  position?: string;
  /** Optional grid of micrographs shown instead of `image`, like WSI tiles. */
  mosaic?: string[];
};

const products: Tile[] = [
  {
    title: "Human FFPE tissue",
    body: "Normal, cancer, and disease tissue by indication",
    href: TISSUE_ROUTES.humanFfpe,
    image: "/images/lab/dual-ihc-colon-cancer-2.jpg",
  },
  {
    title: "Cell pellet blocks",
    body: "Characterized cell lines for IHC run controls",
    href: TISSUE_ROUTES.cellPellets,
    image: "/images/lab/ihc-breast-cancer-1.jpg",
  },
  {
    title: "Mouse tissue",
    body: "Immunodeficient and immunocompetent strains",
    href: TISSUE_ROUTES.mouse,
    image: "/images/lab/special-stain-lung-mouse.jpg",
  },
];

const services: Tile[] = [
  {
    title: "Histology & pathologist evaluation",
    body: "From accessioning to H&E, special stains, and research reads",
    href: "/preclinical-services#histology",
    image: "/images/lab/special-stain-kidney-human.jpg",
  },
  {
    title: "IHC & multiplex IF",
    body: "Panels developed and optimized for your targets and tissue",
    href: "/preclinical-services#multiplex",
    image: "/images/lab/mif-breast-tumor.jpg",
  },
  {
    title: "Whole-slide scanning",
    body: "Brightfield and fluorescence scans, delivered as WSI files",
    href: "/preclinical-services#slide-scanning",
    image: "/images/lab/dual-ihc-colon-cancer-1.jpg",
    mosaic: [
      "/images/lab/dual-ihc-colon-cancer-1.jpg",
      "/images/lab/special-stain-kidney-human.jpg",
      "/images/lab/ihc-breast-cancer-1.jpg",
      "/images/lab/mif-breast-tumor.jpg",
      "/images/lab/ihc-lymphoid-mouse.jpg",
      "/images/lab/special-stain-lung-mouse.jpg",
    ],
  },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold uppercase tracking-wide sm:text-3xl">
      {children}
    </h2>
  );
}

function ImageTile({ tile }: { tile: Tile }) {
  return (
    <Link
      href={tile.href}
      className="group relative flex aspect-[16/11] flex-col items-center justify-center overflow-hidden rounded-xl px-6 text-center text-white shadow-sm"
    >
      {tile.mosaic ? (
        <div
          className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5 bg-black transition-transform duration-500 group-hover:scale-105"
          aria-hidden
        >
          {tile.mosaic.map((src) => (
            <span key={src} className="relative block overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                sizes="130px"
                className="object-cover"
              />
            </span>
          ))}
        </div>
      ) : (
        <Image
          src={tile.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            tile.position,
          )}
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65 transition-colors group-hover:from-black/45"
        aria-hidden
      />
      <div className="relative">
        <h3 className="text-xl font-semibold leading-snug drop-shadow sm:text-2xl">
          {tile.title}
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-white/85">
          {tile.body}
        </p>
        <span className="mt-5 inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow transition-transform group-hover:translate-y-[-1px]">
          Learn more
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src="/images/hero-lab-team.png"
            alt="PathXdx technologists collaborating at laboratory instrumentation"
            fill
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover object-[center_30%]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent"
            aria-hidden
          />
          <div className="relative flex min-h-[420px] items-center p-5 sm:min-h-[460px] sm:p-10">
            <div className="max-w-xl rounded-xl bg-black/55 px-6 py-7 text-white backdrop-blur-sm sm:px-8">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Research pathology, from tissue to slide
              </h1>
              <ul className="mt-5 space-y-2">
                {heroClaims.map((claim) => (
                  <li key={claim} className="flex gap-2 text-sm sm:text-base">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    {claim}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="font-semibold">
                  <Link href="/contact">
                    Discuss your study
                    <ArrowRight className="ml-0.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/40 bg-white/10 font-semibold text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href={TISSUE_ROUTES.landing}>Tissue blocks</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 border-y border-border/70 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionTitle>What&apos;s new</SectionTitle>
          <ul className="mt-7 grid gap-4 md:grid-cols-3">
            {news.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className="group flex h-full gap-4 rounded-xl border border-border/80 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle>Featured products</SectionTitle>
        <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((tile) => (
            <li key={tile.title}>
              <ImageTile tile={tile} />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border/70 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionTitle>Featured services</SectionTitle>
          <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((tile) => (
              <li key={tile.title}>
                <ImageTile tile={tile} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle>From our lab</SectionTitle>
        <div className="mt-7">
          <LabGalleryStrip />
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              Discuss your study with PathXDx
            </h2>
            <p className="mt-1 text-sm text-primary-foreground/85">
              Tell us the tissue, targets, and timeline. We&apos;ll tell you
              what&apos;s feasible and what it costs.
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="shrink-0 font-semibold"
          >
            <Link href="/contact">
              Contact us
              <ArrowRight className="ml-0.5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
