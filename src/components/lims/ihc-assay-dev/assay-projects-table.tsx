import Link from "next/link";
import { StatusBadge } from "@/components/lims/status-badge";
import { Lock } from "lucide-react";
import type { IhcAssayProjectWithProject } from "@/lib/lims/types";

export function AssayProjectsTable({ projects }: { projects: IhcAssayProjectWithProject[] }) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Marker</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Antibody / Clone</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendor</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cat #</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {projects.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No IHC assay development projects yet.</td></tr>
          )}
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/ihc-assay-dev/${p.id}`} className="font-semibold text-primary hover:underline flex items-center gap-1.5">
                  {p.status === "locked" && <Lock className="h-3 w-3 text-emerald-500" />}
                  {p.target_marker}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/projects/${p.project_id}`} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                  {p.project?.project_id}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{p.antibody_clone ?? "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{p.vendor ?? "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{p.catalogue_number ?? "—"}</td>
              <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
