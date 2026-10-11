import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type GalleryImage = {
  src: string;
  /** Technique, never a marker name. */
  technique: string;
  subject: string;
};

/** PathXDx lab images. Captions describe technique and tissue only. */
export const labGallery: GalleryImage[] = [
  {
    src: "/images/lab/mif-tumor-1.jpg",
    technique: "Multiplex immunofluorescence",
    subject: "Tumor",
  },
  {
    src: "/images/lab/dual-ihc-colon-cancer-1.jpg",
    technique: "Dual IHC",
    subject: "Human colon cancer",
  },
  {
    src: "/images/lab/special-stain-kidney-human.jpg",
    technique: "Special stain",
    subject: "Human kidney",
  },
  {
    src: "/images/lab/mif-lymphoid.jpg",
    technique: "Multiplex immunofluorescence",
    subject: "Lymphoid tissue",
  },
  {
    src: "/images/lab/ihc-tumor-membrane.jpg",
    technique: "Brightfield IHC",
    subject: "Tumor",
  },
  {
    src: "/images/lab/cell-pellet-ihc-1.jpg",
    technique: "IHC",
    subject: "Cell pellet block",
  },
  {
    src: "/images/lab/mif-tumor-2.jpg",
    technique: "Multiplex immunofluorescence",
    subject: "Tumor microenvironment",
  },
  {
    src: "/images/lab/wsi-he-sections.jpg",
    technique: "Whole-slide H&E scan",
    subject: "Tissue sections",
  },
  {
    src: "/images/lab/cell-pellet-ihc-2.jpg",
    technique: "IHC",
    subject: "Cell pellet block, high magnification",
  },
];

function Caption({ image }: { image: GalleryImage }) {
  return (
    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pb-2.5 pt-8 text-white">
      <p className="text-sm font-semibold leading-tight">{image.technique}</p>
      <p className="text-xs text-white/80">{image.subject}</p>
    </figcaption>
  );
}

/**
 * Mosaic gallery for the Services page: the first image is featured at
 * double size on large screens.
 */
export function LabGallery({
  images = labGallery,
}: {
  images?: GalleryImage[];
}) {
  return (
    <ul className="grid auto-rows-[200px] grid-cols-2 gap-3 lg:auto-rows-[180px] lg:grid-cols-4">
      {images.map((image, i) => (
        <li key={image.src} className={cn(i === 0 && "col-span-2 row-span-2")}>
          <figure className="group relative h-full overflow-hidden rounded-xl bg-muted ring-1 ring-black/10">
            <Image
              src={image.src}
              alt={`${image.technique}: ${image.subject.toLowerCase()}`}
              fill
              sizes={
                i === 0
                  ? "(min-width: 1024px) 560px, 100vw"
                  : "(min-width: 1024px) 280px, 50vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <Caption image={image} />
          </figure>
        </li>
      ))}
    </ul>
  );
}

/** Compact strip for the homepage, linking to the full gallery. */
export function LabGalleryStrip({ count = 5 }: { count?: number }) {
  const images = labGallery.slice(0, count);
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {images.map((image, i) => (
          <li
            key={image.src}
            className={cn(
              i >= 4 && "hidden lg:block",
              i === 3 && "hidden sm:block",
            )}
          >
            <Link
              href="/preclinical-services#gallery"
              className="group relative block aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-black/10"
            >
              <Image
                src={image.src}
                alt={`${image.technique}: ${image.subject.toLowerCase()}`}
                fill
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-xs font-semibold text-white">
                {image.technique}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/preclinical-services#gallery"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        See more from our lab
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
