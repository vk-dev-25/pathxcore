import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tissue bank | PathX",
  description: "Tissue bank and specimen inventory for PathXdx clients.",
};

export default function PathXTissueBankPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Module
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Tissue bank
        </h1>
        <p className="mt-2 text-muted-foreground">
          This route is reserved for tissue banking workflows—inventory,
          storage locations, consent/consent scope, and retrieval requests. Wire
          it to Supabase with RLS per organization when you are ready.
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
            <li>Model specimens, storage locations, and chain-of-custody in Postgres.</li>
            <li>
              Gate reads/writes with RLS so clients only see their workspace.
            </li>
            <li>Add search, filters, and export for audits.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
