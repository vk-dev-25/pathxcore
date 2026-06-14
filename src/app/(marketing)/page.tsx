import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Layers,
  Microscope,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ServicesSlideshow,
  type ServiceSlide,
} from "@/components/services-slideshow";
import { commonServicesBlurb } from "@/lib/site-content";
import { siteAddressShort } from "@/lib/site-identity";
import { homePageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = homePageMetadata;

const pillars = [
  {
    title: "Partner in diagnostic pathology",
    body: "Technologists and pathologists aligned to your protocol, turnaround, and quality bar.",
    icon: ShieldCheck,
  },
  {
    title: "Expertise across the workflow",
    body: "From accessioning and processing to IHC, special stains, and signed-out evaluation.",
    icon: Layers,
  },
  {
    title: "Built for clinical & preclinical",
    body: "Hospitals and clinics alongside biotech, CRO, and academic discovery programs.",
    icon: Sparkles,
  },
];

const highlights = [
  { label: "Coverage", value: "24/7 reach", icon: Clock },
  { label: "Location", value: siteAddressShort(), icon: Microscope },
  { label: "Model", value: "Dedicated technologist", icon: Users },
];

const serviceSlides: ServiceSlide[] = [
  {
    title: "Clinical diagnostic pathology",
    description:
      "Specialty-focused support for hospitals, clinics, and physicians—cardiology, dermatology, neurology, and more—aligned to the diagnoses you deliver for patients.",
    href: "/contact",
    cta: "Contact us",
    imageSrc: "/images/hero-lab-team.png",
    imageAlt:
      "PathXdx technologists collaborating at laboratory instrumentation",
    objectPosition: "object-[center_32%]",
  },
  {
    title: "Preclinical & discovery programs",
    description:
      "End-to-end specimen handling from accessioning through sectioning, H&E, special stains, IHC, and pathologist reading for biotech, CRO, and academic teams.",
    href: "/preclinical-services",
    cta: "See preclinical workflow",
    imageSrc: "/images/hero-scientist.png",
    imageAlt:
      "Laboratory professional in protective equipment beside instrumentation",
    objectPosition: "object-[center_22%]",
  },
  {
    title: "IHC, special stains & evaluation",
    description:
      "Routine and complex panels, method development, and consultation—with qualified pathologist sign-out and digital-ready material when you need it.",
    href: "/contact",
    cta: "Discuss your panel",
    imageSrc: "/images/hero-lab-team.png",
    imageAlt: "Pathology laboratory team at the bench",
    objectPosition: "object-[center_55%]",
  },
  {
    title: "Partnership from PO to delivery",
    description:
      "A dedicated technologist helps design your study, explains each step, and prepares a clear proposal—then executes on your timeline with transparent invoicing.",
    href: "/contact",
    cta: "Book your visit",
    imageSrc: "/images/hero-scientist.png",
    imageAlt: "Scientist reviewing work in the laboratory",
    objectPosition: "object-[center_40%]",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — full-bleed lab imagery + gradient readability (pathxdx / Acepix-style impact) */}
      <section className="relative min-h-[min(92vh,920px)] overflow-hidden border-b border-white/[0.06]">
        <Image
          src="/images/hero-lab-team.png"
          alt="PathXdx technologists in lab coats and gloves collaborating at laboratory instrumentation"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/25 sm:via-background/88 sm:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 sm:to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent sm:h-40" />

        <div className="relative mx-auto flex min-h-[min(92vh,920px)] max-w-6xl flex-col justify-center px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Pathology · Diagnostics · Partnership
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:max-w-2xl sm:text-5xl lg:text-[3.25rem]">
            Shorten the path from specimen to{" "}
            <span className="font-semibold text-primary">confident answers</span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            PathXdx supports hospitals, clinics, biotech, and academia—from
            accessioning and processing through staining, IHC, and pathologist
            evaluation—with a team that shows up on your timeline.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/contact">
                Book your visit
                <ArrowRight className="ml-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" className="font-semibold">
              <Link href="/preclinical-services">
                Preclinical workflow
                <ArrowRight className="ml-0.5" />
              </Link>
            </Button>
          </div>

          <dl className="mt-14 grid max-w-lg gap-4 sm:grid-cols-3 sm:gap-6">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/[0.08] bg-background/55 px-4 py-3 backdrop-blur-md"
                >
                  <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-lab-purple" />
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {item.value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* Acepix-style value pillars */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lab-purple">
            Why teams choose PathXdx
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            High-touch lab partnership, modern throughput
          </h2>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => {
            const PillarIcon = pillar.icon;
            return (
              <li key={pillar.title}>
                <Card className="h-full border-white/[0.08] bg-card/60 shadow-none backdrop-blur-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-16px_hsl(var(--primary)/0.35)]">
                  <CardHeader>
                    <PillarIcon className="h-9 w-9 text-primary" />
                    <CardTitle className="text-lg">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {pillar.body}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Split section — second brand image + narrative */}
      <section className="border-y border-white/[0.06] bg-lab-indigo/35">
        <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col justify-center px-4 py-14 sm:px-6 sm:py-20 lg:pr-10 lg:pl-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              In the lab
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Precision pathology starts with people who sweat the details
            </h2>
            <p className="mt-5 max-w-prose text-muted-foreground">
              The same care that goes into your slides shows up in how we
              communicate—clear milestones, realistic timelines, and a single
              thread from experiment design through delivery.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                QA-minded handling from accessioning through cover-slipping
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lab-purple" />
                IHC, special stains, and digital-ready material on request
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Transparent proposals—PO and timeline, then execution
              </li>
            </ul>
            <div className="mt-10">
              <Button asChild>
                <Link href="/contact">Talk with our team</Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[320px] lg:min-h-[520px]">
            <Image
              src="/images/hero-scientist.png"
              alt="PathXdx laboratory professional in a white coat and safety glasses adjusting protective eyewear beside instrumentation"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[center_15%] lg:object-[center_20%]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-lab-indigo/50 to-transparent lg:from-background/80"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_hsl(var(--lab-purple)/0.2)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-6 left-6 right-6 rounded-lg border border-primary/25 bg-background/70 px-4 py-3 text-xs text-muted-foreground backdrop-blur-md sm:text-sm lg:left-auto lg:max-w-sm"
            >
              <span className="font-semibold text-foreground">
                Brand-aligned imagery
              </span>{" "}
              reinforces trust—your partners should look like the lab you expect.
            </div>
          </div>
        </div>
      </section>

      {/* Featured services — full-width image slides (Acepix-style carousel) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Services aligned to pathxdx.com
          </h2>
          <p className="mt-2 text-muted-foreground">
            Clinical diagnostics and preclinical programs—with shared
            operational excellence—shown as rotating featured services below.
          </p>
        </div>
        <ServicesSlideshow slides={serviceSlides} />
      </section>

      <section className="border-y border-white/[0.06] bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Common services
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            {commonServicesBlurb}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-3">
            <Users className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">Our goal</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our goal is to work with you so you meet your goals. We take the
              extra step to make sure you&apos;re happy with the speed and
              quality of the service we provide.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Our mission</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our ultimate mission is serving patients. By understanding your
              needs we can provide the best solution so you may maximize your
              potential in the pursuit of your mission.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">How we can help you</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When you reach out, we assign a technologist to help design your
              experiment, explain the steps, and prepare a proposal. With a PO
              and timeline, we complete the work and invoice your accounts
              payable when services are returned.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.08]">
        <div
          className="absolute inset-0 bg-gradient-to-b from-card/40 via-background to-background"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsl(var(--primary)/0.07),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Allow PathXdx to serve you
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Please contact us so we may be of assistance. Our customer support
            team is available to help—we aim to respond quickly when you reach
            out.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/contact">Contact us today</Link>
            </Button>
            <Button asChild size="lg" variant="purpleOutline">
              <Link href="/pathx/sign-in">Client workspace</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
