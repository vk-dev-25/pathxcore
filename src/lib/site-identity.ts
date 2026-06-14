/** Canonical public site + NAP for SEO, JSON-LD, and footer. */

export const SITE_ORIGIN = "https://pathxdx.com";

export const SITE_NAME = "PathXdx";

export const DEFAULT_OG_IMAGE_PATH = "/images/pathxdx-logo.svg";

export const ORGANIZATION_LOGO_URL = `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`;

export const SITE_PHONE_E164 = "+16507971269";

export const SITE_PHONE_DISPLAY = "650-797-1269";

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
