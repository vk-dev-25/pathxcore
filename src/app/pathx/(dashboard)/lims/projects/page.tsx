import type { Metadata } from "next";
import Link from "next/link";

import { LimsProjectFinderClient } from "@/components/pathx/lims-project-finder-client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { LimsProjectStatus } from "@/lib/lims/types";
import { isLimsProjectStatus } from "@/lib/lims/types";

export const metadata: Metadata = {
  title: "LIMS projects | PathX",
  description: "Laboratory projects and accessioning.",
};

export type LimsProjectListRow = {
  id: string;
  project_reference: string;
  client_org_name: string | null;
  project_title: string | null;
  status: LimsProjectStatus;
  created_at: string;
  /** Sample + slide references (and UUID) for search — not shown in the table. */
  searchText: string;
};

export default async function LimsProjectsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lims_projects")
    .select(
      "id, project_reference, client_org_name, project_title, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const { data: sampleRows } = await supabase
    .from("lims_samples")
    .select("id, project_id, sample_reference");

  const sampleIdToProjectId = new Map<string, string>();
  const projectIdToSearchParts = new Map<string, string[]>();
  for (const s of sampleRows ?? []) {
    sampleIdToProjectId.set(s.id, s.project_id);
    const parts = projectIdToSearchParts.get(s.project_id) ?? [];
    parts.push(s.sample_reference);
    projectIdToSearchParts.set(s.project_id, parts);
  }

  const { data: slideRows } = await supabase
    .from("lims_slides")
    .select("sample_id, slide_reference");

  for (const sl of slideRows ?? []) {
    const pid = sampleIdToProjectId.get(sl.sample_id);
    if (!pid) continue;
    const parts = projectIdToSearchParts.get(pid) ?? [];
    parts.push(sl.slide_reference);
    projectIdToSearchParts.set(pid, parts);
  }

  const rows: LimsProjectListRow[] = (data ?? []).map((r) => {
    const extra = projectIdToSearchParts.get(r.id) ?? [];
    const searchText = [r.id, ...extra].filter(Boolean).join(" ");
    return {
      id: r.id,
      project_reference: r.project_reference,
      client_org_name: r.client_org_name,
      project_title: r.project_title,
      status: isLimsProjectStatus(r.status) ? r.status : "created",
      created_at: r.created_at,
      searchText,
    };
  });

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              PathX module
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              LIMS projects
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              Projects accessioned from quotes. Open a row to manage samples,
              slides, and workflow steps.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/pathx/quotes">Quote finder</Link>
          </Button>
        </div>

        <LimsProjectFinderClient projects={rows} />
      </div>
    </div>
  );
}
