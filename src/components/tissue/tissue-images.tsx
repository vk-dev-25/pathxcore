import Image from "next/image";

import { cn } from "@/lib/utils";
import type { CellLineBlock } from "@/lib/tissue/public-catalog";
import { heImage, ihcImage } from "@/lib/tissue/image-credits";

/** PathXDx lab images (from the company deck) in public/images/lab. */
const lab = (file: string) => `/images/lab/${file}`;

/** Own human stains for the Human FFPE hero mosaic. */
export const FFPE_HERO_IMAGES = [
  "dual-ihc-colon-cancer-1.jpg",
  "special-stain-kidney-human.jpg",
  "ihc-breast-cancer-1.jpg",
  "dual-ihc-liver-human.jpg",
  "ihc-human-tissue.jpg",
  "dual-ihc-colon-cancer-2.jpg",
].map(lab);

/** Own IHC and immunofluorescence for the Cell pellet hero mosaic. */
export const CELL_HERO_IMAGES = [
  "cell-pellet-ihc-1.jpg",
  "mif-breast-tumor.jpg",
  "cell-pellet-ihc-2.jpg",
  "ihc-breast-cancer-2.jpg",
  "if-tumor-1.jpg",
  "ihc-tumor-membrane.jpg",
].map(lab);

/** Normal / control tissue label → H&E thumbnail key. */
const NORMAL_HE: Record<string, string> = {
  Colon: "colon",
  Gallbladder: "gallbladder",
  Heart: "heart",
  Kidney: "kidney",
  Liver: "liver",
  "Lymph node": "lymph-node",
  Prostate: "prostate",
  Skin: "skin",
  Spleen: "spleen",
  Stomach: "stomach",
  Tonsil: "tonsil",
};

/** Organ system → representative H&E thumbnail key. */
const SYSTEM_HE: Record<string, string> = {
  endocrine: "thyroid",
  gastrointestinal: "colon",
  "head-neck": "tonsil",
  hepatobiliary: "liver",
  lymphoid: "lymph-node",
  mammary: "breast",
  nervous: "brain",
  reproductive: "endometrium",
  respiratory: "lung",
  skin: "skin",
  "soft-tissue": "adipose",
  urinary: "kidney",
};

/** Crops for source images whose edges would show at thumbnail size. */
const IMAGE_FIT: Record<string, string> = {
  "/images/he/heart.jpg": "scale-150",
  "/images/he/tonsil.jpg": "object-top",
};

/** Crop class for an image, for components that render their own <Image>. */
export function imageFitClass(src: string): string {
  return IMAGE_FIT[src] ?? "";
}

export function normalHeSrc(label: string): string | undefined {
  const key = NORMAL_HE[label];
  return key ? heImage(key) : undefined;
}

export function systemHeSrc(systemId: string): string | undefined {
  const key = SYSTEM_HE[systemId];
  return key ? heImage(key) : undefined;
}

/** IHC marker name (as in the catalog) → IHC thumbnail key. */
const MARKER_IHC: Record<string, string> = {
  ER: "er",
  HER2: "her2",
  PSA: "psa",
  CD3: "cd3",
  CD31: "cd31",
  "TTF-1": "ttf1",
  Cytokeratin: "cytokeratin",
};

/** PathXDx cell pellet IHC examples in public/images/cells. */
const pellet = (file: string) => ({
  src: `/images/cells/${file}.jpg`,
  label: "Cell pellet",
});
/** Illustrative cell block micrographs (Wikimedia Commons placeholders). */
const block = (file: string) => ({
  src: `/images/cells/${file}.jpg`,
  label: "Cell block example",
});

/**
 * One distinct thumbnail per cell line, so no two cards repeat an image: our
 * own cell pellet stains where we have them (the six generic ones spread over
 * randomly chosen lines), illustrative tissue IHC elsewhere. Lines not listed
 * here fall back to a positive-marker match below.
 */
const CELL_LINE_IHC: Record<string, { src: string; label: string }> = {
  Jurkat: block("block-7"),
  H1975: pellet("pellet-h1975"),
  A549: pellet("pellet-a549"),
  "OVCAR-3": pellet("pellet-ovcar3"),
  "PC-3": block("block-9"),
  DU145: pellet("pellet-6"),
  HCT116: block("block-5"),
  A498: pellet("pellet-2"),
  HUVEC: block("block-10"),
  "MCF-7": pellet("pellet-5"),
  SKBR3: pellet("pellet-3"),
  "22RV1": block("block-6"),
  LNCAP: block("block-1"),
  C42B: block("block-4"),
  colo205: pellet("pellet-1"),
  "MDA-MB-453": block("block-3"),
  A431: pellet("pellet-4"),
  T47D: block("block-2"),
  "293T": block("block-8"),
};

/**
 * IHC thumbnail for a cell line: its assigned image, else a marker the line is
 * positive for, preferring a specific marker over cytokeratin. Lines with no
 * matching image get a Ki-67 example, labelled as such.
 */
export function cellLineIhc(line: CellLineBlock): {
  src: string;
  label: string;
} {
  const assigned = CELL_LINE_IHC[line.cellType];
  if (assigned) return assigned;
  const positives = line.markers.filter(
    (m) => m.status === "pos" && MARKER_IHC[m.name],
  );
  const pick =
    positives.find((m) => m.name !== "Cytokeratin") ?? positives[0] ?? null;
  if (pick) {
    return { src: ihcImage(MARKER_IHC[pick.name]), label: pick.name };
  }
  return { src: ihcImage("ki67"), label: "Ki-67 example" };
}

/** Small rounded micrograph thumbnail. */
export function TissueThumb({
  src,
  alt,
  size = 44,
  label,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  /** Optional marker badge in the corner, e.g. "ER". */
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-black/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size * 2}px`}
        className={cn("object-cover", IMAGE_FIT[src])}
      />
      {label ? (
        <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1 py-px text-center text-[9px] font-semibold uppercase tracking-wide text-white">
          {label}
        </span>
      ) : null}
    </span>
  );
}

/** Small decorative grid of micrographs for a page hero. */
export function MicrographMosaic({ srcs }: { srcs: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5" aria-hidden>
      {srcs.map((src, i) => (
        <span
          key={src}
          className={cn(
            "relative block h-24 w-24 overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/20 xl:h-28 xl:w-28",
            i % 2 === 1 && "translate-y-4",
          )}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="224px"
            className={cn("object-cover", IMAGE_FIT[src])}
          />
        </span>
      ))}
    </div>
  );
}
