import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "LIMS | PathX",
  description: "Laboratory information management for PathXdx clients.",
};

export default function PathXLimsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Module
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">LIMS</h1>
        <p className="mt-2 text-muted-foreground">
          This route is reserved for your laboratory information workflows
          (accessioning queues, run sheets, integrations with Supabase Postgres,
          and storage). Replace this scaffold with your production UI and data
          layer.
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
            <li>Model specimens, batches, and statuses in Supabase.</li>
            <li>
              Add row-level security policies keyed to{" "}
              <code className="rounded bg-muted px-1 text-xs">auth.uid()</code>{" "}
              or organization membership.
            </li>
            <li>Wire tables with TanStack Query or server actions.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
