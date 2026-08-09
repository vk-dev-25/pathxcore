export const commonServicesBlurb =
  "Research pathology capabilities for preclinical, discovery, and translational programs: whole-slide imaging and quantitative image analysis, multiplex immunofluorescence, immunohistochemistry, histology (accessioning through H&E and special stains), pathologist evaluation of research specimens, tissue banking, and tissue microarray (TMA) construction.";

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
    title: "Whole-slide imaging",
    body: "Brightfield and fluorescence scanning on our own equipment. Digital slides available for review and archived for your program.",
  },
  {
    title: "Quantitative image analysis",
    body: "Cell detection, classification, marker quantification, co-expression analysis, and spatial metrics. Delivered as data tables alongside annotated images.",
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

export const homepageCapabilities: {
  title: string;
  body: string;
}[] = [
  {
    title: "Digital Pathology & Image Analysis",
    body: "Whole-slide scanning and quantitative image analysis, performed in-house on our own equipment. Brightfield and fluorescence scanning, digital slide management, and quantitative readouts: cell density, marker positivity, co-expression, and spatial relationships between populations. Because analysis is digital, we can support programs anywhere, including collaborators outside the US who send images rather than tissue.",
  },
  {
    title: "Multiplex Immunohistochemistry & Immunofluorescence",
    body: "Multiplex immunofluorescence panels at 3–4 plex, developed and optimized for your targets and tissue. Panel design, antibody optimization, staining, imaging, and quantitative analysis delivered as one workflow rather than handed between vendors. Useful when single-marker IHC can't answer the question: immune profiling, co-expression, and tissue microenvironment characterization.",
  },
  {
    title: "Immunohistochemistry",
    body: "Single-plex chromogenic IHC across organ systems: routine panels, complex panels, and method development for new targets. Antibody optimization and protocol development for targets without an established protocol.",
  },
  {
    title: "Histology",
    body: "Accessioning, grossing and trimming, tissue processing, embedding, and sectioning. Standard sections at 4–5 µm on positively charged slides; custom thickness on request. H&E and an extensive special stain menu, with custom stain development available.",
  },
  {
    title: "Pathologist Evaluation",
    body: "Qualified pathologist assessment of research specimens, reported as research findings. Available as a standalone service or alongside any staining workflow.",
  },
  {
    title: "Tissue Bank",
    body: "Research-consented human and animal specimens for preclinical and translational programs, searchable by tissue type and specimen characteristics. Tissue microarray construction available.",
  },
];

export const researchUseOnlyFooter =
  "Research use only. PathXDx provides histology, immunohistochemistry, multiplex immunofluorescence, and digital pathology services for preclinical, discovery, and translational research programs. We do not perform clinical diagnostic testing, do not provide diagnostic interpretation of patient specimens, and do not hold CLIA certification or CAP accreditation. All services and data are for research purposes and are not intended for diagnosis, treatment, or prevention of disease.";

export const footerTagline =
  "Research pathology for preclinical, discovery, and translational programs: histology, IHC, multiplex immunofluorescence, whole-slide imaging, and quantitative image analysis. Brisbane, California.";
