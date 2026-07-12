import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
  SITE_EMAIL_PRIMARY,
  siteAddressLine,
} from "@/lib/site-identity";

const serviceLinks = [
  { href: "/clinical-services", label: "Clinical services" },
  { href: "/preclinical-services", label: "Preclinical services" },
  { href: "/tissue-bank", label: "Tissue bank" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-card/40">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lab-purple/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/pathxlogo.jpeg"
                alt="PathXdx"
                width={258}
                height={236}
                className="h-16 w-auto opacity-95 sm:h-[4.5rem]"
              />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Clinical and preclinical pathology services—accessioning through
              specialized staining, evaluation, and consultation. Brisbane, CA
              laboratory partner for care teams and discovery teams.
            </p>
            <nav aria-label="Services" className="flex flex-wrap gap-x-4 gap-y-2">
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
            <p className="text-sm font-semibold text-foreground">Hours</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Reach us any time. Office hours: Monday–Friday 7am–7pm, Saturday
              9am–5pm.
            </p>
            <Link
              href="/contact"
              className="inline-flex text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Book a visit or message us →
            </Link>
          </div>
        </div>
        <Separator className="my-10 bg-white/[0.08]" />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PathXdx. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
