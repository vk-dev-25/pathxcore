import type { Metadata } from "next";

import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  SITE_ORIGIN,
} from "@/lib/site-identity";

export type MarketingSeoPage = {
  /** Full HTML title (include brand if you want it explicit). */
  title: string;
  description: string;
  /** Path only, e.g. `/contact` — used for canonical and OG url. */
  path: string;
};

export function marketingMetadata({
  title,
  description,
  path,
}: MarketingSeoPage): Metadata {
  const ogUrl = path.startsWith("http") ? path : `${SITE_ORIGIN}${path}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: ogUrl,
      images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
  };
}

const HOME_TITLE_ABSOLUTE =
  "PathXdx | Clinical & preclinical pathology partner in Brisbane, CA";

const HOME_DESCRIPTION =
  "PathXdx is a Brisbane, CA pathology partner for hospitals, clinics, biotech, and academia—from accessioning and processing through IHC, special stains, and pathologist evaluation.";

export const homePageMetadata: Metadata = {
  title: { absolute: HOME_TITLE_ABSOLUTE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: HOME_TITLE_ABSOLUTE,
    description: HOME_DESCRIPTION,
    url: SITE_ORIGIN,
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE_ABSOLUTE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export const marketingSegmentMetadata: Metadata = {
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: SITE_NAME }],
  },
};
