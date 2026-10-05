/**
 * Illustrative H&E and IHC thumbnails from Wikimedia Commons, used on the
 * public Tissue Blocks pages as placeholders until PathXDx supplies its own
 * images. Credits are not shown on the site for now: replace these images
 * before going live, or render credits for any CC BY / CC BY-SA image kept.
 */
export type ImageCredit = {
  src: string;
  label: string;
  author: string;
  license: string;
  /** Empty for public-domain images. */
  licenseUrl: string;
  source: string;
};

export const heImages: ImageCredit[] = [
  {
    src: "/images/he/colon.jpg",
    label: "Normal colon",
    author: "Mikael Häggström, M.D.",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:Histology_of_a_normal_colonic_mucosal_epithelium.jpg",
  },
  {
    src: "/images/he/gallbladder.jpg",
    label: "Gallbladder",
    author: "Nephron",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Gallbladder_-_intermed_mag.jpg",
  },
  {
    src: "/images/he/heart.jpg",
    label: "Myocardium",
    author: "Mikael Häggström, M.D.",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:Myocardial_lipofuscin_(original).jpg",
  },
  {
    src: "/images/he/kidney.jpg",
    label: "Kidney",
    author: "Nephron",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Renal_oncocytoma3.jpg",
  },
  {
    src: "/images/he/liver.jpg",
    label: "Liver",
    author: "Paulo Abrahamsohn",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Liver-H%26E.jpg",
  },
  {
    src: "/images/he/lymph-node.jpg",
    label: "Lymph node",
    author: "Ed Uthman, MD",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Normal_Lymph_Node.jpg",
  },
  {
    src: "/images/he/prostate.jpg",
    label: "Normal prostate",
    author: "Mikael Häggström, M.D.",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:Histology_of_normal_prostate.jpg",
  },
  {
    src: "/images/he/skin.jpg",
    label: "Skin",
    author: "Wikimedia Commons contributor",
    license: "Public domain",
    licenseUrl: "",
    source:
      "https://commons.wikimedia.org/wiki/File:Normal_Epidermis_and_Dermis_with_Intradermal_Nevus_10x-cropped.JPG",
  },
  {
    src: "/images/he/spleen.jpg",
    label: "Spleen",
    author: "Ed Uthman, MD",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Splenunculus_(accessory_spleen)_photomicrograph.JPG",
  },
  {
    src: "/images/he/stomach.jpg",
    label: "Gastric mucosa",
    author: "Nephron",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Normal_gastric_mucosa_intermed_mag.jpg",
  },
  {
    src: "/images/he/tonsil.jpg",
    label: "Tonsil",
    author: "MariaBassett17",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Tonsil_tissue_germinal_center_H%26E_stain.tiff",
  },
  {
    src: "/images/he/thyroid.jpg",
    label: "Thyroid",
    author: "Nephron",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Thyroid_gland_-_high_mag.jpg",
  },
  {
    src: "/images/he/breast.jpg",
    label: "Normal breast",
    author: "Mikael Häggström, M.D.",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source: "https://commons.wikimedia.org/wiki/File:Normal_breast_acinus.jpg",
  },
  {
    src: "/images/he/brain.jpg",
    label: "Brain",
    author: "Nephron",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Bergmann_gliosis_-_intermed_mag.jpg",
  },
  {
    src: "/images/he/lung.jpg",
    label: "Normal lung",
    author: "Yale Rosen",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Normal_lung_(5414785258).jpg",
  },
  {
    src: "/images/he/endometrium.jpg",
    label: "Endometrium",
    author: "Mikael Häggström, M.D.",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:Histology_of_normal_simple_columnar_epithelium_of_the_endometrium.jpg",
  },
  {
    src: "/images/he/adipose.jpg",
    label: "Adipose tissue",
    author: "Hyeree Kim, Sang Hyun Cho, Jeong Deuk Lee, Hei Sung Kim",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Histopathology_of_lipoma.jpg",
  },
];

export const ihcImages: ImageCredit[] = [
  {
    src: "/images/ihc/ihc-er.jpg",
    label: "ER IHC",
    author: "Yale Rosen",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Metastatic_breast_carcinoma;_pleura-Estrogen_receptor_Case_166_(5477628458).jpg",
  },
  {
    src: "/images/ihc/ihc-her2.jpg",
    label: "HER2 IHC",
    author: "藤澤孝志",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:131648x20-1_3%2B.jpg",
  },
  {
    src: "/images/ihc/ihc-psa.jpg",
    label: "PSA IHC",
    author: "Mikael Häggström, M.D.",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:PSA_immunohistochemistry_of_metastatic_prostate_cancer.jpg",
  },
  {
    src: "/images/ihc/ihc-ttf1.jpg",
    label: "TTF-1 IHC",
    author: "Mikael Häggström, M.D.",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:Immunohistochemistry_of_adenocarcinoma_with_nuclear_staining_for_TTF-1.jpg",
  },
  {
    src: "/images/ihc/ihc-cd3.jpg",
    label: "CD3 IHC",
    author: "Yale Rosen",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Pleural_based_thymoma_-_CD3_immunostain_-_Case_282_(12074245855).jpg",
  },
  {
    src: "/images/ihc/ihc-cd20.jpg",
    label: "CD20 IHC",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    source:
      "https://commons.wikimedia.org/wiki/File:Diffuse_large_B_cell_lymphoma_(4)_CD20.jpg",
  },
  {
    src: "/images/ihc/ihc-cd31.jpg",
    label: "CD31 IHC",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    source:
      "https://commons.wikimedia.org/wiki/File:Cutaneous_angiosarcoma_(4)_CD31.jpg",
  },
  {
    src: "/images/ihc/ihc-cytokeratin.jpg",
    label: "Cytokeratin IHC",
    author: "Ed Uthman",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Cytokeratins_AE1-AE3_(%2B)_(2163477507).jpg",
  },
  {
    src: "/images/ihc/ihc-p63.jpg",
    label: "p63 IHC",
    author: "Mikael Häggström, M.D.",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:Chromogenic_immunohistochemistry_of_p63_of_squamous-cell_carcinoma_of_the_lung.jpg",
  },
  {
    src: "/images/ihc/ihc-ki67.jpg",
    label: "Ki-67 IHC",
    author:
      "Sandi Shen, Gaofang Xiao, Richang Du, Ningdong Hu, Xu Xia and Haibo Zhou",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Positive_immunohistochemistry_of_KI-67_in_invasive_breast_cancer.jpg",
  },
];

const bySrc = new Map(
  [...heImages, ...ihcImages].map((image) => [image.src, image]),
);

/** H&E thumbnail for a normal tissue or organ system, by file key. */
export function heImage(key: string): string {
  return `/images/he/${key}.jpg`;
}

/** IHC thumbnail by marker file key, e.g. "er", "her2". */
export function ihcImage(key: string): string {
  return `/images/ihc/ihc-${key}.jpg`;
}

export function creditFor(src: string): ImageCredit | undefined {
  return bySrc.get(src);
}
