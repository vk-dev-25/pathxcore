import Link from "next/link";
import { Clock, Mail, MapPin } from "lucide-react";

import { BrandLockup } from "@/components/brand-lockup";
import { HeaderTissueBackdrop } from "@/components/header-tissue-backdrop";
import { Separator } from "@/components/ui/separator";
import { footerTagline, researchUseOnlyFooter } from "@/lib/site-content";
import {
  SITE_EMAIL_PRIMARY,
  SITE_HOURS,
  siteAddressLine,
} from "@/lib/site-identity";

const serviceLinks = [
  { href: "/tissue-bank", label: "Tissue Blocks" },
  { href: "/preclinical-services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="theme-dark relative bg-[#0c1424] text-foreground">
      <HeaderTissueBackdrop edge="top" subtle />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <BrandLockup size="lg" framed={false} />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {footerTagline}
            </p>
            <nav
              aria-label="Services"
              className="flex flex-wrap gap-x-4 gap-y-2"
            >
              {serviceLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Contact</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-lab-purple" />
                <a
                  href={`mailto:${SITE_EMAIL_PRIMARY}`}
                  className="transition-colors hover:text-foreground"
                >
                  {SITE_EMAIL_PRIMARY}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{siteAddressLine()}</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">
              Office hours{" "}
              <span className="font-normal text-muted-foreground">(PT)</span>
            </p>
            <dl className="max-w-60 space-y-2 text-sm">
              {SITE_HOURS.map(({ days, time }) => (
                <div key={days} className="flex items-center gap-2">
                  <Clock
                    className="h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <dt className="text-muted-foreground">{days}</dt>
                  <dd className="ml-auto tabular-nums text-foreground">
                    {time}
                  </dd>
                </div>
              ))}
            </dl>
            <Link
              href="/contact"
              className="inline-flex text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Discuss your study →
            </Link>
          </div>
        </div>
        <Separator className="my-10 bg-white/[0.08]" />
        <p className="mx-auto max-w-4xl text-center text-xs leading-relaxed text-muted-foreground">
          {researchUseOnlyFooter}
        </p>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PathXdx. All rights reserved.
          {" · "}
          <Link href="/privacy" className="hover:text-foreground">
            Privacy policy
          </Link>
        </p>
      </div>
    </footer>
  );
}
