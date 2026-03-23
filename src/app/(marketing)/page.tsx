import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FlaskConical,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { commonServicesBlurb } from "@/lib/site-content";

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
  { label: "Location", value: "South San Francisco", icon: Microscope },
  { label: "Model", value: "Dedicated technologist", icon: Users },
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
            <span className="bg-gradient-to-r from-primary via-lab-purple to-lab-orange bg-clip-text text-transparent">
              confident answers
            </span>
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
            <Button asChild variant="purpleOutline" size="lg">
              <Link href="/clinical-services">Clinical services</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              <Link href="/preclinical-services">Preclinical workflow</Link>
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lab-orange">
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
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lab-orange" />
                Transparent proposals—PO and timeline, then execution
              </li>
            </ul>
            <div className="mt-10">
              <Button asChild variant="orange">
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

      {/* Clinical / Preclinical cards with thumbnail cues */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Services aligned to pathxdx.com
          </h2>
          <p className="mt-2 text-muted-foreground">
            Two front doors—clinical diagnostics and preclinical programs—with
            shared operational excellence underneath.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="group overflow-hidden border-white/[0.08] bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-[0_0_48px_-20px_hsl(var(--primary)/0.45)]">
            <div className="relative aspect-[21/9] overflow-hidden border-b border-white/[0.06]">
              <Image
                src="/images/hero-lab-team.png"
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[center_35%] opacity-90 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <Microscope className="absolute bottom-3 left-4 h-8 w-8 text-primary drop-shadow-md" />
            </div>
            <CardHeader>
              <CardTitle>Clinical services</CardTitle>
              <CardDescription>
                Hospitals, clinics, and doctors&apos; offices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Specialty-focused support across cardiology, dermatology,
                neurology, and more—tailored to the diagnoses you provide your
                patients.
              </p>
              <Button asChild variant="secondary">
                <Link href="/clinical-services">View clinical services</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden border-white/[0.08] bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-[0_0_48px_-20px_hsl(var(--lab-purple)/0.35)]">
            <div className="relative aspect-[21/9] overflow-hidden border-b border-white/[0.06]">
              <Image
                src="/images/hero-scientist.png"
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[center_30%] opacity-90 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <FlaskConical className="absolute bottom-3 left-4 h-8 w-8 text-lab-purple drop-shadow-md" />
            </div>
            <CardHeader>
              <CardTitle>Preclinical services</CardTitle>
              <CardDescription>
                Biotech institutions, R&amp;D entities, and academia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                End-to-end specimen handling: accessioning through sectioning,
                staining, IHC, and pathologist reading.
              </p>
              <Button asChild variant="secondary">
                <Link href="/preclinical-services">View preclinical workflow</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
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
          className="absolute inset-0 bg-gradient-to-br from-primary/25 via-lab-indigo to-background"
          aria-hidden
        />
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lab-purple/25 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-lab-orange/15 blur-3xl"
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
            <Button asChild size="lg" variant="orange" className="font-semibold">
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
