import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { KpiCards } from "@/components/lims/dashboard/kpi-cards";
import { RecentAccessions } from "@/components/lims/dashboard/recent-accessions";
import { AlertsBanner } from "@/components/lims/dashboard/alerts-banner";
import { getDashboardStats, getRecentAccessions } from "@/lib/lims/queries";

export const metadata: Metadata = {
  title: "LIMS Dashboard | PathX",
  description: "Laboratory information management for PathxDx.",
};

export default async function LimsDashboardPage() {
  const supabase = await createClient();
  const [stats, recentAccessions] = await Promise.all([
    getDashboardStats(supabase),
    getRecentAccessions(supabase, 8),
  ]);

  return (
    <LimsShell>
      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">PathxDx</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">LIMS Dashboard</h1>
        </div>
        <AlertsBanner stats={stats} />
        <KpiCards stats={stats} />
        <RecentAccessions items={recentAccessions} />

        {/* ID Schema Reference */}
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">ID Schema Reference</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
            {[
              ["Project",       "PX-[YYYY]-[CLIENT]-[###]",               "PX-2025-NVG-001"],
              ["Accession",     "PX-ACC-YYMM###",                          "PX-ACC-2501001"],
              ["Specimen",      "PX-ACC-...-[TISSUE]-[###]",               "PX-ACC-2501001-BN-001"],
              ["Cell Pellet",   "PX-ACC-...-CP-[CELLLINE]-[###]",          "PX-ACC-2501001-CP-H1975-001"],
              ["CP Overexpr.",  "PX-ACC-...-CP-[LINE].[MARKER]-[###]",     "PX-ACC-2501001-CP-H1975.HER2-001"],
              ["Block",         "[SPECIMEN_ID]-BLK-[###]",                 "PX-ACC-2501001-BN-001-BLK-001"],
              ["Slide",         "[SPECIMEN_ID]-[###]",                     "PX-ACC-2501001-BN-001-001"],
              ["In-House Ctrl", "PX-IN-[MARKER]-[POS/NEG]",               "PX-IN-HER2-POS"],
            ].map(([entity, pattern, example]) => (
              <div key={entity} className="flex items-baseline gap-2">
                <span className="w-28 shrink-0 font-medium text-muted-foreground">{entity}</span>
                <span className="font-mono text-muted-foreground">{pattern}</span>
                <span className="font-mono text-primary shrink-0">{example}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LimsShell>
  );
}
