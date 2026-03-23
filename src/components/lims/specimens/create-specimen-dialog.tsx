"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSpecimenAction } from "@/lib/lims/actions";
import type { AccessionWithProject, TissueAbbreviation, SpecimenType } from "@/lib/lims/types";

interface Props {
  accessions: AccessionWithProject[];
  tissueAbbreviations: TissueAbbreviation[];
  preselectedAccessionId?: string;
}

export function CreateSpecimenDialog({ accessions, tissueAbbreviations, preselectedAccessionId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [specimenType, setSpecimenType] = useState<SpecimenType>("mouse_tissue");
  const [selectedAccessionId, setSelectedAccessionId] = useState(preselectedAccessionId ?? "");
  const [tissueAbbrev, setTissueAbbrev] = useState("");
  const [cellLine, setCellLine] = useState("");
  const [overexpressedMarker, setOverexpressedMarker] = useState("");
  const [isCellPellet, setIsCellPellet] = useState(false);
  const router = useRouter();

  const selectedAccession = accessions.find((a) => a.id === selectedAccessionId);

  // Preview specimen ID
  let previewId = "—";
  if (selectedAccession) {
    if (specimenType === "cell_pellet" && cellLine) {
      const lineKey = overexpressedMarker ? `${cellLine}.${overexpressedMarker}` : cellLine;
      previewId = `${selectedAccession.accession_id}-CP-${lineKey}-001`;
    } else if (tissueAbbrev) {
      previewId = `${selectedAccession.accession_id}-${tissueAbbrev.toUpperCase()}-001`;
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (!selectedAccession) { setError("Select an accession"); return; }

    startTransition(async () => {
      const base = {
        accession_id: selectedAccession.id,
        accession_db_id: selectedAccession.id,
        accession_id_str: selectedAccession.accession_id,
        specimen_type: specimenType,
        tissue_abbreviation: specimenType === "cell_pellet" ? "CP" : tissueAbbrev,
        status: "received",
        // Mouse
        mouse_id: (fd.get("mouse_id") as string) || null,
        strain: (fd.get("strain") as string) || null,
        sex: ((fd.get("sex") as string) || null) as "M" | "F" | "unknown" | null,
        collection_date: (fd.get("collection_date") as string) || null,
        day_post_treatment: fd.get("day_post_treatment") ? Number(fd.get("day_post_treatment")) : null,
        treatment_group: (fd.get("treatment_group") as string) || null,
        cohort: (fd.get("cohort") as string) || null,
        client_specimen_ids: null,
        // Human
        diagnosis: (fd.get("diagnosis") as string) || null,
        fixation_method: (fd.get("fixation_method") as string) || null,
        clinical_metadata: null,
        // Cell pellet
        cell_line: cellLine || null,
        passage_number: fd.get("passage_number") ? Number(fd.get("passage_number")) : null,
        treatment: (fd.get("cp_treatment") as string) || null,
        pellet_count: fd.get("pellet_count") ? Number(fd.get("pellet_count")) : null,
        overexpressed_marker: overexpressedMarker || null,
        parent_cell_line: (fd.get("parent_cell_line") as string) || null,
        notes: (fd.get("notes") as string) || null,
      };

      const result = await createSpecimenAction(base as Parameters<typeof createSpecimenAction>[0]);
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  const mouseTissues = tissueAbbreviations.filter((t) => t.abbreviation !== "CP");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />Add Specimen</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Specimen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Accession */}
          <div className="space-y-1.5">
            <Label>Accession *</Label>
            <Select value={selectedAccessionId} onValueChange={setSelectedAccessionId} required>
              <SelectTrigger><SelectValue placeholder="Select accession" /></SelectTrigger>
              <SelectContent>
                {accessions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.accession_id} — {a.project?.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specimen type */}
          <div className="space-y-1.5">
            <Label>Specimen Type *</Label>
            <div className="flex gap-2">
              {(["mouse_tissue", "human_tissue", "cell_pellet"] as SpecimenType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSpecimenType(t)}
                  className={`flex-1 py-1.5 rounded-md text-xs border transition-colors ${
                    specimenType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {t === "mouse_tissue" ? "Mouse Tissue" : t === "human_tissue" ? "Human Tissue" : "Cell Pellet"}
                </button>
              ))}
            </div>
          </div>

          {/* Tissue abbreviation (not cell pellet) */}
          {specimenType !== "cell_pellet" && (
            <div className="space-y-1.5">
              <Label>Tissue *</Label>
              <Select value={tissueAbbrev} onValueChange={setTissueAbbrev} required>
                <SelectTrigger><SelectValue placeholder="Select tissue" /></SelectTrigger>
                <SelectContent>
                  {mouseTissues.map((t) => (
                    <SelectItem key={t.id} value={t.abbreviation}>
                      {t.abbreviation} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mouse fields */}
          {specimenType === "mouse_tissue" && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mouse Metadata</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mouse_id">Mouse ID</Label>
                  <Input id="mouse_id" name="mouse_id" placeholder="M12" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="strain">Strain</Label>
                  <Input id="strain" name="strain" placeholder="C57BL/6" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sex</Label>
                  <Select name="sex">
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="collection_date">Collection Date</Label>
                  <Input id="collection_date" name="collection_date" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="day_post_treatment">Day Post-Treatment</Label>
                  <Input id="day_post_treatment" name="day_post_treatment" type="number" placeholder="14" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="treatment_group">Treatment Group</Label>
                  <Input id="treatment_group" name="treatment_group" placeholder="Vehicle, Drug A..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cohort">Cohort</Label>
                <Input id="cohort" name="cohort" placeholder="Cohort 1" />
              </div>
            </div>
          )}

          {/* Human tissue fields */}
          {specimenType === "human_tissue" && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Human Tissue Metadata</p>
              <div className="space-y-1.5">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input id="diagnosis" name="diagnosis" placeholder="Adenocarcinoma, NOS..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fixation_method">Fixation Method</Label>
                <Input id="fixation_method" name="fixation_method" placeholder="10% NBF, 24h" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="collection_date">Collection Date</Label>
                <Input id="collection_date" name="collection_date" type="date" />
              </div>
            </div>
          )}

          {/* Cell pellet fields */}
          {specimenType === "cell_pellet" && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cell Pellet Metadata</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cell_line_input">Cell Line *</Label>
                  <Input id="cell_line_input" value={cellLine} onChange={(e) => setCellLine(e.target.value)} placeholder="H1975, MCF7, 293T..." required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="passage_number">Passage #</Label>
                  <Input id="passage_number" name="passage_number" type="number" placeholder="12" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="overexpressed_marker_input">Overexpressed Marker (if applicable)</Label>
                <Input
                  id="overexpressed_marker_input"
                  value={overexpressedMarker}
                  onChange={(e) => setOverexpressedMarker(e.target.value)}
                  placeholder="HER2, EGFR, KRAS..."
                />
              </div>
              {overexpressedMarker && (
                <div className="space-y-1.5">
                  <Label htmlFor="parent_cell_line">Parent Cell Line</Label>
                  <Input id="parent_cell_line" name="parent_cell_line" placeholder="H1975" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pellet_count">Pellet Count</Label>
                  <Input id="pellet_count" name="pellet_count" type="number" placeholder="3" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="day_post_treatment">Day Post-Treatment</Label>
                  <Input id="day_post_treatment" name="day_post_treatment" type="number" placeholder="7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp_treatment">Treatment</Label>
                <Input id="cp_treatment" name="cp_treatment" placeholder="DMSO, Drug A 10μM..." />
              </div>
            </div>
          )}

          {/* ID Preview */}
          {previewId !== "—" && (
            <div className="rounded-md bg-muted/40 px-3 py-2 border border-border/40">
              <p className="text-xs text-muted-foreground mb-0.5">Generated Specimen ID</p>
              <p className="font-mono text-sm font-semibold">{previewId}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Add Specimen"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
