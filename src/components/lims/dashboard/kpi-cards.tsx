import { FolderOpen, ClipboardList, Microscope, Layers } from "lucide-react";
import type { DashboardStats } from "@/lib/lims/types";

interface KpiCardsProps {
  stats: DashboardStats;
}

export function KpiCards({ stats }: KpiCardsProps) {
  const cards = [
    {
      label: "Active Projects",
      value: stats.activeProjects,
      sub: `${stats.totalProjects} total`,
      icon: FolderOpen,
      color: "text-blue-500",
    },
    {
      label: "Accessions",
      value: stats.totalAccessions,
      sub: `${stats.pendingAccessions} in progress`,
      icon: ClipboardList,
      color: "text-amber-500",
    },
    {
      label: "Specimens",
      value: stats.totalSpecimens,
      sub: "across all projects",
      icon: Microscope,
      color: "text-emerald-500",
    },
    {
      label: "Slides",
      value: stats.totalSlides,
      sub: `${stats.unassignedSlides} unassigned`,
      icon: Layers,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-lg border border-border/60 bg-card p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      ))}
    </div>
  );
}
