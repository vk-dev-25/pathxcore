function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export const LIMS_TISSUE_OPTIONS = [
  "Adrenal gland",
  "Bladder",
  "Blood",
  "Bone",
  "Bone marrow",
  "Brain",
  "Breast",
  "Cell pellet",
  "Colon",
  "Eye",
  "Heart",
  "Kidney",
  "Liver",
  "Lung",
  "Lymph node",
  "Muscle",
  "Ovary",
  "Pancreas",
  "Prostate",
  "Skin",
  "Small intestine",
  "Spleen",
  "Stomach",
  "Testis",
  "Thyroid",
  "Tonsil",
  "Uterus",
] as const;

const TISSUE_TO_ABBREV: Record<string, string> = {
  "adrenal gland": "AG",
  adrenal: "AG",
  bladder: "BL",
  blood: "BLD",
  bone: "BN",
  lung: "LG",
  lungs: "LG",
  liver: "LV",
  kidney: "KD",
  kidneys: "KD",
  "bone marrow": "BM",
  marrow: "BM",
  brain: "BR",
  heart: "HT",
  skin: "SK",
  colon: "CO",
  eye: "EY",
  eyes: "EY",
  stomach: "ST",
  spleen: "SP",
  pancreas: "PN",
  prostate: "PR",
  breast: "BT",
  "cell pellet": "CP",
  ovary: "OV",
  ovaries: "OV",
  thyroid: "TY",
  tonsil: "TN",
  tonsils: "TN",
  lymph: "LN",
  "lymph node": "LN",
  "lymph nodes": "LN",
  muscle: "MS",
  "small intestine": "SI",
  intestine: "SI",
  testis: "TS",
  testes: "TS",
  uterus: "UT",
};

export function resolveOrganAbbrev(
  tissueType: string,
  override: string | null | undefined,
): string {
  const o = override?.trim().toUpperCase();
  if (o && /^[A-Z]{2,4}$/.test(o)) return o;

  const n = norm(tissueType);
  if (!n) return "XX";

  if (TISSUE_TO_ABBREV[n]) return TISSUE_TO_ABBREV[n];

  for (const [k, v] of Object.entries(TISSUE_TO_ABBREV)) {
    if (n.includes(k) || k.includes(n)) return v;
  }

  const words = n.split(/[\s,;/]+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].slice(0, 1) + words[1].slice(0, 1)).toUpperCase().slice(0, 4);
  }
  const w = words[0] ?? "xx";
  return w.slice(0, 2).toUpperCase().padEnd(2, "X");
}
