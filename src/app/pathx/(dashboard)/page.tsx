import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  FileSpreadsheet,
  Layers,
  Search,
  Settings2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard | PathX",
  description: "PathX client workspace—quotes, tissue bank, LIMS, and more.",
};

const modules = [
  {
    href: "/pathx/quotebuilder",
    title: "Quote builder",
    description:
      "Configure service scopes and estimates for your studies (module scaffold).",
    icon: FileSpreadsheet,
  },
  {
    href: "/pathx/quotes",
    title: "Quote finder",
    description:
      "Browse, search, and sort your saved quotes by date or organization.",
    icon: Search,
  },
  {
    href: "/pathx/admin/pricing",
    title: "Admin / pricing",
    description:
      "Edit catalog unit prices, volume tiers, segment multipliers, and quote defaults.",
    icon: Settings2,
  },
  {
    href: "/pathx/tissue-bank",
    title: "Tissue bank",
    description:
      "Tissue banking, inventory, storage, and retrieval requests (module scaffold).",
    icon: Layers,
  },
  {
    href: "/pathx/lims",
    title: "LIMS",
    description:
      "Laboratory information workflows—specimens, accessioning, and operational views (module scaffold).",
    icon: ClipboardList,
  },
];

export default function PathXHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Signed-in workspace for PathXdx clients. Open a module below or use
          the navigation bar—each utility is its own page.
        </p>
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    Open →
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
