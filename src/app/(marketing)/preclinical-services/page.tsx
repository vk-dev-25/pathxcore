import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { preclinicalSteps } from "@/lib/site-content";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title:
    "Research Pathology Services | Histology, IHC, Multiplex IF & Image Analysis | PathXDx",
  description:
    "Full research pathology workflow from accessioning through quantitative image analysis. Multiplex immunofluorescence, whole-slide imaging, and in-house analysis. Research use only.",
  path: "/preclinical-services",
});

export default function PreclinicalServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Research pathology
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Research pathology services
        </h1>
        <p className="mt-4 text-muted-foreground">
          A transparent view of how we move specimens from receipt through to
          quantified results. Every service below supports preclinical,
          discovery, and translational research programs.
        </p>
        <p className="mt-3 text-muted-foreground">
          Share your study design and we&apos;ll tell you what&apos;s feasible,
          what it costs, and how long it takes before you commit.
        </p>
      </div>

      <h2 className="mt-14 text-xl font-semibold tracking-tight">
        The workflow
      </h2>
      <ol className="mt-6 space-y-4">
        {preclinicalSteps.map((step, index) => (
          <li key={step.title}>
            <Card className="border-border/80">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pl-[4.25rem] pt-0">
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <Button asChild>
          <Link href="/contact">Discuss your study</Link>
        </Button>
      </div>
    </div>
  );
}
