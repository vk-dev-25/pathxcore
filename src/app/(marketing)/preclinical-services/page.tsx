import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { preclinicalSteps } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Preclinical services | PathXdx",
  description:
    "Preclinical pathology workflow from accessioning and processing through staining, IHC, and pathologist evaluation.",
};

export default function PreclinicalServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Preclinical
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Preclinical services
        </h1>
        <p className="mt-4 text-muted-foreground">
          A transparent view of the core workflow we use to move specimens from
          receipt to stained slides and pathologist evaluation—aligned with how
          we describe our process on pathxdx.com.
        </p>
      </div>

      <ol className="mt-12 space-y-4">
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
    </div>
  );
}
