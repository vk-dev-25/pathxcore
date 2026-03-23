import type { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clinicalSpecialties } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Clinical services | PathXdx",
  description:
    "Clinical diagnostic pathology services for hospitals, clinics, and doctors' offices across multiple specialties.",
};

export default function ClinicalServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Clinical
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Clinical diagnostic pathology services
        </h1>
        <p className="mt-4 text-muted-foreground">
          Based upon your practice needs, the following are some of the
          services PathXdx provides. Other services may be added—share the
          diagnoses you provide your patients and we will tailor support to
          your practice.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clinicalSpecialties.map((name) => (
          <li key={name}>
            <Card className="h-full border-border/80 transition-colors hover:border-primary/30">
              <CardHeader>
                <CardTitle className="text-base">{name}</CardTitle>
                <CardDescription>
                  Specialty-aligned histology and diagnostic support.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
