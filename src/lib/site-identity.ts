/** Canonical public site + NAP for SEO, JSON-LD, and footer. */

export const SITE_ORIGIN = "https://pathxdx.com";

export const SITE_NAME = "PathXdx";

/** 1200x630 PNG; social platforms don't render SVG link previews. */
export const DEFAULT_OG_IMAGE_PATH = "/images/og-default.png";

export const ORGANIZATION_LOGO_URL = `${SITE_ORIGIN}/images/pathxdx-logo.svg`;

export const SITE_EMAIL_PRIMARY = "info@pathxdx.com";

export const SITE_ADDRESS = {
  addressLocality: "Brisbane",
  addressRegion: "CA",
  postalCode: "94005",
  addressCountry: "US",
} as const;

export function siteAddressShort(): string {
  const { addressLocality, addressRegion } = SITE_ADDRESS;
  return `${addressLocality}, ${addressRegion}`;
}

export function siteAddressLine(): string {
  const { addressLocality, addressRegion, postalCode } = SITE_ADDRESS;
  return `${addressLocality}, ${addressRegion} ${postalCode}`;
}
