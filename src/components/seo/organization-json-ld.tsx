import {
  ORGANIZATION_LOGO_URL,
  SITE_ADDRESS,
  SITE_EMAIL_PRIMARY,
  SITE_NAME,
  SITE_ORIGIN,
} from "@/lib/site-identity";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: ORGANIZATION_LOGO_URL,
    email: SITE_EMAIL_PRIMARY,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_ADDRESS.addressLocality,
      addressRegion: SITE_ADDRESS.addressRegion,
      postalCode: SITE_ADDRESS.postalCode,
      addressCountry: SITE_ADDRESS.addressCountry,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_ORIGIN,
  },
];

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
