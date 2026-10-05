/**
 * Public mouse FFPE tissue offering: strains held in stock, strains sourced on
 * request, and the standard organ panel. No inventory counts are shown.
 */

export type MouseStrain = {
  id: string;
  name: string;
  /** Short descriptor shown as a badge. */
  type: string;
  summary: string;
  usedFor: string[];
  /** Sexes held, when confirmed. */
  sexes?: string[];
  /** Tailwind classes for the card accent (full strings for Tailwind). */
  accent: { bar: string; chip: string; wash: string };
};

export const stockedMouseStrains: MouseStrain[] = [
  {
    id: "nsg-mhc-dko",
    name: "NSG-MHC I/II DKO",
    type: "Immunodeficient · humanized models",
    summary:
      "NSG mice lacking mouse MHC class I and II. Used as hosts for PBMC-humanized studies, where the missing mouse MHC reduces graft-versus-host disease and extends the study window.",
    usedFor: [
      "Control tissue for humanized-mouse immuno-oncology studies",
      "Checking that anti-human antibodies don't stain mouse tissue",
      "Baseline histology of the host strain",
    ],
    sexes: ["Male", "Female"],
    accent: {
      bar: "bg-lab-purple",
      chip: "bg-lab-purple/15 text-lab-purple",
      wash: "from-lab-purple/20",
    },
  },
  {
    id: "c57bl6",
    name: "C57BL/6",
    type: "Immunocompetent · inbred",
    summary:
      "The most widely used inbred strain and the background for most knockout and transgenic lines. Host for syngeneic tumours such as MC38, B16, and LLC.",
    usedFor: [
      "Wild-type controls for knockout and transgenic studies",
      "Normal tissue for syngeneic oncology and immunology studies",
      "IHC and multiplex IF assay development on mouse tissue",
    ],
    accent: {
      bar: "bg-primary",
      chip: "bg-primary/15 text-primary",
      wash: "from-primary/20",
    },
  },
  {
    id: "balbc",
    name: "BALB/c",
    type: "Immunocompetent · inbred",
    summary:
      "Widely used inbred strain in immunology and antibody work. Host for syngeneic tumours such as CT26, 4T1, and EMT6.",
    usedFor: [
      "Normal tissue for syngeneic tumour studies",
      "Immunology and vaccine study controls",
      "IHC and multiplex IF assay development on mouse tissue",
    ],
    accent: {
      bar: "bg-amber-500",
      chip: "bg-amber-500/15 text-amber-500",
      wash: "from-amber-500/20",
    },
  },
];

/** Strains sourced on request through partners. */
export const onRequestMouseStrains: { group: string; strains: string[] }[] = [
  {
    group: "Immunodeficient and humanized",
    strains: ["NSG", "NSG-SGM3", "NOD-SCID", "NOG", "NRG", "Nude (athymic)"],
  },
  {
    group: "Inbred and outbred",
    strains: ["FVB/N", "C3H", "DBA/2", "129", "CD-1", "Swiss Webster"],
  },
  {
    group: "Disease models",
    strains: [
      "NOD (type 1 diabetes)",
      "MRL/lpr (lupus)",
      "SJL (EAE)",
      "DBA/1 (arthritis)",
    ],
  },
  {
    group: "Genetically modified",
    strains: ["Knockout lines", "Transgenic lines", "Humanized knock-in lines"],
  },
];

/** Standard mouse organ panel. Availability varies by strain and sex. */
export const mouseOrganPanel = [
  "Brain",
  "Heart",
  "Lung",
  "Liver",
  "Kidney",
  "Spleen",
  "Thymus",
  "Lymph node",
  "Stomach",
  "Duodenum",
  "Jejunum",
  "Ileum",
  "Cecum",
  "Colon",
  "Rectum",
  "Pancreas",
  "Skin",
  "Skeletal muscle",
  "Bone / bone marrow",
  "Reproductive organs",
];
