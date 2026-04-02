"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Printer,
  Save,
  Search,
} from "lucide-react";

import { LimsEditableSection } from "@/components/pathx/lims-editable-section";
import { LimsKeyValueEditor } from "@/components/pathx/lims-key-value-editor";
import { LimsSampleServiceLines } from "@/components/pathx/lims-sample-service-lines";
import { LimsProjectPrintDialog } from "@/components/pathx/lims-project-print-dialog";
import {
  LimsSampleLabelDialog,
  type LimsSampleLabelPayload,
} from "@/components/pathx/lims-sample-label-dialog";
import {
  LimsSlideLabelDialog,
  type LimsSlideLabelPayload,
} from "@/components/pathx/lims-slide-label-dialog";
import { LimsStepsList } from "@/components/pathx/lims-steps-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { createLimsSampleAction } from "@/lib/lims/create-sample-action";
import { createLimsSlidesBulkAction } from "@/lib/lims/create-slides-bulk-action";
import type {
  LimsCatalogServiceOption,
  LimsProjectDetailPayload,
} from "@/lib/lims/get-lims-project-detail-action";
import {
  deleteLimsSampleMetadataAction,
  upsertLimsSampleMetadataAction,
} from "@/lib/lims/sample-metadata-actions";
import {
  addLimsSampleStepAction,
  deleteLimsSampleStepAction,
  setLimsSampleStepCompletedAction,
} from "@/lib/lims/sample-steps-actions";
import {
  deleteLimsSlideMetadataAction,
  upsertLimsSlideMetadataAction,
} from "@/lib/lims/slide-metadata-actions";
import {
  addLimsSlideStepAction,
  deleteLimsSlideStepAction,
  setLimsSlideStepCompletedAction,
} from "@/lib/lims/slide-steps-actions";
import {
  canTransitionProjectStatus,
  formatLimsProjectStatusLabel,
  formatLimsSpeciesLabel,
  LIMS_SPECIES_KINDS,
  type LimsProjectStatus,
  type LimsSpeciesKind,
} from "@/lib/lims/types";
import { updateLimsProjectAction } from "@/lib/lims/update-project-action";
import { updateLimsSampleAction } from "@/lib/lims/update-sample-action";
import { updateLimsSlideNotesAction } from "@/lib/lims/update-slide-notes-action";
import { cn } from "@/lib/utils";

import {
  pathxCardClass as cardClass,
  pathxFieldClass as fieldClass,
} from "@/components/pathx/workspace-field-classes";

const PROJECT_STATUSES: LimsProjectStatus[] = [
  "created",
  "started",
  "blocked",
  "shipped",
  "completed",
  "cancelled",
];

function statusBadge(s: LimsProjectStatus): string {
  if (s === "completed") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (s === "cancelled") return "bg-muted text-muted-foreground";
  if (s === "blocked") return "bg-destructive/15 text-destructive";
  if (s === "shipped") return "bg-primary/15 text-primary";
  if (s === "started") return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-muted/80 text-muted-foreground dark:bg-white/[0.06]";
}

function validateOrganAbbrev(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (!/^[A-Z]{2,4}$/.test(t)) {
    return "Organ abbreviation must be 2–4 uppercase letters (A–Z).";
  }
  return null;
}

type SampleForm = {
  name: string;
  client_sample_id: string;
  species_kind: LimsSpeciesKind;
  tissue_type: string;
  organ_abbrev: string;
  diagnostic: string;
  date_received: string;
  date_of_dissection: string;
  dob: string;
  special_care_instructions: string;
  services_notes: string;
  instructions_notes: string;
};

function emptySampleForm(): SampleForm {
  return {
    name: "",
    client_sample_id: "",
    species_kind: "human",
    tissue_type: "",
    organ_abbrev: "",
    diagnostic: "",
    date_received: "",
    date_of_dissection: "",
    dob: "",
    special_care_instructions: "",
    services_notes: "",
    instructions_notes: "",
  };
}

function sampleSearchHaystack(
  projectRef: string,
  projectId: string,
  sample: LimsProjectDetailPayload["samples"][0],
): string {
  return [
    projectRef,
    projectId,
    sample.sample_reference,
    sample.name,
    sample.client_sample_id ?? "",
    sample.services_notes ?? "",
    ...sample.service_lines.map((l) => l.label),
  ]
    .join(" ")
    .toLowerCase();
}

function sampleBodyOnlyHaystack(
  sample: LimsProjectDetailPayload["samples"][0],
): string {
  return [
    sample.sample_reference,
    sample.name,
    sample.client_sample_id ?? "",
    sample.services_notes ?? "",
    ...sample.service_lines.map((l) => l.label),
  ]
    .join(" ")
    .toLowerCase();
}

function normalizeDetailQuery(q: string) {
  return q.trim().toLowerCase();
}

function detailProjectMatchesQuery(
  projectRef: string,
  projectId: string,
  q: string,
): boolean {
  if (!q) return false;
  return (
    projectRef.toLowerCase().includes(q) ||
    projectId.toLowerCase().includes(q)
  );
}

function detailSampleMatchesQuery(
  projectRef: string,
  projectId: string,
  sample: LimsProjectDetailPayload["samples"][0],
  q: string,
): boolean {
  if (!q) return true;
  if (detailProjectMatchesQuery(projectRef, projectId, q)) return true;
  const hay = sampleSearchHaystack(projectRef, projectId, sample);
  if (hay.includes(q)) return true;
  return sample.slides.some((sl) =>
    sl.slide_reference.toLowerCase().includes(q),
  );
}

function filterSlidesForDetailQuery(
  sample: LimsProjectDetailPayload["samples"][0],
  projectRef: string,
  projectId: string,
  q: string,
): LimsProjectDetailPayload["samples"][0]["slides"] {
  if (!q) return sample.slides;
  if (detailProjectMatchesQuery(projectRef, projectId, q)) return sample.slides;
  const sampleOnly = sampleBodyOnlyHaystack(sample);
  if (sampleOnly.includes(q)) return sample.slides;
  return sample.slides.filter((sl) =>
    sl.slide_reference.toLowerCase().includes(q),
  );
}

function sampleToForm(s: LimsProjectDetailPayload["samples"][0]): SampleForm {
  return {
    name: s.name,
    client_sample_id: s.client_sample_id ?? "",
    species_kind: s.species_kind,
    tissue_type: s.tissue_type,
    organ_abbrev: s.organ_abbrev ?? "",
    diagnostic: s.diagnostic ?? "",
    date_received: s.date_received ?? "",
    date_of_dissection: s.date_of_dissection ?? "",
    dob: s.dob ?? "",
    special_care_instructions: s.special_care_instructions ?? "",
    services_notes: s.services_notes ?? "",
    instructions_notes: s.instructions_notes ?? "",
  };
}

export function LimsProjectDetailClient({
  initial,
}: {
  initial: LimsProjectDetailPayload;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [procedures, setProcedures] = useState(initial.procedures);
  const [details, setDetails] = useState(initial.details);
  const [status, setStatus] = useState<LimsProjectStatus>(initial.status);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<SampleForm>(emptySampleForm());
  const [addErr, setAddErr] = useState<string | null>(null);

  const [labelOpen, setLabelOpen] = useState(false);
  const [labelPayload, setLabelPayload] = useState<LimsSlideLabelPayload | null>(
    null,
  );

  const [printOpen, setPrintOpen] = useState(false);

  const [sampleLabelOpen, setSampleLabelOpen] = useState(false);
  const [sampleLabelPayload, setSampleLabelPayload] =
    useState<LimsSampleLabelPayload | null>(null);

  const [detailSearch, setDetailSearch] = useState("");

  const [browserCatalog, setBrowserCatalog] = useState<
    LimsCatalogServiceOption[] | null
  >(null);
  const [browserCatalogErr, setBrowserCatalogErr] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    createBrowserSupabase()
      .from("quote_catalog_services")
      .select("id, name, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setBrowserCatalogErr(error.message);
          setBrowserCatalog([]);
          return;
        }
        const rows = (data ?? [])
          .map((r) => ({
            id: r.id as string,
            name: (r.name as string)?.trim() || "Unnamed service",
          }))
          .filter((r) => r.id);
        setBrowserCatalog(rows);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveCatalog = useMemo(() => {
    if (browserCatalog !== null) {
      if (browserCatalog.length > 0) return browserCatalog;
      if (initial.catalog.length > 0) return initial.catalog;
      return browserCatalog;
    }
    return initial.catalog;
  }, [browserCatalog, initial.catalog]);

  const catalogLoading = browserCatalog === null;

  const detailQuery = normalizeDetailQuery(detailSearch);

  const filteredSamples = useMemo(() => {
    return initial.samples
      .filter((s) =>
        detailSampleMatchesQuery(
          initial.project_reference,
          initial.id,
          s,
          detailQuery,
        ),
      )
      .map((s) => ({
        ...s,
        slides: filterSlidesForDetailQuery(
          s,
          initial.project_reference,
          initial.id,
          detailQuery,
        ),
      }));
  }, [
    initial.samples,
    initial.project_reference,
    initial.id,
    detailQuery,
  ]);

  const printPayload = useMemo(
    (): LimsProjectDetailPayload => ({
      ...initial,
      procedures,
      details,
      status,
    }),
    [initial, procedures, details, status],
  );

  useEffect(() => {
    setProcedures(initial.procedures);
    setDetails(initial.details);
    setStatus(initial.status);
  }, [initial.procedures, initial.details, initial.status, initial.updated_at]);

  const allowedStatuses = useMemo(() => {
    const from = initial.status;
    return PROJECT_STATUSES.filter(
      (s) => s === from || canTransitionProjectStatus(from, s),
    );
  }, [initial.status]);

  function refresh() {
    router.refresh();
  }

  function saveProject() {
    setProjectError(null);
    start(async () => {
      const res = await updateLimsProjectAction({
        projectId: initial.id,
        procedures,
        details,
        status,
      });
      if (!res.ok) setProjectError(res.error);
      else refresh();
    });
  }

  function addSample() {
    setAddErr(null);
    const ab = addForm.organ_abbrev.trim().toUpperCase();
    if (addForm.organ_abbrev.trim()) {
      const v = validateOrganAbbrev(ab);
      if (v) {
        setAddErr(v);
        return;
      }
    }
    if (!addForm.name.trim() || !addForm.tissue_type.trim()) {
      setAddErr("Sample name and tissue type are required.");
      return;
    }
    start(async () => {
      const res = await createLimsSampleAction({
        projectId: initial.id,
        name: addForm.name,
        client_sample_id: addForm.client_sample_id || undefined,
        species_kind: addForm.species_kind,
        tissue_type: addForm.tissue_type,
        organ_abbrev: addForm.organ_abbrev.trim() ? ab : undefined,
        diagnostic: addForm.diagnostic || undefined,
        date_received: addForm.date_received || undefined,
        date_of_dissection: addForm.date_of_dissection || undefined,
        dob: addForm.dob || undefined,
        special_care_instructions: addForm.special_care_instructions || undefined,
        services_notes: addForm.services_notes || undefined,
        instructions_notes: addForm.instructions_notes || undefined,
      });
      if (!res.ok) setAddErr(res.error);
      else {
        setAddForm(emptySampleForm());
        setAddOpen(false);
        refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8 px-2 text-muted-foreground">
            <Link href="/pathx/lims/projects">← Projects</Link>
          </Button>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            {initial.project_reference}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {initial.client_org_name}
            {initial.project_title ? ` · ${initial.project_title}` : null}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPrintOpen(true)}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / PDF
          </Button>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusBadge(initial.status),
            )}
          >
            {formatLimsProjectStatusLabel(initial.status)}
          </span>
          {initial.source_quote_id ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/pathx/quotes?quoteId=${encodeURIComponent(initial.source_quote_id)}`}
              >
                Source quote
                {initial.source_quote_reference
                  ? ` (${initial.source_quote_reference})`
                  : ""}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {initial.catalog_load_error ? (
        <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Could not load service catalog (server): {initial.catalog_load_error}
        </p>
      ) : null}
      {browserCatalogErr && effectiveCatalog.length === 0 ? (
        <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Could not load service catalog (browser): {browserCatalogErr}
        </p>
      ) : null}
      {!catalogLoading &&
      effectiveCatalog.length === 0 &&
      !initial.catalog_load_error &&
      !browserCatalogErr ? (
        <p className="mb-4 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
          No rows in <span className="font-mono">quote_catalog_services</span>. Add services under{" "}
          <Link href="/pathx/admin/pricing" className="text-primary underline">
            Admin → Pricing
          </Link>{" "}
          to pick them on samples.
        </p>
      ) : null}

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-lg">Project</CardTitle>
          <CardDescription>
            Procedures, lab details, and workflow status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LimsEditableSection
            title="Status"
            description="Workflow state for this project."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <select
                  className={cn(
                    "flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    fieldClass,
                  )}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LimsProjectStatus)}
                >
                  {allowedStatuses.map((s) => (
                    <option key={s} value={s}>
                      {formatLimsProjectStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </LimsEditableSection>
          <LimsEditableSection
            title="Procedures"
            description="Lab procedures and processing notes."
          >
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Procedures</Label>
              <textarea
                className={cn(
                  "min-h-[100px] w-full rounded-md border px-3 py-2 text-sm",
                  fieldClass,
                )}
                value={procedures}
                onChange={(e) => setProcedures(e.target.value)}
                placeholder="Lab procedures for this project…"
              />
            </div>
          </LimsEditableSection>
          <LimsEditableSection
            title="Other details"
            description="Additional context for the lab team."
          >
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Other details</Label>
              <textarea
                className={cn(
                  "min-h-[80px] w-full rounded-md border px-3 py-2 text-sm",
                  fieldClass,
                )}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional notes…"
              />
            </div>
          </LimsEditableSection>
          {projectError ? (
            <p className="text-sm text-destructive">{projectError}</p>
          ) : null}
          <Button type="button" disabled={pending} onClick={saveProject}>
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save project
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <LimsEditableSection
          title="Search this project"
          description="Filter samples and slides by project ID (PTX-PRJ… or UUID), sample ID, client sample ID, or slide ID."
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="lims-project-detail-search"
              type="search"
              value={detailSearch}
              onChange={(e) => setDetailSearch(e.target.value)}
              placeholder="PTX-PRJ1, sample ref, client ID, slide ref, UUID…"
              className={cn("pl-9", fieldClass)}
              autoComplete="off"
            />
          </div>
        </LimsEditableSection>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Samples</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAddOpen((o) => !o);
              setAddErr(null);
            }}
          >
            {addOpen ? "Close form" : "Add sample"}
          </Button>
        </div>

        {addOpen ? (
          <Card className={cn(cardClass, "mb-6")}>
            <CardHeader>
              <CardTitle className="text-base">New sample</CardTitle>
              <CardDescription>
                Tissue type drives the organ abbreviation in the sample ID unless you set an
                override (2–4 letters).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LimsEditableSection
                title="Identification"
                description="Name, client ID, species, tissue, and organ abbreviation."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input
                      className={fieldClass}
                      value={addForm.name}
                      onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Client sample ID</Label>
                    <Input
                      className={fieldClass}
                      value={addForm.client_sample_id}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, client_sample_id: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                <Label className="text-xs">Species</Label>
                <select
                  className={cn("h-10 w-full rounded-md px-3 py-2 text-sm", fieldClass)}
                  value={addForm.species_kind}
                  onChange={(e) =>
                    setAddForm((f) => ({
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tissue type *</Label>
                    <Input
                      className={fieldClass}
                      value={addForm.tissue_type}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, tissue_type: e.target.value }))
                      }
                      placeholder="e.g. Lung"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Organ abbrev override</Label>
                    <Input
                      className={fieldClass}
                      value={addForm.organ_abbrev}
                      onChange={(e) =>
                        setAddForm((f) => ({
                          ...f,
                          organ_abbrev: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="e.g. LG"
                    />
                  </div>
                </div>
              </LimsEditableSection>
              <LimsEditableSection
                title="Clinical & dates"
                description="Diagnostic text, dates, and special handling."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Diagnostic / metadata</Label>
                    <textarea
                      className={cn("min-h-[60px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                      value={addForm.diagnostic}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, diagnostic: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date received</Label>
                    <Input
                      type="date"
                      className={fieldClass}
                      value={addForm.date_received}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, date_received: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date of dissection</Label>
                    <Input
                      type="date"
                      className={fieldClass}
                      value={addForm.date_of_dissection}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, date_of_dissection: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">DOB (if relevant)</Label>
                    <Input
                      type="date"
                      className={fieldClass}
                      value={addForm.dob}
                      onChange={(e) => setAddForm((f) => ({ ...f, dob: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Special care</Label>
                    <textarea
                      className={cn("min-h-[50px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                      value={addForm.special_care_instructions}
                      onChange={(e) =>
                        setAddForm((f) => ({
                          ...f,
                          special_care_instructions: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </LimsEditableSection>
              <LimsEditableSection
                title="Services & instructions"
                description="Free-text services notes and handling instructions."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Services notes</Label>
                    <textarea
                      className={cn("min-h-[50px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                      value={addForm.services_notes}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, services_notes: e.target.value }))
                      }
                      placeholder="Extra context for services (not the catalog list)…"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Instructions / notes</Label>
                    <textarea
                      className={cn("min-h-[50px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                      value={addForm.instructions_notes}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, instructions_notes: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </LimsEditableSection>
              {addErr ? <p className="text-sm text-destructive">{addErr}</p> : null}
              <Button type="button" disabled={pending} onClick={addSample}>
                {pending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create sample
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-6">
          {initial.samples.length === 0 ? (
            <p className="text-sm text-muted-foreground">No samples yet.</p>
          ) : null}
          {initial.samples.length > 0 && filteredSamples.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No samples or slides match your search.
            </p>
          ) : null}
          {filteredSamples.map((sample) => (
            <SampleCard
              key={sample.id}
              projectId={initial.id}
              projectReference={initial.project_reference}
              projectTitle={initial.project_title}
              sample={sample}
              catalog={effectiveCatalog}
              catalogLoading={catalogLoading}
              onRefresh={refresh}
              pending={pending}
              start={start}
              onOpenSampleLabel={(p) => {
                setSampleLabelPayload(p);
                setSampleLabelOpen(true);
              }}
              onOpenLabel={(p) => {
                setLabelPayload(p);
                setLabelOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      <LimsSlideLabelDialog
        open={labelOpen}
        onOpenChange={setLabelOpen}
        payload={labelPayload}
      />
      <LimsSampleLabelDialog
        open={sampleLabelOpen}
        onOpenChange={setSampleLabelOpen}
        payload={sampleLabelPayload}
      />
      <LimsProjectPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        data={printPayload}
      />
    </div>
  );
}

function SampleCard({
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
  onOpenLabel,
}: {
  projectId: string;
  projectReference: string;
  projectTitle: string;
  sample: LimsProjectDetailPayload["samples"][0];
  catalog: LimsProjectDetailPayload["catalog"];
  catalogLoading: boolean;
  onRefresh: () => void;
  pending: boolean;
  start: (fn: () => void) => void;
  onOpenSampleLabel: (p: LimsSampleLabelPayload) => void;
  onOpenLabel: (p: LimsSlideLabelPayload) => void;
}) {
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState<SampleForm>(() => sampleToForm(sample));
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [bulkCount, setBulkCount] = useState("5");

  useEffect(() => {
    setForm(sampleToForm(sample));
  }, [sample]);

  function saveSample() {
    setSaveErr(null);
    const ab = form.organ_abbrev.trim().toUpperCase();
    if (form.organ_abbrev.trim()) {
      const v = validateOrganAbbrev(ab);
      if (v) {
        setSaveErr(v);
        return;
      }
    }
    if (!form.name.trim() || !form.tissue_type.trim()) {
      setSaveErr("Sample name and tissue type are required.");
      return;
    }
    start(async () => {
      const res = await updateLimsSampleAction({
        projectId,
        sampleId: sample.id,
        name: form.name,
        client_sample_id: form.client_sample_id || undefined,
        species_kind: form.species_kind,
        tissue_type: form.tissue_type,
        organ_abbrev: form.organ_abbrev.trim() ? ab : undefined,
        diagnostic: form.diagnostic || undefined,
        date_received: form.date_received || undefined,
        date_of_dissection: form.date_of_dissection || undefined,
        dob: form.dob || undefined,
        special_care_instructions: form.special_care_instructions || undefined,
        services_notes: form.services_notes || undefined,
        instructions_notes: form.instructions_notes || undefined,
      });
      if (!res.ok) setSaveErr(res.error);
      else onRefresh();
    });
  }

  function bulkSlides() {
    const n = Math.max(1, Math.min(200, parseInt(bulkCount, 10) || 0));
    start(async () => {
      const res = await createLimsSlidesBulkAction({
        projectId,
        sampleId: sample.id,
        count: n,
      });
      if (!res.ok) setSaveErr(res.error);
      else onRefresh();
    });
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 rounded-md text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="font-mono text-base">{sample.sample_reference}</CardTitle>
              <CardDescription className="mt-1">{sample.name}</CardDescription>
            </div>
          </button>
          <div className="shrink-0 pt-0.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onOpenSampleLabel({
                  sampleReference: sample.sample_reference,
                  clientSampleId: sample.client_sample_id,
                  projectReference,
                  projectTitle,
                  specimenName: sample.name,
                  tissueType: sample.tissue_type,
                  organAbbrev: sample.organ_abbrev,
                  species_kind: sample.species_kind,
                  dateReceived: sample.date_received,
                })
              }
            >
              Specimen label
            </Button>
          </div>
        </div>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-4 pt-0">
          <LimsEditableSection
            title="Core specimen"
            description="Name, IDs, species, tissue type, and organ abbreviation override."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  className={fieldClass}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Client sample ID</Label>
                <Input
                  className={fieldClass}
                  value={form.client_sample_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, client_sample_id: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Species</Label>
                <select
                  className={cn("h-10 w-full rounded-md px-3 py-2 text-sm", fieldClass)}
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
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tissue type *</Label>
                <Input
                  className={fieldClass}
                  value={form.tissue_type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tissue_type: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Organ abbrev override</Label>
                <Input
                  className={fieldClass}
                  value={form.organ_abbrev}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, organ_abbrev: e.target.value.toUpperCase() }))
                  }
                />
              </div>
            </div>
          </LimsEditableSection>
          <LimsEditableSection
            title="Clinical, dates & notes"
            description="Diagnostic text, dates, special care, services notes, and instructions."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Diagnostic / metadata</Label>
                <textarea
                  className={cn("min-h-[60px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                  value={form.diagnostic}
                  onChange={(e) => setForm((f) => ({ ...f, diagnostic: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date received</Label>
                <Input
                  type="date"
                  className={fieldClass}
                  value={form.date_received}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date_received: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date of dissection</Label>
                <Input
                  type="date"
                  className={fieldClass}
                  value={form.date_of_dissection}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date_of_dissection: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">DOB</Label>
                <Input
                  type="date"
                  className={fieldClass}
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Special care</Label>
                <textarea
                  className={cn("min-h-[50px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                  value={form.special_care_instructions}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, special_care_instructions: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Services notes</Label>
                <textarea
                  className={cn("min-h-[50px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                  value={form.services_notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, services_notes: e.target.value }))
                  }
                  placeholder="Extra context for services (not the catalog list)…"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Instructions / notes</Label>
                <textarea
                  className={cn("min-h-[50px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                  value={form.instructions_notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instructions_notes: e.target.value }))
                  }
                />
              </div>
            </div>
          </LimsEditableSection>
          {saveErr ? <p className="text-sm text-destructive">{saveErr}</p> : null}
          <Button type="button" size="sm" disabled={pending} onClick={saveSample}>
            Save sample
          </Button>

          <LimsEditableSection
            title="Services from catalog"
            description="Add line items from the quote service offering with quantities."
          >
            <LimsSampleServiceLines
              projectId={projectId}
              sampleId={sample.id}
              lines={sample.service_lines}
              catalog={catalog}
              catalogLoading={catalogLoading}
              onRefresh={onRefresh}
              showTitle={false}
            />
          </LimsEditableSection>

          <LimsEditableSection
            title="Custom metadata"
            description="User-defined key and value fields for this sample."
          >
            <LimsKeyValueEditor
              title="Custom metadata"
              showTitle={false}
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
          </LimsEditableSection>

          <LimsEditableSection
            title="Workflow steps"
            description="Checklist for this sample; mark steps complete as you go."
          >
            <LimsStepsList
              title="Workflow steps"
              showTitle={false}
              steps={sample.steps.map((s) => ({
                id: s.id,
                content: s.content,
                completed_at: s.completed_at,
              }))}
              onAdd={async (content) => {
                const res = await addLimsSampleStepAction({
                  projectId,
                  sampleId: sample.id,
                  content,
                });
                if (res.ok) onRefresh();
                return res;
              }}
              onToggleComplete={async (stepId, completed) => {
                const res = await setLimsSampleStepCompletedAction({
                  projectId,
                  sampleId: sample.id,
                  stepId,
                  completed,
                });
                if (res.ok) onRefresh();
                return res;
              }}
              onDelete={async (stepId) => {
                const res = await deleteLimsSampleStepAction({
                  projectId,
                  sampleId: sample.id,
                  stepId,
                });
                if (res.ok) onRefresh();
                return res;
              }}
            />
          </LimsEditableSection>

          <LimsEditableSection
            title="Slides"
            description="Bulk-create slide records and open each slide for notes, metadata, and steps."
          >
            <div className="mb-4 flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Bulk create count</Label>
                <Input
                  className={cn("w-24", fieldClass)}
                  type="number"
                  min={1}
                  max={200}
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                />
              </div>
              <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={bulkSlides}>
                Create slides
              </Button>
            </div>

            {sample.slides.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slides yet.</p>
            ) : (
              <div className="space-y-4">
                {sample.slides.map((slide) => (
                  <SlideBlock
                    key={slide.id}
                    projectId={projectId}
                    projectReference={projectReference}
                    projectTitle={projectTitle}
                    sampleReference={sample.sample_reference}
                    sampleName={sample.name}
                    tissueType={sample.tissue_type}
                    species_kind={sample.species_kind}
                    slide={slide}
                    onRefresh={onRefresh}
                    onOpenLabel={onOpenLabel}
                  />
                ))}
              </div>
            )}
          </LimsEditableSection>
        </CardContent>
      ) : null}
    </Card>
  );
}

function SlideBlock({
  projectId,
  projectReference,
  projectTitle,
  sampleReference,
  sampleName,
  tissueType,
  species_kind,
  slide,
  onRefresh,
  onOpenLabel,
}: {
  projectId: string;
  projectReference: string;
  projectTitle: string;
  sampleReference: string;
  sampleName: string;
  tissueType: string;
  species_kind: LimsSpeciesKind;
  slide: LimsProjectDetailPayload["samples"][0]["slides"][0];
  onRefresh: () => void;
  onOpenLabel: (p: LimsSlideLabelPayload) => void;
}) {
  const [notes, setNotes] = useState(slide.notes ?? "");
  const [exp, setExp] = useState(false);

  useEffect(() => {
    setNotes(slide.notes ?? "");
  }, [slide.notes, slide.id]);

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <button
          type="button"
          className="flex items-center gap-2 text-left font-mono text-sm font-medium"
          onClick={() => setExp((e) => !e)}
        >
          {exp ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          {slide.slide_reference}
        </button>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onOpenLabel({
                slideReference: slide.slide_reference,
                sampleReference,
                projectReference,
                projectTitle,
                createdAt: slide.created_at,
                sampleName,
                tissueType,
                species_kind,
              })
            }
          >
            Print label
          </Button>
        </div>
      </div>
      {exp ? (
        <div className="mt-4 space-y-3 border-t border-border pt-4 dark:border-white/[0.06]">
          <LimsEditableSection
            title="Slide notes"
            description="Text for labels and internal slide notes."
          >
            <div className="space-y-1">
              <Label className="text-xs">Label / slide notes</Label>
              <textarea
                className={cn("min-h-[50px] w-full rounded-md border px-3 py-2 text-sm", fieldClass)}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => {
                  void (async () => {
                    const res = await updateLimsSlideNotesAction({
                      projectId,
                      slideId: slide.id,
                      notes,
                    });
                    if (res.ok) onRefresh();
                  })();
                }}
              />
            </div>
          </LimsEditableSection>
          <LimsEditableSection
            title="Slide metadata"
            description="Custom key–value fields for this slide."
          >
            <LimsKeyValueEditor
              title="Slide metadata"
              showTitle={false}
              rows={slide.metadata.map((m) => ({
                id: m.id,
                key: m.key,
                value: m.value,
              }))}
              onSave={async (key, value) => {
                const res = await upsertLimsSlideMetadataAction({
                  projectId,
                  slideId: slide.id,
                  key,
                  value,
                });
                if (res.ok) onRefresh();
                return res;
              }}
              onDelete={async (metadataId) => {
                const res = await deleteLimsSlideMetadataAction({
                  projectId,
                  slideId: slide.id,
                  metadataId,
                });
                if (res.ok) onRefresh();
                return res;
              }}
            />
          </LimsEditableSection>
          <LimsEditableSection
            title="Slide workflow steps"
            description="Per-slide checklist and completion tracking."
          >
            <LimsStepsList
              title="Slide workflow steps"
              showTitle={false}
              steps={slide.steps.map((s) => ({
                id: s.id,
                content: s.content,
                completed_at: s.completed_at,
              }))}
              onAdd={async (content) => {
                const res = await addLimsSlideStepAction({
                  projectId,
                  slideId: slide.id,
                  content,
                });
                if (res.ok) onRefresh();
                return res;
              }}
              onToggleComplete={async (stepId, completed) => {
                const res = await setLimsSlideStepCompletedAction({
                  projectId,
                  slideId: slide.id,
                  stepId,
                  completed,
                });
                if (res.ok) onRefresh();
                return res;
              }}
              onDelete={async (stepId) => {
                const res = await deleteLimsSlideStepAction({
                  projectId,
                  slideId: slide.id,
                  stepId,
                });
                if (res.ok) onRefresh();
                return res;
              }}
            />
          </LimsEditableSection>
        </div>
      ) : null}
    </div>
  );
}
