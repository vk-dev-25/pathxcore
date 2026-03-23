import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { StatusBadge } from "@/components/lims/status-badge";
import { SlidesTable } from "@/components/lims/slides/slides-table";
import { CreateSlideDialog } from "@/components/lims/slides/create-slide-dialog";
import { getSpecimen, getSpecimens } from "@/lib/lims/queries";

export default async function SpecimenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [specimen, allSpecimens] = await Promise.all([
    getSpecimen(supabase, id),
    getSpecimens(supabase),
  ]);

  if (!specimen) notFound();

  // Build slides with specimen info for SlidesTable
  const slidesWithSpecimen = specimen.slides.map((s) => ({
    ...s,
    specimen: { specimen_id: specimen.specimen_id, tissue_abbreviation: specimen.tissue_abbreviation },
  }));

  return (
    <LimsShell>
      <div className="p-6 space-y-6">
        <div>
          <Link href="/pathx/lims/specimens" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="h-4 w-4" />Specimens
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-lg font-bold">{specimen.specimen_id}</span>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={specimen.specimen_type} />
                <StatusBadge status={specimen.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Metadata</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {specimen.specimen_type === "mouse_tissue" && (
              <>
                {[
                  ["Mouse ID", specimen.mouse_id],
                  ["Strain", specimen.strain],
                  ["Sex", specimen.sex],
                  ["Collection Date", specimen.collection_date ? new Date(specimen.collection_date).toLocaleDateString() : null],
                  ["Day Post-Treatment", specimen.day_post_treatment != null ? `D${specimen.day_post_treatment}` : null],
                  ["Treatment Group", specimen.treatment_group],
                  ["Cohort", specimen.cohort],
                  ["Tissue", specimen.tissue_abbreviation],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium mt-0.5">{value ?? "—"}</p>
                  </div>
                ))}
              </>
            )}
            {specimen.specimen_type === "human_tissue" && (
              <>
                {[
                  ["Diagnosis", specimen.diagnosis],
                  ["Fixation Method", specimen.fixation_method],
                  ["Collection Date", specimen.collection_date ? new Date(specimen.collection_date).toLocaleDateString() : null],
                  ["Tissue", specimen.tissue_abbreviation],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium mt-0.5">{value ?? "—"}</p>
                  </div>
                ))}
              </>
            )}
            {specimen.specimen_type === "cell_pellet" && (
              <>
                {[
                  ["Cell Line", specimen.cell_line],
                  ["Passage #", specimen.passage_number],
                  ["Overexpressed Marker", specimen.overexpressed_marker],
                  ["Parent Cell Line", specimen.parent_cell_line],
                  ["Pellet Count", specimen.pellet_count],
                  ["Treatment", specimen.treatment],
                  ["Day Post-Treatment", specimen.day_post_treatment != null ? `D${specimen.day_post_treatment}` : null],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium mt-0.5">{value != null ? String(value) : "—"}</p>
                  </div>
                ))}
              </>
            )}
          </div>
          {specimen.notes && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm mt-0.5">{specimen.notes}</p>
            </div>
          )}
        </div>

        {/* Block info */}
        {specimen.blocks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">FFPE Block</h3>
            {specimen.blocks.map((b) => (
              <div key={b.id} className="rounded-lg border border-border/60 bg-card p-4 text-sm grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Block ID</p>
                  <p className="font-mono font-semibold mt-0.5">{b.block_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blocked Date</p>
                  <p className="font-medium mt-0.5">{b.blocked_date ? new Date(b.blocked_date).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cassette Label</p>
                  <p className="font-medium mt-0.5">{b.cassette_label_type ?? "—"}</p>
                </div>
                {b.orientation_note && (
                  <div className="col-span-3">
                    <p className="text-xs text-muted-foreground">Orientation</p>
                    <p className="mt-0.5">{b.orientation_note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Slides */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Slides ({specimen.slides.length})</h3>
            <CreateSlideDialog specimens={allSpecimens} preselectedSpecimenId={id} />
          </div>
          <SlidesTable slides={slidesWithSpecimen} />
        </div>
      </div>
    </LimsShell>
  );
}
