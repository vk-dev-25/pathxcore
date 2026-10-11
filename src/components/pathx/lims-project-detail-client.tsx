"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Loader2, Printer, Save, Search } from "lucide-react";

import { LimsEditableSection } from "@/components/pathx/lims-editable-section";
import { LimsProjectPrintDialog } from "@/components/pathx/lims-project-print-dialog";
import { LimsSamplesSheet } from "@/components/pathx/lims-samples-sheet";
import {
  LimsSampleLabelDialog,
  type LimsSampleLabelPayload,
} from "@/components/pathx/lims-sample-label-dialog";
import {
  LimsSlideLabelDialog,
  type LimsSlideLabelPayload,
} from "@/components/pathx/lims-slide-label-dialog";
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
import type {
  LimsCatalogServiceOption,
  LimsProjectDetailPayload,
} from "@/lib/lims/get-lims-project-detail-action";
import {
  canTransitionProjectStatus,
  formatLimsProjectStatusLabel,
  type LimsProjectStatus,
} from "@/lib/lims/types";
import { updateLimsProjectAction } from "@/lib/lims/update-project-action";
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

export function LimsProjectDetailClient({
  initial,
}: {
  initial: LimsProjectDetailPayload;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [projectDetails, setProjectDetails] = useState(initial.procedures);
  const [status, setStatus] = useState<LimsProjectStatus>(initial.status);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [labelOpen, setLabelOpen] = useState(false);
  const [labelPayload, setLabelPayload] = useState<
    LimsSlideLabelPayload | LimsSlideLabelPayload[] | null
  >(null);

  const [projectExpanded, setProjectExpanded] = useState(false);
  const projectInitialMount = useRef(true);

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
      procedures: projectDetails,
      status,
    }),
    [initial, projectDetails, status],
  );

  useEffect(() => {
    setProjectDetails(initial.procedures);
    setStatus(initial.status);
  }, [initial.procedures, initial.status, initial.updated_at]);

  useEffect(() => {
    if (projectInitialMount.current) {
      projectInitialMount.current = false;
      return;
    }
    setProjectExpanded(false);
  }, [initial.id, initial.updated_at]);

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
        projectDetails,
        status,
      });
      if (!res.ok) setProjectError(res.error);
      else refresh();
    });
  }

  return (
    <div className="mx-auto max-w-[min(1800px,calc(100vw-2rem))] px-4 py-8 sm:px-6">
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
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-start gap-2 rounded-md text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setProjectExpanded((e) => !e)}
            >
              {projectExpanded ? (
                <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <CardTitle className="text-lg">Project</CardTitle>
                <CardDescription className="mt-1">
                  {projectExpanded
                    ? "Project details and workflow status."
                    : `${formatLimsProjectStatusLabel(status)} · click to expand`}
                </CardDescription>
              </div>
            </button>
            <Button type="button" size="sm" disabled={pending} onClick={saveProject}>
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save project
            </Button>
          </div>
        </CardHeader>
        {projectExpanded ? (
          <CardContent className="space-y-4 pt-0">
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
              title="Project details"
              description="Context and notes for this project."
            >
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Project details</Label>
                <textarea
                  className={cn(
                    "min-h-[100px] w-full rounded-md border px-3 py-2 text-sm",
                    fieldClass,
                  )}
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder="Project details…"
                />
              </div>
            </LimsEditableSection>
            {projectError ? (
              <p className="text-sm text-destructive">{projectError}</p>
            ) : null}
          </CardContent>
        ) : null}
      </Card>

      <div className="mt-8">
        <LimsEditableSection
          title="Search this project"
          description="Filter samples and slides by project ID (PRJ…, legacy PTX-PRJ…, or UUID), sample ID, client sample ID, or slide ID."
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="lims-project-detail-search"
              type="search"
              value={detailSearch}
              onChange={(e) => setDetailSearch(e.target.value)}
              placeholder="PRJ1, sample ref, client ID, slide ref, UUID…"
              className={cn("pl-9", fieldClass)}
              autoComplete="off"
            />
          </div>
        </LimsEditableSection>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Samples</h2>
        {initial.samples.length > 0 && filteredSamples.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">
            No samples or slides match your search.
          </p>
        ) : null}
        <LimsSamplesSheet
          projectId={initial.id}
          projectReference={initial.project_reference}
          projectTitle={initial.project_title}
          samples={filteredSamples}
          totalSampleCount={initial.samples.length}
          catalog={effectiveCatalog}
          catalogLoading={catalogLoading}
          onRefresh={refresh}
          onOpenSampleLabel={(p) => {
            setSampleLabelPayload(p);
            setSampleLabelOpen(true);
          }}
          onOpenSlideLabel={(p) => {
            setLabelPayload(p);
            setLabelOpen(true);
          }}
          onPrintAllSlideLabels={(payloads) => {
            setLabelPayload(payloads);
            setLabelOpen(true);
          }}
        />
      </div>

      <LimsSlideLabelDialog
        open={labelOpen}
        onOpenChange={(o) => {
          setLabelOpen(o);
          if (!o) setLabelPayload(null);
        }}
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
