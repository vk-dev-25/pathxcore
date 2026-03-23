import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

import { Separator } from "@/components/ui/separator";

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
                src="/images/pathxdx-logo.svg"
                alt="PathXdx"
                width={152}
                height={32}
                className="h-8 w-auto opacity-95"
              />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Clinical and preclinical pathology services—accessioning through
              specialized staining, evaluation, and consultation. South San
              Francisco laboratory partner for care teams and discovery teams.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Contact</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href="tel:+16507971269"
                  className="transition-colors hover:text-foreground"
                >
                  Main: 650-797-1269
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-lab-purple" />
                <div className="flex flex-col gap-1">
                  <a
                    href="mailto:info@pathxdx.com"
                    className="transition-colors hover:text-foreground"
                  >
                    info@pathxdx.com
                  </a>
                  <a
                    href="mailto:nick@pathxdx.com"
                    className="transition-colors hover:text-foreground"
                  >
                    nick@pathxdx.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>South San Francisco, CA 94080</span>
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
