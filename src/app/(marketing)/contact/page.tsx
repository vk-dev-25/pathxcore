import type { Metadata } from "next";
import { Clock, Mail } from "lucide-react";

import { ContactUsForm } from "@/components/contact-us-form";
import { marketingMetadata } from "@/lib/site-seo";
import { SITE_EMAIL_PRIMARY } from "@/lib/site-identity";

export const metadata: Metadata = marketingMetadata({
  title: "Discuss Your Study | PathXDx Research Pathology",
  description:
    "Talk to our team about histology, IHC, multiplex immunofluorescence, or image analysis for your research program.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Discuss your study
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Tell us what you&apos;re working on. Tissue type, targets, study stage,
        and timeline are the most useful things to include. We&apos;ll tell you
        what&apos;s feasible and what it costs.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        For multiplex or image analysis programs, sharing your study design up
        front lets us give you a realistic scope on the first call rather than
        the third.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-8 text-sm">
          <section>
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Email</h2>
                <a
                  href={`mailto:${SITE_EMAIL_PRIMARY}`}
                  className="mt-1 block text-muted-foreground hover:text-foreground"
                >
                  {SITE_EMAIL_PRIMARY}
                </a>
              </div>
            </div>
          </section>

          <section>
            <div className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Opening Hours</h2>
                <p className="mt-1 whitespace-pre-line text-muted-foreground">
                  {`Mon - Fri: 7am - 7pm
Saturday: 9am - 5pm`}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:pt-1">
          <ContactUsForm variant="inline" />
        </div>
      </div>
    </div>
  );
}
