"use server";

import { createClient } from "@/lib/supabase/server";
import {
  isLimsProjectStatus,
  isLimsSpeciesKind,
  type LimsProjectStatus,
  type LimsSpeciesKind,
} from "@/lib/lims/types";

export type LimsCatalogServiceOption = { id: string; name: string };

export type LimsMetadataRow = { id: string; key: string; value: string; sort_order: number };
export type LimsStepRow = {
  id: string;
  content: string;
  sort_order: number;
  completed_at: string | null;
  completed_by: string | null;
};

export type LimsSlideDetail = {
  id: string;
  slide_reference: string;
  notes: string | null;
  created_at: string;
  metadata: LimsMetadataRow[];
  steps: LimsStepRow[];
};

export type LimsSampleServiceLineRow = {
  id: string;
  catalog_service_id: string | null;
  label: string;
  quantity: number;
  sort_order: number;
};

export type LimsSampleDetail = {
  id: string;
  sample_reference: string;
  name: string;
  client_sample_id: string | null;
  species_kind: LimsSpeciesKind;
  tissue_type: string;
  organ_abbrev: string | null;
  diagnostic: string | null;
  date_received: string | null;
  date_of_dissection: string | null;
  dob: string | null;
  special_care_instructions: string | null;
  services_notes: string | null;
  instructions_notes: string | null;
  created_at: string;
  updated_at: string;
  service_lines: LimsSampleServiceLineRow[];
  metadata: LimsMetadataRow[];
  slides: LimsSlideDetail[];
};

export type LimsProjectDetailPayload = {
  id: string;
  project_reference: string;
  source_quote_id: string | null;
  source_quote_reference: string | null;
  client_org_name: string;
  client_address: string;
  contact_name: string;
  project_title: string;
  procedures: string;
  details: string;
  status: LimsProjectStatus;
  created_at: string;
  updated_at: string;
  samples: LimsSampleDetail[];
  catalog: LimsCatalogServiceOption[];
  catalog_load_error: string | null;
};

export async function getLimsProjectDetailAction(
  projectId: string,
): Promise<
  { ok: true; data: LimsProjectDetailPayload } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const [
    { data: proj, error: pErr },
    { data: catalogRows, error: catalogErr },
  ] = await Promise.all([
    supabase
      .from("lims_projects")
      .select(
        "id, project_reference, source_quote_id, client_org_name, client_address, contact_name, project_title, procedures, details, status, created_at, updated_at",
      )
      .eq("id", projectId)
      .maybeSingle(),
    supabase
      .from("quote_catalog_services")
      .select("id, name, sort_order")
      .order("sort_order", { ascending: true }),
  ]);
  if (pErr || !proj) return { ok: false, error: "Project not found." };

  const catalog: LimsCatalogServiceOption[] = (catalogRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));
  const catalog_load_error = catalogErr?.message ?? null;

  let sourceQuoteReference: string | null = null;
  if (proj.source_quote_id) {
    const { data: q } = await supabase
      .from("quotes")
      .select("quote_reference")
      .eq("id", proj.source_quote_id)
      .maybeSingle();
    sourceQuoteReference = q?.quote_reference ?? null;
  }

  const status = isLimsProjectStatus(proj.status) ? proj.status : "created";

  const { data: sampleRows, error: sErr } = await supabase
    .from("lims_samples")
    .select(
      "id, sample_reference, name, client_sample_id, species_kind, tissue_type, organ_abbrev, diagnostic, date_received, date_of_dissection, dob, special_care_instructions, services_notes, instructions_notes, created_at, updated_at",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (sErr) return { ok: false, error: "Could not load samples." };

  const sampleIds = (sampleRows ?? []).map((s) => s.id);
  const linesBySample = new Map<string, LimsSampleServiceLineRow[]>();
  if (sampleIds.length > 0) {
    const { data: lineRows, error: lErr } = await supabase
      .from("lims_sample_service_lines")
      .select("id, sample_id, catalog_service_id, label, quantity, sort_order")
      .in("sample_id", sampleIds)
      .order("sort_order", { ascending: true });
    if (lErr) return { ok: false, error: "Could not load sample services." };
    for (const row of lineRows ?? []) {
      const sid = row.sample_id as string;
      const list = linesBySample.get(sid) ?? [];
      list.push({
        id: row.id,
        catalog_service_id: row.catalog_service_id,
        label: row.label,
        quantity: Number(row.quantity),
        sort_order: row.sort_order,
      });
      linesBySample.set(sid, list);
    }
  }

  const samples: LimsSampleDetail[] = [];

  for (const s of sampleRows ?? []) {
    const species = isLimsSpeciesKind(s.species_kind) ? s.species_kind : "human";

    const [{ data: meta }, { data: slideRows }] = await Promise.all([
      supabase
        .from("lims_sample_metadata")
        .select("id, key, value, sort_order")
        .eq("sample_id", s.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("lims_slides")
        .select("id, slide_reference, notes, created_at")
        .eq("sample_id", s.id)
        .order("created_at", { ascending: true }),
    ]);

    const slides: LimsSlideDetail[] = [];
    for (const sl of slideRows ?? []) {
      const [{ data: sm }, { data: st }] = await Promise.all([
        supabase
          .from("lims_slide_metadata")
          .select("id, key, value, sort_order")
          .eq("slide_id", sl.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("lims_slide_steps")
          .select("id, content, sort_order, completed_at, completed_by")
          .eq("slide_id", sl.id)
          .order("sort_order", { ascending: true }),
      ]);
      slides.push({
        id: sl.id,
        slide_reference: sl.slide_reference,
        notes: sl.notes,
        created_at: sl.created_at,
        metadata: (sm ?? []) as LimsMetadataRow[],
        steps: (st ?? []) as LimsStepRow[],
      });
    }

    samples.push({
      id: s.id,
      sample_reference: s.sample_reference,
      name: s.name,
      client_sample_id: s.client_sample_id,
      species_kind: species,
      tissue_type: s.tissue_type ?? "",
      organ_abbrev: s.organ_abbrev,
      diagnostic: s.diagnostic,
      date_received: s.date_received,
      date_of_dissection: s.date_of_dissection,
      dob: s.dob,
      special_care_instructions: s.special_care_instructions,
      services_notes: s.services_notes,
      instructions_notes: s.instructions_notes,
      created_at: s.created_at,
      updated_at: s.updated_at,
      service_lines: linesBySample.get(s.id) ?? [],
      metadata: (meta ?? []) as LimsMetadataRow[],
      slides,
    });
  }

  return {
    ok: true,
    data: {
      id: proj.id,
      project_reference: proj.project_reference,
      source_quote_id: proj.source_quote_id,
      source_quote_reference: sourceQuoteReference,
      client_org_name: proj.client_org_name ?? "",
      client_address: proj.client_address ?? "",
      contact_name: proj.contact_name ?? "",
      project_title: proj.project_title ?? "",
      procedures: proj.procedures ?? "",
      details: proj.details ?? "",
      status,
      created_at: proj.created_at,
      updated_at: proj.updated_at,
      samples,
      catalog,
      catalog_load_error,
    },
  };
}
