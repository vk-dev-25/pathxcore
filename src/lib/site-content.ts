/** Organ systems and disease areas we support for preclinical / discovery work. */
export const expertiseAreas = [
  "Cardiology",
  "Dermatology",
  "Gastroenterology",
  "Gynecology",
  "Hematology",
  "Musculoskeletal",
  "Nephrology",
  "Neurology",
  "Ophthalmology",
  "Otolaryngology",
  "Urology",
  "Special projects",
] as const;

export const preclinicalSteps: { title: string; body: string }[] = [
  {
    title: "Accessioning & intake",
    body: "Specimens logged, tracked, and QC'd on receipt. Chain of custody documented throughout.",
  },
  {
    title: "Grossing, trimming & processing",
    body: "Dictation and trimming to your protocol; tissue processing for FFPE or frozen workflows.",
  },
  {
    title: "Embedding & sectioning",
    body: "Standard 4–5 µm sections on positively charged slides. Custom thickness, serial sections, and step sections on request.",
  },
  {
    title: "Staining",
    body: "H&E, special stains, single-plex IHC, or multiplex immunofluorescence, depending on your study.",
  },
  {
    title: "Whole-slide scanning",
    body: "Brightfield and fluorescence scanning on our own equipment. Whole-slide images are delivered to you and archived for your program.",
  },
  {
    title: "Pathologist evaluation",
    body: "Qualified pathologist assessment of research specimens where your study calls for it. Reported as research findings.",
  },
  {
    title: "Reporting",
    body: "Results delivered with methods documented, so your team can interpret and reproduce them.",
  },
];

/** Service capabilities, shown on the Services page and summarized on Home. */
export const serviceCapabilities: {
  id: string;
  title: string;
  summary: string;
  details: string[];
}[] = [
  {
    id: "multiplex",
    title: "Multiplex immunofluorescence",
    summary:
      "3–4 plex panels developed and optimized for your targets and tissue, delivered as one workflow rather than handed between vendors.",
    details: [
      "Panel design and antibody optimization",
      "Staining and whole-slide fluorescence imaging",
      "Panels for immune and tumor microenvironment markers",
      "Several markers on one section when single-marker IHC isn't enough",
    ],
  },
  {
    id: "ihc",
    title: "Immunohistochemistry",
    summary: "Single-plex chromogenic IHC across organ systems.",
    details: [
      "Routine and complex panels",
      "Method development for new targets",
      "Antibody optimization and protocol development",
    ],
  },
  {
    id: "histology",
    title: "Histology",
    summary:
      "Accessioning through sectioning and staining, for FFPE and frozen workflows.",
    details: [
      "Grossing, trimming, processing, and embedding",
      "4–5 µm sections on charged slides; custom thickness, serial, and step sections",
      "H&E and special stains, with custom stain development",
      "Tissue microarray construction",
    ],
  },
  {
    id: "pathologist-evaluation",
    title: "Pathologist evaluation",
    summary:
      "Qualified pathologist assessment of research specimens, reported as research findings.",
    details: [
      "Standalone, or alongside any staining workflow",
      "Research-use findings, not diagnostic interpretation",
    ],
  },
  {
    id: "slide-scanning",
    title: "Whole-slide scanning",
    summary:
      "Brightfield and fluorescence scanning on our own equipment, with whole-slide images (WSI) delivered to you for review, sharing, and your own analysis.",
    details: [
      "Brightfield and fluorescence whole-slide scanning",
      "Whole-slide image files delivered to you",
      "Digital slide archiving for your program",
    ],
  },
];

export const researchUseOnlyFooter =
  "Research use only. PathXDx provides histology, immunohistochemistry, multiplex immunofluorescence, and whole-slide scanning services for preclinical, discovery, and translational research programs. We do not perform clinical diagnostic testing, do not provide diagnostic interpretation of patient specimens, and do not hold CLIA certification or CAP accreditation. All services and data are for research purposes and are not intended for diagnosis, treatment, or prevention of disease. Human tissue is collected under IRB-approved protocols, with donor consent for research, and is de-identified.";

export const footerTagline =
  "Research pathology for preclinical, discovery, and translational programs: histology, IHC, multiplex immunofluorescence, and whole-slide scanning. Brisbane, California.";
