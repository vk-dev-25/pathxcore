import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, FileSpreadsheet } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "PathX workspace",
  description: "PathX client modules for PathXdx partners.",
};

const modules = [
  {
    href: "/pathx/lims",
    title: "LIMS",
    description:
      "Laboratory information workflows—specimens, accessioning, and operational views (module scaffold).",
    icon: ClipboardList,
  },
  {
    href: "/pathx/quotebuilder",
    title: "Quote builder",
    description:
      "Configure service scopes and estimates for your studies (module scaffold).",
    icon: FileSpreadsheet,
  },
];

export default function PathXHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">PathX modules</h1>
        <p className="mt-2 text-muted-foreground">
          Authenticated tools for PathXdx clients. Additional modules can live
          under <code className="rounded bg-muted px-1 py-0.5 text-xs">/pathx</code>{" "}
          with the same sign-in gate.
        </p>
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {modules.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="group block h-full">
              <Card className="h-full border-border/80 transition-all group-hover:border-primary/40 group-hover:shadow-md">
                <CardHeader>
                  <m.icon className="h-9 w-9 text-primary" />
                  <CardTitle className="text-xl">{m.title}</CardTitle>
                  <CardDescription>{m.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    Open module →
                  </span>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
