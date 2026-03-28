import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveOrganAbbrev } from "@/lib/lims/tissue-abbrev";

/** New projects: PTX-PRJ1, PTX-PRJ2, … (shorter than legacy PTX-PR000001). */
const PROJECT_PREFIX = "PTX-PRJ";

export async function allocateProjectReference(
  supabase: SupabaseClient,
): Promise<string> {
  const { data: rows } = await supabase
    .from("lims_projects")
    .select("project_reference")
    .like("project_reference", `${PROJECT_PREFIX}%`);

  let max = 0;
  const re = /^PTX-PRJ(\d+)$/;
  for (const r of rows ?? []) {
    const ref = (r as { project_reference: string }).project_reference;
    const m = ref.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }

  for (let bump = 0; bump < 100_000; bump++) {
    const ref = `${PROJECT_PREFIX}${max + 1 + bump}`;
    const { count } = await supabase
      .from("lims_projects")
      .select("id", { count: "exact", head: true })
      .eq("project_reference", ref);
    if (count === 0) return ref;
  }
  throw new Error("lims_project_reference_exhausted");
}

export async function allocateSampleReference(
  supabase: SupabaseClient,
  projectReference: string,
  tissueType: string,
  organAbbrevOverride: string | null | undefined,
): Promise<string> {
  const pr = projectReference.trim();
  if (!pr) throw new Error("invalid_project_reference");

  const abbrev = resolveOrganAbbrev(tissueType, organAbbrevOverride);
  const prefix = `${pr}-${abbrev}-`;

  const { data: rows } = await supabase
    .from("lims_samples")
    .select("sample_reference")
    .like("sample_reference", `${prefix}%`);

  let maxSeq = 0;
  for (const r of rows ?? []) {
    const ref = (r as { sample_reference: string }).sample_reference;
    const tail = ref.slice(prefix.length);
    const n = parseInt(tail, 10);
    if (!Number.isNaN(n)) maxSeq = Math.max(maxSeq, n);
  }

  for (let attempt = 0; attempt < 1000; attempt++) {
    const seq = maxSeq + 1 + attempt;
    const ref = `${prefix}${String(seq).padStart(2, "0")}`;
    const { count } = await supabase
      .from("lims_samples")
      .select("id", { count: "exact", head: true })
      .eq("sample_reference", ref);
    if (count === 0) return ref;
  }
  throw new Error("lims_sample_reference_exhausted");
}

export async function allocateSlideReferences(
  supabase: SupabaseClient,
  sampleReference: string,
  count: number,
): Promise<string[]> {
  if (count < 1 || count > 500) throw new Error("invalid_slide_count");

  const { data: rows } = await supabase
    .from("lims_slides")
    .select("slide_reference")
    .like("slide_reference", `${sampleReference}-%`);

  let maxSeq = 0;
  const escaped = sampleReference.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const suffixRe = new RegExp(`^${escaped}-(\\d+)$`);
  for (const r of rows ?? []) {
    const ref = (r as { slide_reference: string }).slide_reference;
    const m = ref.match(suffixRe);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) maxSeq = Math.max(maxSeq, n);
    }
  }

  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const seq = maxSeq + 1 + i;
    out.push(`${sampleReference}-${String(seq).padStart(2, "0")}`);
  }
  return out;
}
