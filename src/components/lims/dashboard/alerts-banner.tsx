import { AlertTriangle } from "lucide-react";
import type { DashboardStats } from "@/lib/lims/types";

export function AlertsBanner({ stats }: { stats: DashboardStats }) {
  const alerts: string[] = [];
  if (stats.unassignedSlides > 0)
    alerts.push(`${stats.unassignedSlides} slide${stats.unassignedSlides > 1 ? "s" : ""} awaiting stain assignment`);
  if (stats.inDevAssays > 0)
    alerts.push(`${stats.inDevAssays} IHC assay${stats.inDevAssays > 1 ? "s" : ""} in development`);
  if (stats.pendingAccessions > 0)
    alerts.push(`${stats.pendingAccessions} accession${stats.pendingAccessions > 1 ? "s" : ""} in progress`);

  if (alerts.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="space-y-0.5">
        {alerts.map((alert) => (
          <p key={alert} className="text-sm text-amber-700 dark:text-amber-400">
            {alert}
          </p>
        ))}
      </div>
    </div>
  );
}
