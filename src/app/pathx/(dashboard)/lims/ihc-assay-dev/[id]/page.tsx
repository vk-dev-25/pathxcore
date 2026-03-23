import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { StatusBadge } from "@/components/lims/status-badge";
import { AddRunDialog } from "@/components/lims/ihc-assay-dev/add-run-dialog";
import { getIhcAssayProject } from "@/lib/lims/queries";

export default async function AssayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const assay = await getIhcAssayProject(supabase, id);

  if (!assay) notFound();

  const isLocked = assay.status === "locked";
  const nextRunNumber = assay.runs.length + 1;

  return (
    <LimsShell>
      <div className="p-6 space-y-6">
        <div>
          <Link href="/pathx/lims/ihc-assay-dev" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="h-4 w-4" />IHC Assay Dev
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {isLocked && <Lock className="h-4 w-4 text-emerald-500" />}
                <h1 className="text-xl font-semibold">{assay.target_marker}</h1>
                <StatusBadge status={assay.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <Link href={`/pathx/lims/projects/${assay.project_id}`} className="hover:text-foreground">
                  {assay.project?.project_id}
                </Link>
                {assay.antibody_clone && ` · Clone: ${assay.antibody_clone}`}
                {assay.vendor && ` · ${assay.vendor}`}
                {assay.catalogue_number && ` · Cat: ${assay.catalogue_number}`}
              </p>
            </div>
            {!isLocked && (
              <AddRunDialog assayProjectId={id} runNumber={nextRunNumber} />
            )}
          </div>
        </div>

        {/* Controls */}
        {assay.controls.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Controls</h3>
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border/60">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Control</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {assay.controls.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2">
                        <StatusBadge status={c.control_type} />
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">
                        {c.control_type === "client_supplied"
                          ? c.accession?.accession_id ?? "—"
                          : c.inhouse?.library_id ?? "—"}
                      </td>
                      <td className="px-4 py-2"><StatusBadge status={c.role} /></td>
                      <td className="px-4 py-2 text-muted-foreground text-xs">{c.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Optimization Runs */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Optimization Runs ({assay.runs.length})</h3>
          {assay.runs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
              No runs logged yet. Add the first optimization run above.
            </div>
          ) : (
            <div className="space-y-3">
              {assay.runs.map((run) => {
                const isWinningRun = assay.locked_run_id === run.id;
                return (
                  <div
                    key={run.id}
                    className={`rounded-lg border p-4 ${
                      isWinningRun
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border/60 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Run {run.run_number}</span>
                        {isWinningRun && <span className="text-xs bg-emerald-500/10 text-emerald-600 rounded px-1.5 py-0.5 font-medium">✓ Locked Protocol</span>}
                        <StatusBadge status={run.outcome} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {run.run_date ? new Date(run.run_date).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {[
                        ["Ab Dilution", run.ab_dilution],
                        ["Antigen Retrieval", run.antigen_retrieval],
                        ["Secondary System", run.secondary_system],
                        ["Incubation Time", run.incubation_time_min ? `${run.incubation_time_min} min` : null],
                        ["Incubation Temp", run.incubation_temp],
                        ["Blocking", run.blocking_conditions],
                      ].map(([label, value]) => (
                        <div key={label as string}>
                          <p className="text-muted-foreground">{label}</p>
                          <p className="font-medium mt-0.5">{value ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                    {run.notes && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40">{run.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LimsShell>
  );
}
