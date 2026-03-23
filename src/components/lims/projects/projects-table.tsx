import Link from "next/link";
import { StatusBadge } from "@/components/lims/status-badge";
import type { ProjectWithClient } from "@/lib/lims/types";

export function ProjectsTable({ projects }: { projects: ProjectWithClient[] }) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project ID</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">PI</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {projects.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                No projects yet.
              </td>
            </tr>
          )}
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/projects/${p.id}`} className="font-mono font-semibold text-primary hover:underline">
                  {p.project_id}
                </Link>
              </td>
              <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">{p.title}</td>
              <td className="px-4 py-2.5">
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{p.client.code}</span>
                <span className="ml-1.5 text-muted-foreground">{p.client.name}</span>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{p.pi_name ?? "—"}</td>
              <td className="px-4 py-2.5"><StatusBadge status={p.project_type} /></td>
              <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {p.start_date ? new Date(p.start_date).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
