import type { Metadata } from "next";
import { Clock, FlaskConical, Mail, Microscope, Users } from "lucide-react";

import { ContactUsForm } from "@/components/contact-us-form";
import { marketingMetadata } from "@/lib/site-seo";
import { SITE_EMAIL_PRIMARY } from "@/lib/site-identity";

export const metadata: Metadata = marketingMetadata({
  title: "Discuss Your Study | PathXDx Research Pathology",
  description:
    "Talk to our team about histology, IHC, multiplex immunofluorescence, or whole-slide scanning for your research program.",
  path: "/contact",
});

const ABOUT = [
  {
    icon: Microscope,
    text: "Histology, IHC, multiplex IF, and whole-slide scanning in our own lab",
  },
  {
    icon: Users,
    text: "A dedicated technologist for every program",
  },
  {
    icon: FlaskConical,
    text: "Human, cell pellet, and mouse FFPE blocks from our archive and partner biobanks",
  },
];

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
        For multiplex programs, sharing your study design up
        front lets us give you a realistic scope on the first call rather than
        the third.
      </p>

      <section
        id="about"
        aria-labelledby="about-heading"
        className="mt-10 scroll-mt-28 rounded-2xl border border-border/80 bg-card p-6"
      >
        <h2 id="about-heading" className="text-lg font-semibold tracking-tight">
          About PathXDx
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          PathXDx is a research pathology laboratory in Brisbane, California,
          supporting biotech, pharma, CRO, and academic programs. Research use
          only.
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {ABOUT.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3 text-sm">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
                aria-hidden
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="pt-1">{text}</span>
            </li>
          ))}
        </ul>
      </section>

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
