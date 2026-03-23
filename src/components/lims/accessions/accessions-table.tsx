import Link from "next/link";
import { StatusBadge } from "@/components/lims/status-badge";
import { PipelineProgress } from "./pipeline-progress";
import type { AccessionWithProject } from "@/lib/lims/types";

export function AccessionsTable({ accessions }: { accessions: AccessionWithProject[] }) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Accession ID</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Received</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Received By</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pipeline</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {accessions.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No accessions yet.</td>
            </tr>
          )}
          {accessions.map((acc) => (
            <tr key={acc.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/accessions/${acc.id}`} className="font-mono font-semibold text-primary hover:underline">
                  {acc.accession_id}
                </Link>
                {acc.is_control && (
                  <span className="ml-2 text-[10px] bg-purple-500/10 text-purple-600 rounded px-1 py-0.5">CTRL</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/projects/${acc.project_id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {acc.project?.project_id}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {new Date(acc.received_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{acc.received_by ?? "—"}</td>
              <td className="px-4 py-3">
                <PipelineProgress status={acc.status} />
              </td>
              <td className="px-4 py-2.5"><StatusBadge status={acc.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
