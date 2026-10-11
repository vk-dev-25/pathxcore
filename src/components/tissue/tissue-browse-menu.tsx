"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TISSUE_ROUTES,
  cellLineBlocks,
  normalControlTissues,
  indicationGroups,
  organSystems,
} from "@/lib/tissue/public-catalog";
import { stockedMouseStrains } from "@/lib/tissue/mouse-catalog";

type Product = "ffpe" | "normal" | "cell" | "mouse";

type BrowseLink = { key: string; label: string; href: string };

const PRODUCTS: {
  id: Product;
  label: string;
  href: string;
  blurb: string;
  links: BrowseLink[];
}[] = [
  {
    id: "ffpe",
    label: "Human FFPE tissue",
    href: TISSUE_ROUTES.humanFfpe,
    blurb:
      "Cancer and disease FFPE tissue by indication, with custom sourcing through partner biobanks.",
    // Only organ systems that have indications listed on the page.
    links: organSystems
      .filter((system) =>
        indicationGroups.some((group) => group.systemId === system.id),
      )
      .map((system) => ({
        key: system.id,
        label: system.name,
        href: `${TISSUE_ROUTES.humanFfpe}#${system.id}`,
      })),
  },
  {
    id: "normal",
    label: "Normal / control tissue",
    href: `${TISSUE_ROUTES.humanFfpe}#normal`,
    blurb:
      "Normal human FFPE tissue for assay development, antibody validation, and run controls.",
    links: normalControlTissues.map((item) => ({
      key: item.label,
      label: item.label,
      href: `${TISSUE_ROUTES.humanFfpe}#normal`,
    })),
  },
  {
    id: "cell",
    label: "Cell pellet blocks",
    href: TISSUE_ROUTES.cellPellets,
    blurb:
      "FFPE cell pellets for IHC controls, plus blocks and low-density cell TMAs made from your own transfected, knockout, or knockdown cells.",
    links: [...new Set(cellLineBlocks.map((line) => line.tissue))]
      .sort((a, b) => a.localeCompare(b))
      .map((tissue) => ({
        key: tissue,
        label: tissue,
        href: `${TISSUE_ROUTES.cellPellets}?tissue=${encodeURIComponent(tissue)}`,
      })),
  },
  {
    id: "mouse",
    label: "Mouse tissue",
    href: TISSUE_ROUTES.mouse,
    blurb:
      "Mouse FFPE blocks and custom slides from NSG-MHC I/II DKO, C57BL/6, and BALB/c, other strains on request, and custom collection from your animals.",
    links: [
      ...stockedMouseStrains.map((strain) => ({
        key: strain.id,
        label: strain.name,
        href: `${TISSUE_ROUTES.mouse}#strains`,
      })),
      {
        key: "other",
        label: "Other strains on request",
        href: `${TISSUE_ROUTES.mouse}#other-strains`,
      },
      {
        key: "collection",
        label: "Custom collection",
        href: `${TISSUE_ROUTES.mouse}#custom-collection`,
      },
    ],
  },
];

/**
 * Vendor-style browse panel for the header mega menu: product types on the
 * left, organ-system buckets (or normal tissues, or cell pellet tissues of
 * origin) in the middle, and a call to action on the right.
 */
export function TissueBrowseMenu({
  onNavigate,
  className,
}: {
  /** Called when a link is followed, e.g. to close the header menu. */
  onNavigate?: () => void;
  className?: string;
}) {
  const [product, setProduct] = useState<Product>("ffpe");
  const active = PRODUCTS.find((p) => p.id === product) ?? PRODUCTS[0];

  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-xl border border-border/80 bg-card md:grid-cols-[230px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)_280px]",
        className,
      )}
    >
      <ul
        className="flex border-b border-border/80 md:block md:border-b-0 md:border-r"
        aria-label="Block type"
      >
        {PRODUCTS.map((p) => {
          const selected = p.id === product;
          return (
            <li key={p.id} className="flex-1 md:flex-none">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setProduct(p.id)}
                onMouseEnter={() => setProduct(p.id)}
                onFocus={() => setProduct(p.id)}
                className={cn(
                  "relative w-full px-4 py-3 text-left text-sm font-medium transition-colors md:border-b md:border-border/60",
                  selected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/50",
                )}
              >
                {p.label}
                {selected ? (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-primary md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-1"
                    aria-hidden
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="px-5 py-4">
        <Link
          href={active.href}
          onClick={onNavigate}
          className="inline-flex items-center gap-1 text-lg font-semibold tracking-tight hover:text-primary"
        >
          {active.label}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
        <ul className="mt-3 gap-x-8 border-t border-border/70 pt-3 sm:columns-2">
          {active.links.map((link) => (
            <li key={link.key} className="break-inside-avoid">
              <Link
                href={link.href}
                onClick={onNavigate}
                className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 hover:text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="hidden flex-col justify-between gap-6 bg-primary px-6 py-6 text-primary-foreground lg:flex">
        <p className="text-base font-medium leading-snug">{active.blurb}</p>
        <div className="space-y-2">
          <Button asChild variant="secondary" className="w-full font-semibold">
            <Link href="/contact" onClick={onNavigate}>
              Request a quote
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Link
            href={TISSUE_ROUTES.landing}
            onClick={onNavigate}
            className="block text-center text-sm underline-offset-4 hover:underline"
          >
            All tissue blocks
          </Link>
        </div>
      </div>
    </div>
  );
}
