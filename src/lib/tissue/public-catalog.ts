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

export type MarkerStatus = "pos" | "neg" | "low";

export type CellLineMarker = {
  name: string;
  status: MarkerStatus;
};

export type CellLineBlock = {
  cellType: string;
  format: "FFPE";
  /** Tissue of origin, used as the cell pellet facet. */
  tissue: string;
  /** Published marker profile used for control selection. */
  markers: CellLineMarker[];
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
 * Organ-system buckets for browsing the FFPE archive, modeled on how
 * biospecimen vendors group tissue. Listed alphabetically, like a vendor menu;
 * every archive organ belongs to exactly one bucket.
 */
export const organSystems: OrganSystem[] = [
  {
    id: "cardiovascular",
    name: "Cardiovascular",
    description: "Heart, artery, and vein.",
    tissues: ["Heart", "Artery", "Vein"],
  },
  {
    id: "endocrine",
    name: "Endocrine",
    description: "Thyroid, parathyroid, and adrenal gland.",
    tissues: ["Thyroid", "Parathyroid", "Adrenal Gland"],
  },
  {
    id: "gastrointestinal",
    name: "Gastrointestinal",
    description: "Esophagus, stomach, small and large intestine, and anus.",
    tissues: [
      "Esophagus",
      "Gastric",
      "Stomach",
      "Small Intestine",
      "Appendix",
      "Cecum",
      "Colon",
      "Rectum",
      "Anus",
      "Hemorrhoids",
    ],
  },
  {
    id: "head-neck",
    name: "Head and Neck",
    description:
      "Oral cavity, salivary gland, sinonasal tract, pharynx, larynx, eye, and ear.",
    tissues: [
      "Oral",
      "Tongue",
      "Uvula",
      "Salivary Gland",
      "Nasal Tissue",
      "Sinus",
      "Nasopharynx",
      "Pharynx",
      "Larynx",
      "Vocal Cord",
      "Eye",
      "Conjunctiva",
      "Ear",
    ],
  },
  {
    id: "hepatobiliary",
    name: "Hepatobiliary",
    description: "Liver, gallbladder, bile duct, and pancreas.",
    tissues: ["Liver", "Gallbladder", "Bile Duct", "Pancreas"],
  },
  {
    id: "lymphoid",
    name: "Lymphoid",
    description: "Lymph node, spleen, tonsil, and adenoids.",
    tissues: ["Lymph Node", "Spleen", "Tonsil", "Adenoids"],
  },
  {
    id: "mammary",
    name: "Mammary",
    description: "Breast FFPE blocks.",
    tissues: ["Breast"],
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal",
    description: "Bone, muscle, joint, tendon, and spine.",
    tissues: [
      "Bone",
      "Muscle",
      "Joint",
      "Tendon",
      "Bursa",
      "Intervertebral Disk",
      "Vertebral Column",
      "Finger",
      "Extremity",
    ],
  },
  {
    id: "nervous",
    name: "Nervous System",
    description: "Brain and peripheral nerve.",
    tissues: ["Brain", "Nerve"],
  },
  {
    id: "reproductive",
    name: "Reproductive",
    description:
      "Cervix, uterus, ovary, and other gynecologic organs; testis and male genital tract; placenta.",
    tissues: [
      "Cervix",
      "Endocervix",
      "Cervix/Endocervix",
      "Endometrium",
      "Uterus",
      "Uterine Contents",
      "Ovary",
      "Fallopian Tube",
      "Ovary and Fallopian Tube",
      "Vagina",
      "Vulva",
      "Placenta",
      "Fetus",
      "Testis",
      "Epididymis",
      "Vas Deferens",
      "Seminal Vesicle",
      "Penis",
    ],
  },
  {
    id: "respiratory",
    name: "Respiratory",
    description: "Lung, bronchus, trachea, and pleura.",
    tissues: ["Lung", "Bronchus", "Trachea", "Pleura"],
  },
  {
    id: "skin",
    name: "Skin",
    description: "Cutaneous FFPE blocks.",
    tissues: ["Skin"],
  },
  {
    id: "soft-tissue",
    name: "Soft Tissue",
    description:
      "Soft tissue, peritoneum, omentum, retroperitoneum, and hernia sac.",
    tissues: [
      "Soft Tissue",
      "Peritoneum",
      "Omentum",
      "Retroperitoneum",
      "Hernia",
      "Cyst",
    ],
  },
  {
    id: "urinary",
    name: "Urinary",
    description: "Kidney, bladder, ureter, urethra, and prostate.",
    tissues: ["Kidney", "Bladder", "Ureter", "Urethra", "Prostate"],
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
    tissue: "Hematolymphoid",
    markers: [
      { name: "CD3", status: "pos" },
      { name: "CD45", status: "pos" },
    ],
    origin:
      "Human T-lymphoblast line from the peripheral blood of a child with acute T-cell leukemia.",
    ihc: "Positive control for T-cell markers, including CD3 and CD45, on hematolymphoid IHC panels.",
  },
  {
    cellType: "H1975",
    format: "FFPE",
    tissue: "Lung",
    markers: [
      { name: "Cytokeratin", status: "pos" },
      { name: "EGFR", status: "pos" },
    ],
    origin:
      "Human lung adenocarcinoma (NCI-H1975). The line carries EGFR L858R and T790M.",
    ihc: "Lung carcinoma control for cytokeratin and EGFR IHC, including panels that need an EGFR-mutant adenocarcinoma reference.",
  },
  {
    cellType: "A549",
    format: "FFPE",
    tissue: "Lung",
    markers: [
      { name: "Cytokeratin", status: "pos" },
      { name: "TTF-1", status: "low" },
    ],
    origin:
      "Human lung carcinoma with alveolar epithelial features, established from a 58-year-old man.",
    ihc: "Epithelial cytokeratin control. Often paired with TTF-1–positive lung lines as a TTF-1–low reference.",
  },
  {
    cellType: "OVCAR-3",
    format: "FFPE",
    tissue: "Ovary",
    markers: [
      { name: "Cytokeratin", status: "pos" },
      { name: "PAX8", status: "pos" },
      { name: "CA125", status: "pos" },
    ],
    origin:
      "Human ovarian adenocarcinoma, established from the ascites of a patient with progressive disease.",
    ihc: "Ovarian carcinoma control for cytokeratin, PAX8, and CA125 (MUC16).",
  },
  {
    cellType: "PC-3",
    format: "FFPE",
    tissue: "Prostate",
    markers: [
      { name: "PSA", status: "neg" },
      { name: "AR", status: "low" },
    ],
    origin:
      "Human prostate adenocarcinoma from a bone metastasis. Androgen-independent.",
    ihc: "Prostate carcinoma control. Typically PSA-negative and androgen-receptor low, so it is the negative reference beside LNCaP on prostate marker panels.",
  },
  {
    cellType: "DU145",
    format: "FFPE",
    tissue: "Prostate",
    markers: [
      { name: "AR", status: "neg" },
      { name: "PSA", status: "neg" },
    ],
    origin:
      "Human prostate carcinoma from a brain metastasis. Androgen-independent.",
    ihc: "Prostate epithelial control used as an androgen-receptor–negative and PSA-negative reference.",
  },
  {
    cellType: "HCT116",
    format: "FFPE",
    tissue: "Colorectal",
    markers: [
      { name: "Cytokeratin", status: "pos" },
      { name: "CDX2", status: "pos" },
      { name: "MLH1", status: "neg" },
    ],
    origin:
      "Human colorectal carcinoma. Microsatellite-unstable and MLH1-deficient.",
    ihc: "Colorectal control for cytokeratin and CDX2. Standard negative control for MLH1 on mismatch-repair IHC.",
  },
  {
    cellType: "A498",
    format: "FFPE",
    tissue: "Kidney",
    markers: [
      { name: "Cytokeratin", status: "pos" },
      { name: "PAX8", status: "pos" },
    ],
    origin: "Human renal cell carcinoma (A-498, ATCC HTB-44).",
    ihc: "Kidney carcinoma control for cytokeratin and PAX8.",
  },
  {
    cellType: "HUVEC",
    format: "FFPE",
    tissue: "Endothelial",
    markers: [
      { name: "CD31", status: "pos" },
      { name: "ERG", status: "pos" },
      { name: "vWF", status: "pos" },
    ],
    origin:
      "Primary human umbilical vein endothelial cells. This is an endothelial preparation, not a tumor line.",
    ihc: "Positive control for endothelial markers CD31, ERG, and von Willebrand factor.",
  },
  {
    cellType: "MCF-7",
    format: "FFPE",
    tissue: "Breast",
    markers: [
      { name: "ER", status: "pos" },
      { name: "PR", status: "pos" },
      { name: "HER2", status: "neg" },
    ],
    origin:
      "Human breast adenocarcinoma from a pleural effusion. Estrogen-receptor positive, progesterone-receptor positive, HER2-negative.",
    ihc: "Positive control for estrogen receptor and progesterone receptor. HER2-negative reference beside SKBR3.",
  },
  {
    cellType: "SKBR3",
    format: "FFPE",
    tissue: "Breast",
    markers: [
      { name: "HER2", status: "pos" },
      { name: "ER", status: "neg" },
    ],
    origin:
      "Human breast adenocarcinoma from a pleural effusion. HER2-amplified and estrogen-receptor negative.",
    ihc: "HER2 strong-positive control for breast IHC. Estrogen-receptor negative reference beside MCF-7 and T47D.",
  },
  {
    cellType: "22RV1",
    format: "FFPE",
    tissue: "Prostate",
    markers: [{ name: "AR", status: "pos" }],
    origin:
      "Human prostate carcinoma (22Rv1), derived from the CWR22 relapsed xenograft. Androgen-responsive and androgen-receptor positive.",
    ihc: "Androgen-receptor positive prostate control, including IHC aimed at AR and AR splice variants.",
  },
  {
    cellType: "LNCAP",
    format: "FFPE",
    tissue: "Prostate",
    markers: [
      { name: "PSA", status: "pos" },
      { name: "PSMA", status: "pos" },
      { name: "AR", status: "pos" },
    ],
    origin:
      "Human prostate carcinoma (LNCaP) from a lymph-node metastasis. Androgen-sensitive.",
    ihc: "Positive control for PSA, PSMA, and androgen receptor on prostate IHC panels.",
  },
  {
    cellType: "C42B",
    format: "FFPE",
    tissue: "Prostate",
    markers: [{ name: "AR", status: "pos" }],
    origin: "Bone-metastatic, castration-resistant subline of LNCaP (C4-2B).",
    ihc: "Prostate control paired with LNCaP when the IHC question is androgen-receptor signaling after castration resistance.",
  },
  {
    cellType: "colo205",
    format: "FFPE",
    tissue: "Colorectal",
    markers: [
      { name: "Cytokeratin", status: "pos" },
      { name: "CDX2", status: "pos" },
      { name: "CEA", status: "pos" },
    ],
    origin:
      "Human colorectal adenocarcinoma (COLO 205), established from ascites.",
    ihc: "Colorectal epithelial control for cytokeratin, CDX2, and CEA.",
  },
  {
    cellType: "MDA-MB-453",
    format: "FFPE",
    tissue: "Breast",
    markers: [
      { name: "ER", status: "neg" },
      { name: "PR", status: "neg" },
      { name: "AR", status: "pos" },
    ],
    origin:
      "Human breast carcinoma from a pericardial effusion. Estrogen- and progesterone-receptor negative, androgen-receptor positive.",
    ihc: "Breast carcinoma control for androgen receptor and HER2 IHC, distinct from the ER-positive MCF-7 and T47D lines.",
  },
  {
    cellType: "A431",
    format: "FFPE",
    tissue: "Skin / squamous",
    markers: [
      { name: "EGFR", status: "pos" },
      { name: "Cytokeratin", status: "pos" },
    ],
    origin:
      "Human epidermoid carcinoma of the vulva. The line expresses EGFR at a very high level.",
    ihc: "Strong positive control for EGFR and cytokeratin, and a squamous epithelial reference.",
  },
  {
    cellType: "T47D",
    format: "FFPE",
    tissue: "Breast",
    markers: [
      { name: "ER", status: "pos" },
      { name: "PR", status: "pos" },
    ],
    origin:
      "Human breast ductal carcinoma from a pleural effusion. Estrogen-receptor positive and progesterone-receptor positive.",
    ihc: "Positive control for estrogen receptor and progesterone receptor, used with MCF-7 on breast hormone-receptor IHC.",
  },
  {
    cellType: "293T",
    format: "FFPE",
    tissue: "Embryonic kidney",
    markers: [{ name: "SV40 T antigen", status: "pos" }],
    origin:
      "Human embryonic kidney cells (HEK 293T), a derivative of HEK 293 that stably expresses SV40 large T antigen. Widely used as a transfection host.",
    ihc: "Overexpression control: blocks from 293T cells transfected with your target give a positive control, and untransfected cells a matched negative. Confirm baseline expression of your marker before using untransfected cells as the negative.",
  },
];

/** Diagnostic categories shown on the public FFPE pages (presence only). */
export const DIAGNOSTIC_CATEGORIES = [
  { key: "Normal/Control", label: "Normal / control" },
  { key: "Benign", label: "Benign" },
  { key: "Pre-malignant", label: "Pre-malignant" },
  { key: "Malignant", label: "Malignant" },
] as const;

export type DiagnosticCategoryKey =
  (typeof DIAGNOSTIC_CATEGORIES)[number]["key"];

/**
 * Curated normal / control FFPE tissues, listed on their own for assay
 * development and run controls. `tissue` is the archive organ name.
 */
export const normalControlTissues: { label: string; tissue: string }[] = [
  { label: "Colon", tissue: "Colon" },
  { label: "Gallbladder", tissue: "Gallbladder" },
  { label: "Heart", tissue: "Heart" },
  { label: "Kidney", tissue: "Kidney" },
  { label: "Liver", tissue: "Liver" },
  { label: "Lymph node", tissue: "Lymph Node" },
  { label: "Prostate", tissue: "Prostate" },
  { label: "Skin", tissue: "Skin" },
  { label: "Spleen", tissue: "Spleen" },
  { label: "Stomach", tissue: "Stomach" },
  { label: "Tonsil", tissue: "Tonsil" },
];

/**
 * FFPE products advertised by indication, grouped under the organ-system
 * buckets. Includes indications sourced through partner biobanks, not only the
 * in-house archive. Systems without an entry are not listed on the page.
 */
export type IndicationGroup = {
  systemId: string;
  cancer: string[];
  disease: string[];
};

export const indicationGroups: IndicationGroup[] = [
  {
    systemId: "endocrine",
    cancer: ["Thyroid cancer", "Adrenal cancer"],
    disease: [],
  },
  {
    systemId: "gastrointestinal",
    cancer: ["Colorectal cancer", "Stomach cancer", "Esophageal cancer"],
    disease: [
      "Ulcerative colitis",
      "Crohn's disease",
      "Gastritis",
      "Barrett's esophagus",
      "Colon polyps / adenoma",
    ],
  },
  {
    systemId: "head-neck",
    cancer: ["Head and neck squamous cell carcinoma"],
    disease: ["Tonsillitis"],
  },
  {
    systemId: "hepatobiliary",
    cancer: [
      "Liver cancer (HCC)",
      "Pancreatic cancer",
      "Bile duct cancer (cholangiocarcinoma)",
    ],
    disease: ["Fatty liver disease / NASH", "Cirrhosis", "Cholecystitis"],
  },
  {
    systemId: "lymphoid",
    cancer: ["Lymphoma"],
    disease: ["Reactive lymphoid hyperplasia"],
  },
  {
    systemId: "mammary",
    cancer: ["Breast cancer", "Triple-negative breast cancer"],
    disease: ["Benign breast disease"],
  },
  {
    systemId: "nervous",
    cancer: ["Brain cancer (glioma)"],
    disease: [],
  },
  {
    systemId: "reproductive",
    cancer: [
      "Ovarian cancer",
      "Uterine (endometrial) cancer",
      "Cervical cancer",
    ],
    disease: ["Cervical dysplasia", "Endometriosis", "Placenta"],
  },
  {
    systemId: "respiratory",
    cancer: ["Non-small cell lung cancer", "Small cell lung cancer"],
    disease: ["COPD", "Pulmonary fibrosis"],
  },
  {
    systemId: "skin",
    cancer: [
      "Basal cell carcinoma",
      "Cutaneous squamous cell carcinoma",
      "Melanoma",
    ],
    disease: ["Psoriasis", "Atopic dermatitis"],
  },
  {
    systemId: "soft-tissue",
    cancer: ["Sarcoma"],
    disease: [],
  },
  {
    systemId: "urinary",
    cancer: ["Kidney cancer (RCC)", "Bladder cancer", "Prostate cancer"],
    disease: ["Benign prostatic hyperplasia"],
  },
];

export const TISSUE_ROUTES = {
  landing: "/tissue-bank",
  humanFfpe: "/tissue-bank/human-ffpe",
  cellPellets: "/tissue-bank/cell-pellets",
  mouse: "/tissue-bank/mouse",
} as const;

export function rangeRank(value: string | null | undefined): number {
  if (value == null || value === "—" || value === "-") return -1;
  return RANGE_ORDER[value] ?? -1;
}

/** True when the archive holds at least one case in this category. */
export function hasCategory(
  row: ArchiveRow,
  key: DiagnosticCategoryKey,
): boolean {
  return rangeRank(row[key]) >= 1;
}
