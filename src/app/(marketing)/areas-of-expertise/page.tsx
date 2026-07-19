import type { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { expertiseAreas } from "@/lib/site-content";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Areas of expertise | PathXdx",
  description:
    "Organ-system expertise for preclinical and discovery histology, IHC, and pathology support.",
  path: "/areas-of-expertise",
});

export default function AreasOfExpertisePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Expertise
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Areas of expertise
        </h1>
        <p className="mt-4 text-muted-foreground">
          We support histology and IHC across organ systems commonly studied in
          preclinical and discovery programs. Share your study design and we
          will tailor panels, stains, and pathologist evaluation to your
          protocol.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {expertiseAreas.map((name) => (
          <li key={name}>
            <Card className="h-full border-border/80 transition-colors hover:border-primary/30">
              <CardHeader>
                <CardTitle className="text-base">{name}</CardTitle>
                <CardDescription>
                  Organ-system expertise for preclinical and discovery studies.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
