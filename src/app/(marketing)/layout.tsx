import type { Metadata } from "next";

import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { ContactWidget } from "@/components/contact-widget";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { marketingSegmentMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingSegmentMetadata;

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ContactWidget />
    </div>
  );
}
