import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { StatusBadge } from "@/components/lims/status-badge";
import { AccessionsTable } from "@/components/lims/accessions/accessions-table";
import { CreateAccessionDialog } from "@/components/lims/accessions/create-accession-dialog";
import { getProject, getAccessions } from "@/lib/lims/queries";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [project, accessions] = await Promise.all([
    getProject(supabase, id),
    getAccessions(supabase, { projectId: id }),
  ]);

  if (!project) notFound();

  return (
    <LimsShell>
      <div className="p-6 space-y-6">
        <div>
          <Link href="/pathx/lims/projects" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="h-4 w-4" />Projects
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">{project.project_id}</span>
                <StatusBadge status={project.project_type} />
                <StatusBadge status={project.status} />
              </div>
              <h1 className="mt-1 text-xl font-semibold">{project.title}</h1>
              <p className="text-sm text-muted-foreground">
                {project.client.name} ({project.client.code})
                {project.pi_name && ` · PI: ${project.pi_name}`}
                {project.study_type && ` · ${project.study_type}`}
              </p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            ["Species", project.species?.join(", ") || "—"],
            ["Start Date", project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"],
            ["End Date", project.end_date ? new Date(project.end_date).toLocaleDateString() : "—"],
            ["PO Reference", project.po_reference ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {project.notes && (
          <div className="rounded-lg border border-border/60 bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Notes / Objectives</p>
            <p className="text-sm">{project.notes}</p>
          </div>
        )}

        {/* Accessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Accessions ({accessions.length})</h2>
            <CreateAccessionDialog projects={accessions.length > 0 ? [{ ...project, client: project.client } as import("@/lib/lims/types").ProjectWithClient] : [{ ...project, client: project.client } as import("@/lib/lims/types").ProjectWithClient]} />
          </div>
          <AccessionsTable accessions={accessions} />
        </div>
      </div>
    </LimsShell>
  );
}
