import archive from "@/lib/tissue/ffpe-archive.json";

export type CatalogRange = string;

export type ArchiveRow = {
  tissue: string;
  "Normal/Control": CatalogRange;
  Benign: CatalogRange;
  "Pre-malignant": CatalogRange;
  Malignant: CatalogRange;
  total: CatalogRange;
  inflammatory: CatalogRange;
  age: string;
  sex: string;
};

export type OrganSystem = {
  id: string;
  name: string;
  description: string;
  tissues: string[];
};

export type CellLineBlock = {
  cellType: string;
  format: "FFPE";
  /** Tissue and disease the line was established from. */
  origin: string;
  /** How the line is used as an IHC control. Research guidance, not a stain report. */
  ihc: string;
};

/** Case-range sort order used by the public FFPE archive. */
export const RANGE_ORDER: Record<string, number> = {
  "-": 0,
  "<5": 1,
  "5-25": 2,
  "25-100": 3,
  "100-250": 4,
  "250-500": 5,
  "500-1,000": 6,
  "1,000-2,500": 7,
  "2,500-5,000": 8,
  "5,000-10,000": 9,
  "10,000+": 10,
};

export const ffpeArchive = {
  generatedAt: archive.generatedAt,
  title: archive.title,
  subtitle: archive.subtitle,
  totalBlocksDisplay: archive.totalBlocksDisplay,
  tissueTypes: archive.tissueTypes,
  footnotes: archive.footnotes,
  nonTissueNote: archive.nonTissueNote,
  rows: archive.rows as ArchiveRow[],
  nonTissueRows: archive.nonTissueRows as ArchiveRow[],
};

/**
 * Organ-system groups, in the style of a biospecimen catalog:
 * browse by system, then see the organs inside it.
 */
export const organSystems: OrganSystem[] = [
  {
    id: "skin",
    name: "Skin",
    description: "Cutaneous FFPE blocks.",
    tissues: ["Skin"],
  },
  {
    id: "gastrointestinal",
    name: "Gastrointestinal",
    description: "Esophagus, stomach, intestine, colon, and related GI organs.",
    tissues: [
      "Colon",
      "Gastric",
      "Small Intestine",
      "Esophagus",
      "Gallbladder",
      "Rectum",
      "Cecum",
      "Appendix",
      "Anus",
      "Stomach",
      "Bile Duct",
      "Hemorrhoids",
      "Pancreas",
    ],
  },
  {
    id: "hepatic",
    name: "Hepatic",
    description: "Liver FFPE blocks.",
    tissues: ["Liver"],
  },
  {
    id: "mammary",
    name: "Mammary",
    description: "Breast FFPE blocks.",
    tissues: ["Breast"],
  },
  {
    id: "reproductive",
    name: "Reproductive",
    description: "Gynecologic, testicular, and related reproductive organs.",
    tissues: [
      "Endocervix",
      "Cervix/Endocervix",
      "Cervix",
      "Endometrium",
      "Uterus",
      "Vagina",
      "Ovary",
      "Fallopian Tube",
      "Ovary and Fallopian Tube",
      "Testis",
      "Placenta",
      "Uterine Contents",
      "Vulva",
      "Epididymis",
      "Vas Deferens",
      "Penis",
      "Seminal Vesicle",
      "Fetus",
    ],
  },
  {
    id: "urinary",
    name: "Urinary",
    description: "Kidney, bladder, prostate, and urinary tract.",
    tissues: ["Prostate", "Bladder", "Kidney", "Urethra", "Ureter"],
  },
  {
    id: "respiratory",
    name: "Respiratory",
    description: "Lung, airway, pleura, and upper respiratory tract.",
    tissues: [
      "Bronchus",
      "Lung",
      "Nasal Tissue",
      "Sinus",
      "Pleura",
      "Pharynx",
      "Larynx",
      "Nasopharynx",
      "Trachea",
      "Vocal Cord",
    ],
  },
  {
    id: "head-neck",
    name: "Head and Neck",
    description: "Oral cavity, tonsil, salivary gland, eye, and ear.",
    tissues: [
      "Tonsil",
      "Oral",
      "Tongue",
      "Uvula",
      "Adenoids",
      "Conjunctiva",
      "Ear",
      "Salivary Gland",
      "Eye",
    ],
  },
  {
    id: "endocrine",
    name: "Endocrine",
    description: "Thyroid, parathyroid, and adrenal gland.",
    tissues: ["Thyroid", "Parathyroid", "Adrenal Gland"],
  },
  {
    id: "lymphoid",
    name: "Lymphoid",
    description: "Lymph node and spleen.",
    tissues: ["Lymph Node", "Spleen"],
  },
  {
    id: "cns",
    name: "Central Nervous System",
    description: "Brain and nerve.",
    tissues: ["Brain", "Nerve"],
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal",
    description: "Bone, muscle, joint, tendon, and spine.",
    tissues: [
      "Bone",
      "Muscle",
      "Intervertebral Disk",
      "Joint",
      "Tendon",
      "Finger",
      "Extremity",
      "Bursa",
      "Vertebral Column",
    ],
  },
  {
    id: "soft-tissue",
    name: "Soft Tissue",
    description: "Soft tissue, peritoneum, omentum, and related sites.",
    tissues: [
      "Soft Tissue",
      "Hernia",
      "Cyst",
      "Omentum",
      "Peritoneum",
      "Retroperitoneum",
    ],
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular",
    description: "Heart, artery, and vein.",
    tissues: ["Artery", "Vein", "Heart"],
  },
];

const systemByTissue = new Map<string, OrganSystem>();
for (const system of organSystems) {
  for (const tissue of system.tissues) {
    systemByTissue.set(tissue, system);
  }
}

export function systemForTissue(tissue: string): OrganSystem | undefined {
  return systemByTissue.get(tissue);
}

/**
 * FFPE cell-line blocks held in addition to the human tissue archive.
 * Origins and IHC notes follow the published identity of each line.
 * They describe how the line is used as a control, not the result of a
 * particular block.
 */
export const cellLineBlocks: CellLineBlock[] = [
  {
    cellType: "Jurkat",
    format: "FFPE",
    origin:
      "Human T-lymphoblast line from the peripheral blood of a child with acute T-cell leukemia.",
    ihc: "Positive control for T-cell markers, including CD3 and CD45, on hematolymphoid IHC panels.",
  },
  {
    cellType: "H1975",
    format: "FFPE",
    origin:
      "Human lung adenocarcinoma (NCI-H1975). The line carries EGFR L858R and T790M.",
    ihc: "Lung carcinoma control for cytokeratin and EGFR IHC, including panels that need an EGFR-mutant adenocarcinoma reference.",
  },
  {
    cellType: "A549",
    format: "FFPE",
    origin:
      "Human lung carcinoma with alveolar epithelial features, established from a 58-year-old man.",
    ihc: "Epithelial cytokeratin control. Often paired with TTF-1–positive lung lines as a TTF-1–low reference.",
  },
  {
    cellType: "OVCAR-3",
    format: "FFPE",
    origin:
      "Human ovarian adenocarcinoma, established from the ascites of a patient with progressive disease.",
    ihc: "Ovarian carcinoma control for cytokeratin, PAX8, and CA125 (MUC16).",
  },
  {
    cellType: "T86",
    format: "FFPE",
    origin:
      "Stocked under the catalog name T86. That name is not a standard ATCC designation, so we confirm tissue of origin when you request the block.",
    ihc: "Available as an FFPE control block. Confirm which markers it suits before using it as a positive or negative control.",
  },
  {
    cellType: "PC-3",
    format: "FFPE",
    origin:
      "Human prostate adenocarcinoma from a bone metastasis. Androgen-independent.",
    ihc: "Prostate carcinoma control. Typically PSA-negative and androgen-receptor low, so it is the negative reference beside LNCaP on prostate marker panels.",
  },
  {
    cellType: "DU145",
    format: "FFPE",
    origin:
      "Human prostate carcinoma from a brain metastasis. Androgen-independent.",
    ihc: "Prostate epithelial control used as an androgen-receptor–negative and PSA-negative reference.",
  },
  {
    cellType: "HCT116",
    format: "FFPE",
    origin:
      "Human colorectal carcinoma. Microsatellite-unstable and MLH1-deficient.",
    ihc: "Colorectal control for cytokeratin and CDX2. Standard negative control for MLH1 on mismatch-repair IHC.",
  },
  {
    cellType: "A498",
    format: "FFPE",
    origin:
      "Human renal cell carcinoma (A-498, ATCC HTB-44). Listed here under the A498 name.",
    ihc: "Kidney carcinoma control for cytokeratin and PAX8.",
  },
  {
    cellType: "HUVEC",
    format: "FFPE",
    origin:
      "Primary human umbilical vein endothelial cells. This is an endothelial preparation, not a tumor line.",
    ihc: "Positive control for endothelial markers CD31, ERG, and von Willebrand factor.",
  },
  {
    cellType: "MCF-7",
    format: "FFPE",
    origin:
      "Human breast adenocarcinoma from a pleural effusion. Estrogen-receptor positive, progesterone-receptor positive, HER2-negative.",
    ihc: "Positive control for estrogen receptor and progesterone receptor. HER2-negative reference beside SKBR3.",
  },
  {
    cellType: "A-498",
    format: "FFPE",
    origin:
      "Human renal cell carcinoma (ATCC HTB-44), the same line as A498, listed under the A-498 name.",
    ihc: "Kidney carcinoma control for cytokeratin and PAX8.",
  },
  {
    cellType: "SKBR3",
    format: "FFPE",
    origin:
      "Human breast adenocarcinoma from a pleural effusion. HER2-amplified and estrogen-receptor negative.",
    ihc: "HER2 strong-positive control for breast IHC. Estrogen-receptor negative reference beside MCF-7 and T47D.",
  },
  {
    cellType: "HUVEC-2",
    format: "FFPE",
    origin:
      "A second human umbilical vein endothelial preparation, same cell type as HUVEC.",
    ihc: "Second endothelial control for CD31, ERG, and von Willebrand factor when a run needs more than one HUVEC block.",
  },
  {
    cellType: "22RV1",
    format: "FFPE",
    origin:
      "Human prostate carcinoma (22Rv1), derived from the CWR22 relapsed xenograft. Androgen-responsive and androgen-receptor positive.",
    ihc: "Androgen-receptor positive prostate control, including IHC aimed at AR and AR splice variants.",
  },
  {
    cellType: "LNCAP",
    format: "FFPE",
    origin:
      "Human prostate carcinoma (LNCaP) from a lymph-node metastasis. Androgen-sensitive.",
    ihc: "Positive control for PSA, PSMA, and androgen receptor on prostate IHC panels.",
  },
  {
    cellType: "C42B",
    format: "FFPE",
    origin:
      "Bone-metastatic, castration-resistant subline of LNCaP (C4-2B).",
    ihc: "Prostate control paired with LNCaP when the IHC question is androgen-receptor signaling after castration resistance.",
  },
  {
    cellType: "colo205",
    format: "FFPE",
    origin:
      "Human colorectal adenocarcinoma (COLO 205), established from ascites.",
    ihc: "Colorectal epithelial control for cytokeratin, CDX2, and CEA.",
  },
  {
    cellType: "MDA-MB-453",
    format: "FFPE",
    origin:
      "Human breast carcinoma from a pericardial effusion. Estrogen- and progesterone-receptor negative, androgen-receptor positive.",
    ihc: "Breast carcinoma control for androgen receptor and HER2 IHC, distinct from the ER-positive MCF-7 and T47D lines.",
  },
  {
    cellType: "A431",
    format: "FFPE",
    origin:
      "Human epidermoid carcinoma of the vulva. The line expresses EGFR at a very high level.",
    ihc: "Strong positive control for EGFR and cytokeratin, and a squamous epithelial reference.",
  },
  {
    cellType: "T47D",
    format: "FFPE",
    origin:
      "Human breast ductal carcinoma from a pleural effusion. Estrogen-receptor positive and progesterone-receptor positive.",
    ihc: "Positive control for estrogen receptor and progesterone receptor, used with MCF-7 on breast hormone-receptor IHC.",
  },
];

export function rangeRank(value: string | null | undefined): number {
  if (value == null || value === "—" || value === "-") return -1;
  return RANGE_ORDER[value] ?? -1;
}
