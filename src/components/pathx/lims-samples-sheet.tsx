"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Plus, Printer, Save, Trash2 } from "lucide-react";

import { LimsLinkedServicesCell } from "@/components/pathx/lims-linked-services-cell";
import type { LimsSampleLabelPayload } from "@/components/pathx/lims-sample-label-dialog";
import { LimsSampleSlidesDialog } from "@/components/pathx/lims-sample-slides-dialog";
import type { LimsSlideLabelPayload } from "@/components/pathx/lims-slide-label-dialog";
import { LimsKeyValueEditor } from "@/components/pathx/lims-key-value-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createLimsSampleAction } from "@/lib/lims/create-sample-action";
import { deleteLimsSampleAction } from "@/lib/lims/delete-sample-action";
import type { LimsProjectDetailPayload } from "@/lib/lims/get-lims-project-detail-action";
import {
  deleteLimsSampleMetadataAction,
  upsertLimsSampleMetadataAction,
} from "@/lib/lims/sample-metadata-actions";
import {
  formatLimsSpeciesLabel,
  LIMS_SPECIES_KINDS,
  type LimsSpeciesKind,
} from "@/lib/lims/types";
import { updateLimsSampleAction } from "@/lib/lims/update-sample-action";
import { cn } from "@/lib/utils";

import { pathxFieldClass as fieldClass } from "@/components/pathx/workspace-field-classes";

type SampleRow = LimsProjectDetailPayload["samples"][0];

type ExtendedSampleForm = {
  client_sample_id: string;
  species_kind: LimsSpeciesKind;
  tissue_type: string;
  organ_abbrev: string;
  date_received: string;
  date_of_dissection: string;
  instructions_notes: string;
};

function emptyDraftForm(): ExtendedSampleForm {
  return {
    client_sample_id: "",
    species_kind: "human",
    tissue_type: "",
    organ_abbrev: "",
    date_received: "",
    date_of_dissection: "",
    instructions_notes: "",
  };
}

function sampleToForm(s: SampleRow): ExtendedSampleForm {
  return {
    client_sample_id: s.client_sample_id ?? "",
    species_kind: s.species_kind,
    tissue_type: s.tissue_type,
    organ_abbrev: s.organ_abbrev ?? "",
    date_received: s.date_received ?? "",
    date_of_dissection: s.date_of_dissection ?? "",
    instructions_notes: s.instructions_notes ?? "",
  };
}

function validateOrganAbbrev(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (!/^[A-Z]{2,4}$/.test(t)) {
    return "Organ abbreviation must be 2–4 uppercase letters (A–Z).";
  }
  return null;
}

function dateReceivedForLabel(form: ExtendedSampleForm, sample: SampleRow): string | null {
  const fromForm = form.date_received.trim();
  if (fromForm) return fromForm;
  return sample.date_received;
}

const th =
  "sticky top-0 z-[1] whitespace-nowrap border-b border-r border-border bg-muted/95 px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm last:border-r-0 dark:border-white/[0.08] dark:bg-background/95";
const td =
  "border-b border-r border-border p-1.5 align-top last:border-r-0 dark:border-white/[0.06]";
const tdSticky =
  "sticky left-0 z-[1] border-b border-r border-border bg-background/95 p-1.5 align-top backdrop-blur-sm dark:border-white/[0.06]";

function SampleMetadataDialog({
  open,
  onOpenChange,
  projectId,
  sample,
  onRefresh,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  sample: SampleRow | null;
  onRefresh: () => void;
}) {
  if (!sample) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">
            Custom metadata · {sample.sample_reference}
          </DialogTitle>
        </DialogHeader>
        <LimsKeyValueEditor
          title="Fields"
          rows={sample.metadata.map((m) => ({
            id: m.id,
            key: m.key,
            value: m.value,
          }))}
          onSave={async (key, value) => {
            const res = await upsertLimsSampleMetadataAction({
              projectId,
              sampleId: sample.id,
              key,
              value,
            });
            if (res.ok) onRefresh();
            return res;
          }}
          onDelete={async (metadataId) => {
            const res = await deleteLimsSampleMetadataAction({
              projectId,
              sampleId: sample.id,
              metadataId,
            });
            if (res.ok) onRefresh();
            return res;
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function DraftSampleSheetRow({
  draftId,
  projectId,
  onRefresh,
  pending,
  start,
  onRemove,
}: {
  draftId: string;
  projectId: string;
  onRefresh: () => void;
  pending: boolean;
  start: (fn: () => void) => void;
  onRemove: (id: string) => void;
}) {
  const [form, setForm] = useState<ExtendedSampleForm>(emptyDraftForm);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const inp = cn("h-8 w-full min-w-[72px] text-xs", fieldClass);
  const txt = cn("min-h-[56px] w-full min-w-[100px] resize-y text-xs", fieldClass);

  function saveNewSample() {
    setSaveErr(null);
    if (!form.tissue_type.trim()) {
      setSaveErr("Tissue type is required to assign a sample ID.");
      return;
    }
    const ab = form.organ_abbrev.trim().toUpperCase();
    if (form.organ_abbrev.trim()) {
      const v = validateOrganAbbrev(ab);
      if (v) {
        setSaveErr(v);
        return;
      }
    }
    start(async () => {
      const res = await createLimsSampleAction({
        projectId,
        client_sample_id: form.client_sample_id || undefined,
        species_kind: form.species_kind,
        tissue_type: form.tissue_type,
        organ_abbrev: form.organ_abbrev.trim() ? ab : undefined,
        date_received: form.date_received || undefined,
        date_of_dissection: form.date_of_dissection || undefined,
        instructions_notes: form.instructions_notes || undefined,
      });
      if (!res.ok) setSaveErr(res.error);
      else {
        onRemove(draftId);
        onRefresh();
      }
    });
  }

  return (
    <tr className="bg-muted/20 dark:bg-white/[0.02]">
      <td className={cn(tdSticky, "min-w-[128px]")}>
        <span className="block text-[11px] font-medium leading-tight text-muted-foreground">
          —
        </span>
        <span className="mt-0.5 block text-[10px] text-muted-foreground">
          Save assigns ID
        </span>
      </td>
      <td className={td}>
        <Input
          className={inp}
          value={form.client_sample_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, client_sample_id: e.target.value }))
          }
        />
      </td>
      <td className={td}>
        <select
          className={cn(inp, "px-2")}
          value={form.species_kind}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              species_kind: e.target.value as LimsSpeciesKind,
            }))
          }
        >
          {LIMS_SPECIES_KINDS.map((k) => (
            <option key={k} value={k}>
              {formatLimsSpeciesLabel(k)}
            </option>
          ))}
        </select>
      </td>
      <td className={td}>
        <Input
          className={inp}
          value={form.tissue_type}
          onChange={(e) => setForm((f) => ({ ...f, tissue_type: e.target.value }))}
          placeholder="Required"
        />
      </td>
      <td className={td}>
        <Input
          className={inp}
          value={form.organ_abbrev}
          onChange={(e) =>
            setForm((f) => ({ ...f, organ_abbrev: e.target.value.toUpperCase() }))
          }
          placeholder="e.g. LG"
        />
      </td>
      <td className={td}>
        <Input
          type="date"
          className={inp}
          value={form.date_received}
          onChange={(e) =>
            setForm((f) => ({ ...f, date_received: e.target.value }))
          }
        />
      </td>
      <td className={td}>
        <Input
          type="date"
          className={inp}
          value={form.date_of_dissection}
          onChange={(e) =>
            setForm((f) => ({ ...f, date_of_dissection: e.target.value }))
          }
        />
      </td>
      <td className={td}>
        <textarea
          className={txt}
          value={form.instructions_notes}
          onChange={(e) =>
            setForm((f) => ({ ...f, instructions_notes: e.target.value }))
          }
        />
      </td>
      <td className={td}>
        <p className="text-[10px] text-muted-foreground">After save</p>
      </td>
      <td className={td}>
        <p className="text-[10px] text-muted-foreground">After save</p>
      </td>
      <td className={td}>
        <p className="text-[10px] text-muted-foreground">After save</p>
      </td>
      <td className={td}>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            size="sm"
            className="inline-flex h-8 items-center gap-1 text-xs"
            disabled={pending}
            onClick={saveNewSample}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
          {saveErr ? (
            <p className="max-w-[140px] text-[10px] text-destructive">{saveErr}</p>
          ) : null}
        </div>
      </td>
      <td className={td}>
        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" disabled>
          Print
        </Button>
      </td>
      <td className={td}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-destructive/40 text-xs text-destructive hover:bg-destructive/10"
          disabled={pending}
          onClick={() => onRemove(draftId)}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Remove
        </Button>
      </td>
    </tr>
  );
}

function SampleSheetRow({
  projectId,
  projectReference,
  projectTitle,
  sample,
  catalog,
  catalogLoading,
  onRefresh,
  pending,
  start,
  onOpenSampleLabel,
  onOpenSlides,
  onOpenMetadata,
}: {
  projectId: string;
  projectReference: string;
  projectTitle: string;
  sample: SampleRow;
  catalog: LimsProjectDetailPayload["catalog"];
  catalogLoading: boolean;
  onRefresh: () => void;
  pending: boolean;
  start: (fn: () => void) => void;
  onOpenSampleLabel: (p: LimsSampleLabelPayload) => void;
  onOpenSlides: () => void;
  onOpenMetadata: () => void;
}) {
  const [form, setForm] = useState<ExtendedSampleForm>(() => sampleToForm(sample));
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    setForm(sampleToForm(sample));
  }, [sample]);

  function saveSample() {
    setSaveErr(null);
    if (!form.tissue_type.trim()) {
      setSaveErr("Tissue type is required.");
      return;
    }
    const ab = form.organ_abbrev.trim().toUpperCase();
    if (form.organ_abbrev.trim()) {
      const v = validateOrganAbbrev(ab);
      if (v) {
        setSaveErr(v);
        return;
      }
    }
    start(async () => {
      const res = await updateLimsSampleAction({
        projectId,
        sampleId: sample.id,
        name: sample.name,
        client_sample_id: form.client_sample_id || undefined,
        species_kind: form.species_kind,
        tissue_type: form.tissue_type,
        organ_abbrev: form.organ_abbrev.trim() ? ab : undefined,
        diagnostic: sample.diagnostic ?? undefined,
        date_received: form.date_received || undefined,
        date_of_dissection: form.date_of_dissection || undefined,
        dob: sample.dob ?? undefined,
        special_care_instructions: sample.special_care_instructions ?? undefined,
        services_notes: sample.services_notes ?? undefined,
        instructions_notes: form.instructions_notes || undefined,
      });
      if (!res.ok) setSaveErr(res.error);
      else onRefresh();
    });
  }

  const inp = cn("h-8 w-full min-w-[72px] text-xs", fieldClass);
  const txt = cn("min-h-[56px] w-full min-w-[100px] resize-y text-xs", fieldClass);

  const labelDate = dateReceivedForLabel(form, sample);

  return (
    <tr>
      <td className={cn(tdSticky, "min-w-[128px]")}>
        <span className="block font-mono text-[11px] font-medium leading-tight">
          {sample.sample_reference}
        </span>
      </td>
      <td className={td}>
        <Input
          className={inp}
          value={form.client_sample_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, client_sample_id: e.target.value }))
          }
        />
      </td>
      <td className={td}>
        <select
          className={cn(inp, "px-2")}
          value={form.species_kind}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              species_kind: e.target.value as LimsSpeciesKind,
            }))
          }
        >
          {LIMS_SPECIES_KINDS.map((k) => (
            <option key={k} value={k}>
              {formatLimsSpeciesLabel(k)}
            </option>
          ))}
        </select>
      </td>
      <td className={td}>
        <Input
          className={inp}
          value={form.tissue_type}
          onChange={(e) => setForm((f) => ({ ...f, tissue_type: e.target.value }))}
          placeholder="Required"
        />
      </td>
      <td className={td}>
        <Input
          className={inp}
          value={form.organ_abbrev}
          onChange={(e) =>
            setForm((f) => ({ ...f, organ_abbrev: e.target.value.toUpperCase() }))
          }
          placeholder="e.g. LG"
        />
      </td>
      <td className={td}>
        <Input
          type="date"
          className={inp}
          value={form.date_received}
          onChange={(e) =>
            setForm((f) => ({ ...f, date_received: e.target.value }))
          }
        />
      </td>
      <td className={td}>
        <Input
          type="date"
          className={inp}
          value={form.date_of_dissection}
          onChange={(e) =>
            setForm((f) => ({ ...f, date_of_dissection: e.target.value }))
          }
        />
      </td>
      <td className={td}>
        <textarea
          className={txt}
          value={form.instructions_notes}
          onChange={(e) =>
            setForm((f) => ({ ...f, instructions_notes: e.target.value }))
          }
        />
      </td>
      <td className={td}>
        <LimsLinkedServicesCell
          projectId={projectId}
          sampleId={sample.id}
          lines={sample.service_lines}
          catalog={catalog}
          catalogLoading={catalogLoading}
          onRefresh={onRefresh}
        />
      </td>
      <td className={td}>
        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={onOpenMetadata}>
          Metadata ({sample.metadata.length})
        </Button>
      </td>
      <td className={td}>
        <Button type="button" size="sm" variant="secondary" className="h-8 text-xs" onClick={onOpenSlides}>
          Slides ({sample.slides.length})
        </Button>
      </td>
      <td className={td}>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            size="sm"
            className="inline-flex h-8 items-center gap-1 text-xs"
            disabled={pending}
            onClick={saveSample}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
          {saveErr ? (
            <p className="max-w-[140px] text-[10px] text-destructive">{saveErr}</p>
          ) : null}
        </div>
      </td>
      <td className={td}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() =>
            onOpenSampleLabel({
              sampleReference: sample.sample_reference,
              clientSampleId: sample.client_sample_id,
              projectReference,
              projectTitle,
              specimenName:
                sample.tissue_type.trim() || sample.sample_reference,
              tissueType: sample.tissue_type,
              organAbbrev: sample.organ_abbrev,
              species_kind: sample.species_kind,
              dateReceived: labelDate,
            })
          }
        >
          <Printer className="mr-1 h-3.5 w-3.5" />
          Print
        </Button>
      </td>
      <td className={td}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-destructive/40 text-xs text-destructive hover:bg-destructive/10"
          disabled={pending}
          onClick={() => {
            const ok = window.confirm(
              `Delete sample ${sample.sample_reference}? This removes all slides and related data.`,
            );
            if (!ok) return;
            start(async () => {
              const res = await deleteLimsSampleAction({
                projectId,
                sampleId: sample.id,
              });
              if (!res.ok) setSaveErr(res.error);
              else onRefresh();
            });
          }}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Delete
        </Button>
      </td>
    </tr>
  );
}

export function LimsSamplesSheet({
  projectId,
  projectReference,
  projectTitle,
  samples,
  totalSampleCount,
  catalog,
  catalogLoading,
  onRefresh,
  onOpenSampleLabel,
  onOpenSlideLabel,
  onPrintAllSlideLabels,
}: {
  projectId: string;
  projectReference: string;
  projectTitle: string;
  samples: SampleRow[];
  /** Unfiltered count (for empty state when search hides all rows). */
  totalSampleCount: number;
  catalog: LimsProjectDetailPayload["catalog"];
  catalogLoading: boolean;
  onRefresh: () => void;
  onOpenSampleLabel: (p: LimsSampleLabelPayload) => void;
  onOpenSlideLabel: (p: LimsSlideLabelPayload) => void;
  onPrintAllSlideLabels: (payloads: LimsSlideLabelPayload[]) => void;
}) {
  const [pending, start] = useTransition();
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [slidesFor, setSlidesFor] = useState<SampleRow | null>(null);
  const [metadataFor, setMetadataFor] = useState<SampleRow | null>(null);

  function addDraftRow() {
    setDraftIds((ids) => [...ids, crypto.randomUUID()]);
  }

  function removeDraftRow(id: string) {
    setDraftIds((ids) => ids.filter((x) => x !== id));
  }

  const slidesSample =
    slidesFor && samples.some((s) => s.id === slidesFor.id)
      ? (samples.find((s) => s.id === slidesFor.id) ?? slidesFor)
      : slidesFor;

  const metadataSample =
    metadataFor && samples.some((s) => s.id === metadataFor.id)
      ? samples.find((s) => s.id === metadataFor.id) ?? metadataFor
      : metadataFor;

  const tableEmpty = samples.length === 0 && draftIds.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">+ Add sample</span> adds a row without an ID. Enter{" "}
          <span className="font-medium text-foreground">tissue</span> (and optional organ abbrev override), then{" "}
          <span className="font-medium text-foreground">Save</span> to create{" "}
          <span className="font-mono text-xs">PRJ…-LG-01</span>-style IDs.
        </p>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={addDraftRow}>
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add sample
        </Button>
      </div>

      {tableEmpty ? (
        <p className="text-sm text-muted-foreground">
          {totalSampleCount > 0
            ? "No samples match the current search."
            : "No samples yet. Use Add sample."}
        </p>
      ) : (
        <div className="overflow-auto rounded-lg border border-border dark:border-white/[0.08]">
          <table className="w-max min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className={cn(th, "sticky left-0 z-[2] min-w-[128px]")}>Sample ID</th>
                <th className={th}>Client sample ID</th>
                <th className={th}>Species</th>
                <th className={th}>Tissue</th>
                <th className={th}>Organ abbrev override</th>
                <th className={th}>Date received</th>
                <th className={th}>Date of dissection</th>
                <th className={th}>Instructions</th>
                <th className={th}>Catalog services</th>
                <th className={th}>Custom metadata</th>
                <th className={th}>Slides</th>
                <th className={th}>Save</th>
                <th className={th}>Print</th>
                <th className={th}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {draftIds.map((draftId) => (
                <DraftSampleSheetRow
                  key={draftId}
                  draftId={draftId}
                  projectId={projectId}
                  onRefresh={onRefresh}
                  pending={pending}
                  start={start}
                  onRemove={removeDraftRow}
                />
              ))}
              {samples.map((sample) => (
                <SampleSheetRow
                  key={sample.id}
                  projectId={projectId}
                  projectReference={projectReference}
                  projectTitle={projectTitle}
                  sample={sample}
                  catalog={catalog}
                  catalogLoading={catalogLoading}
                  onRefresh={onRefresh}
                  pending={pending}
                  start={start}
                  onOpenSampleLabel={onOpenSampleLabel}
                  onOpenSlides={() => setSlidesFor(sample)}
                  onOpenMetadata={() => setMetadataFor(sample)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {slidesSample ? (
        <LimsSampleSlidesDialog
          open
          onOpenChange={(o) => {
            if (!o) setSlidesFor(null);
          }}
          projectId={projectId}
          sampleReference={slidesSample.sample_reference}
          sample={slidesSample}
          onRefresh={onRefresh}
          onOpenLabel={onOpenSlideLabel}
          onPrintAllLabels={(payloads) => {
            setSlidesFor(null);
            onPrintAllSlideLabels(payloads);
          }}
        />
      ) : null}

      <SampleMetadataDialog
        open={!!metadataSample}
        onOpenChange={(o) => {
          if (!o) setMetadataFor(null);
        }}
        projectId={projectId}
        sample={metadataSample}
        onRefresh={onRefresh}
      />
    </div>
  );
}
