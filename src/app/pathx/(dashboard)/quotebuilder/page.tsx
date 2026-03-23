import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Quote builder | PathX",
  description: "Build quotes for PathXdx pathology services.",
};

export default function PathXQuoteBuilderPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Module
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Quote builder
        </h1>
        <p className="mt-2 text-muted-foreground">
          This route is reserved for guided quoting: line items, assay/stain
          selections, turnaround expectations, and export to PDF or your CRM.
          Hook forms up to Supabase to persist drafts per organization.
        </p>
      </div>

      <Card className="mt-10 max-w-2xl border-dashed">
        <CardHeader>
          <CardTitle>Next implementation steps</CardTitle>
          <CardDescription>
            Suggested foundations now that auth is in place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Define quote, line item, and catalog tables in Postgres.</li>
            <li>
              Gate reads/writes with RLS so clients only see their workspace.
            </li>
            <li>Add PDF generation or webhook to your billing system.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
