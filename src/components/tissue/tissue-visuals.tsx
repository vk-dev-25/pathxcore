/**
 * Accent colours per organ system / tissue of origin. Mid-tone (500) colours and
 * translucent tints read on both the dark default theme and `html.light`.
 * Class strings are written out in full so Tailwind generates them.
 */
export type TissueVisual = {
  /** Tinted chip: background tint + coloured text. */
  chip: string;
  /** Solid accent for bars and dots. */
  bar: string;
  /** Soft gradient wash for card headers. */
  wash: string;
  /** Hover border colour for cards. */
  hover: string;
};

const v = (
  chip: string,
  bar: string,
  wash: string,
  hover: string,
): TissueVisual => ({ chip, bar, wash, hover });

const SYSTEM_VISUALS: Record<string, TissueVisual> = {
  cardiovascular: v(
    "bg-red-500/15 text-red-500",
    "bg-red-500",
    "from-red-500/15",
    "hover:border-red-500/50",
  ),
  endocrine: v(
    "bg-amber-500/15 text-amber-500",
    "bg-amber-500",
    "from-amber-500/15",
    "hover:border-amber-500/50",
  ),
  gastrointestinal: v(
    "bg-orange-500/15 text-orange-500",
    "bg-orange-500",
    "from-orange-500/15",
    "hover:border-orange-500/50",
  ),
  "head-neck": v(
    "bg-sky-500/15 text-sky-500",
    "bg-sky-500",
    "from-sky-500/15",
    "hover:border-sky-500/50",
  ),
  hepatobiliary: v(
    "bg-emerald-500/15 text-emerald-500",
    "bg-emerald-500",
    "from-emerald-500/15",
    "hover:border-emerald-500/50",
  ),
  lymphoid: v(
    "bg-violet-500/15 text-violet-500",
    "bg-violet-500",
    "from-violet-500/15",
    "hover:border-violet-500/50",
  ),
  mammary: v(
    "bg-pink-500/15 text-pink-500",
    "bg-pink-500",
    "from-pink-500/15",
    "hover:border-pink-500/50",
  ),
  musculoskeletal: v(
    "bg-stone-500/15 text-stone-400",
    "bg-stone-400",
    "from-stone-500/15",
    "hover:border-stone-400/50",
  ),
  nervous: v(
    "bg-indigo-500/15 text-indigo-500",
    "bg-indigo-500",
    "from-indigo-500/15",
    "hover:border-indigo-500/50",
  ),
  reproductive: v(
    "bg-fuchsia-500/15 text-fuchsia-500",
    "bg-fuchsia-500",
    "from-fuchsia-500/15",
    "hover:border-fuchsia-500/50",
  ),
  respiratory: v(
    "bg-cyan-500/15 text-cyan-500",
    "bg-cyan-500",
    "from-cyan-500/15",
    "hover:border-cyan-500/50",
  ),
  skin: v(
    "bg-yellow-500/15 text-yellow-500",
    "bg-yellow-500",
    "from-yellow-500/15",
    "hover:border-yellow-500/50",
  ),
  "soft-tissue": v(
    "bg-lime-500/15 text-lime-500",
    "bg-lime-500",
    "from-lime-500/15",
    "hover:border-lime-500/50",
  ),
  urinary: v(
    "bg-blue-500/15 text-blue-500",
    "bg-blue-500",
    "from-blue-500/15",
    "hover:border-blue-500/50",
  ),
};

const FALLBACK = v(
  "bg-primary/15 text-primary",
  "bg-primary",
  "from-primary/15",
  "hover:border-primary/50",
);

export function systemVisual(systemId: string | undefined): TissueVisual {
  return (systemId && SYSTEM_VISUALS[systemId]) || FALLBACK;
}

/** Cell pellet tissue of origin → the closest organ-system accent. */
const CELL_TISSUE_SYSTEM: Record<string, string> = {
  Breast: "mammary",
  Colorectal: "gastrointestinal",
  "Embryonic kidney": "urinary",
  Endothelial: "cardiovascular",
  Hematolymphoid: "lymphoid",
  Kidney: "urinary",
  Lung: "respiratory",
  Ovary: "reproductive",
  Prostate: "reproductive",
  "Skin / squamous": "skin",
};

export function cellTissueVisual(tissue: string): TissueVisual {
  return systemVisual(CELL_TISSUE_SYSTEM[tissue]);
}
