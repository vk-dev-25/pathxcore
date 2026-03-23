import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { StatusBadge } from "@/components/lims/status-badge";
import { PipelineProgress } from "@/components/lims/accessions/pipeline-progress";
import { SpecimensTable } from "@/components/lims/specimens/specimens-table";
import { CreateSpecimenDialog } from "@/components/lims/specimens/create-specimen-dialog";
import { getAccession, getSpecimens, getAccessions, getTissueAbbreviations } from "@/lib/lims/queries";

export default async function AccessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [accession, specimens, allAccessions, tissues] = await Promise.all([
    getAccession(supabase, id),
    getSpecimens(supabase, { accessionId: id }),
    getAccessions(supabase),
    getTissueAbbreviations(supabase),
  ]);

  if (!accession) notFound();

  return (
    <LimsShell>
      <div className="p-6 space-y-6">
        <div>
          <Link href="/pathx/lims/accessions" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="h-4 w-4" />Accessions
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold">{accession.accession_id}</span>
                {accession.is_control && <StatusBadge status="CTRL" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <Link href={`/pathx/lims/projects/${accession.project_id}`} className="hover:text-foreground">
                  {accession.project?.project_id}
                </Link>
                {accession.received_by && ` · Received by: ${accession.received_by}`}
                {` · ${new Date(accession.received_date).toLocaleDateString()}`}
              </p>
            </div>
            <StatusBadge status={accession.status} />
          </div>
        </div>

        {/* Pipeline */}
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3">Pipeline Status</p>
          <PipelineProgress status={accession.status} />
        </div>

        {/* Specimens */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Specimens ({specimens.length})</h2>
            <CreateSpecimenDialog
              accessions={allAccessions}
              tissueAbbreviations={tissues}
              preselectedAccessionId={id}
            />
          </div>
          <SpecimensTable specimens={specimens} />
        </div>

        {accession.notes && (
          <div className="rounded-lg border border-border/60 bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{accession.notes}</p>
          </div>
        )}
      </div>
    </LimsShell>
  );
}
