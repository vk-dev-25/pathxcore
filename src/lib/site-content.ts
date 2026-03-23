export const commonServicesBlurb =
  "The following services are provided for both clinical and preclinical settings: accessioning, grossing / dictation / trimming, tissue processing, embedding, sectioning (frozen and fixed), staining (H&E, special stain, IHC), glass cover-slipping, DNA/RNA analyses, tissue banking services, tissue micro-array (TMA), clinical chemistry, consulting, and more.";

export const clinicalSpecialties = [
  "Cardiology",
  "Gynecology",
  "Neurology",
  "Urology",
  "Ophthalmology",
  "Musculoskeletal",
  "Gastroenterology",
  "Hematology",
  "Otolaryngology",
  "Dermatology",
  "Nephrology",
  "Special projects",
] as const;

export const preclinicalSteps: { title: string; body: string }[] = [
  {
    title: "Accessioning",
    body: "As specimens are received, they're checked to make sure what is received matches what was sent. A unique code (accessioning number) is assigned to every sample entering our lab.",
  },
  {
    title: "Trimming",
    body: "Every specimen may get a trim or possibly be cut so it fits the standard cassette and mold. The tissue is placed in a pre-labelled cassette.",
  },
  {
    title: "Tissue processing",
    body: "Tissue specimens that have been placed in a pre-labelled cassette go through a vacuumed infiltration process that dehydrates the tissues and infiltrates them in paraffin.",
  },
  {
    title: "Embedding",
    body: "When the tissue cassettes come out of the tissue processor, each individual specimen is embedded into molds. Depending on what the pathologist is hoping to see, a special orientation may be required.",
  },
  {
    title: "Sectioning",
    body: "Blocks are routinely sectioned into 4–5 micron sections on positively charged glass slides unless otherwise requested—for example, special stains, thinner or thicker sections, or curls for DNA/RNA analysis into sterilized tubes.",
  },
  {
    title: "Staining",
    body: "Sections on slides are routinely stained H&E for an initial pathologist reading.",
  },
  {
    title: "Special stains",
    body: "After an initial reading, special stains may be requested. Requestors may ask for any special stain. We maintain an extensive list of what we currently perform; if something is not on our routine list, we can assess or assist with your needs.",
  },
  {
    title: "Evaluation",
    body: "Upon your request, slides will be evaluated by a qualified pathologist. Stains may also be evaluated using software technologies. We partner with sister companies to provide such services at a pass-through cost.",
  },
  {
    title: "Pathology reading",
    body: "Upon your request, slides will be evaluated by a qualified pathologist.",
  },
  {
    title: "Immunohistochemistry (IHC)",
    body: "Based upon your needs we provide IHC services—including routine simple and complex panels, method development, and consultation.",
  },
];
