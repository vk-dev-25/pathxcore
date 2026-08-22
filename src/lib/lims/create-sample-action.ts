"use server";

import { revalidatePath } from "next/cache";

import { allocateSampleReference } from "@/lib/lims/id-allocation";
import { isLimsSpeciesKind, type LimsSpeciesKind } from "@/lib/lims/types";
import { createClient } from "@/lib/supabase/server";

export type CreateSampleResult =
  | { ok: true; sampleId: string }
  | { ok: false; error: string };

export async function createLimsSampleAction(input: {
  projectId: string;
  client_sample_id?: string;
  species_kind: LimsSpeciesKind;
  tissue_type: string;
  organ_abbrev?: string;
  diagnostic?: string;
  date_received?: string;
  date_of_dissection?: string;
  dob?: string;
  special_care_instructions?: string;
  services_notes?: string;
  instructions_notes?: string;
}): Promise<CreateSampleResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    if (!isLimsSpeciesKind(input.species_kind)) {
      return { ok: false, error: "Invalid species." };
    }
    const tissueType = input.tissue_type.trim();
    if (!tissueType) {
      return {
        ok: false,
        error: "Tissue type is required before a sample ID can be assigned.",
      };
    }

    const { data: proj, error: pErr } = await supabase
      .from("lims_projects")
      .select("id, project_reference")
      .eq("id", input.projectId)
      .maybeSingle();
    if (pErr || !proj) return { ok: false, error: "Project not found." };

    const sampleRef = await allocateSampleReference(
      supabase,
      proj.project_reference,
      tissueType,
      input.organ_abbrev,
    );

    const { data: row, error: insErr } = await supabase
      .from("lims_samples")
      .insert({
        sample_reference: sampleRef,
        project_id: proj.id,
        name: "",
        client_sample_id: input.client_sample_id?.trim() || null,
        species_kind: input.species_kind,
        tissue_type: tissueType,
        organ_abbrev: input.organ_abbrev?.trim().toUpperCase() || null,
        diagnostic: input.diagnostic?.trim() || null,
        date_received: input.date_received?.trim() || null,
        date_of_dissection: input.date_of_dissection?.trim() || null,
        dob: input.dob?.trim() || null,
        special_care_instructions: input.special_care_instructions?.trim() || null,
        services_notes: input.services_notes?.trim() || null,
        instructions_notes: input.instructions_notes?.trim() || null,
      })
      .select("id")
      .single();

    if (insErr || !row) {
      console.error(insErr);
      return { ok: false, error: "Could not create sample." };
    }

    revalidatePath(`/pathx/lims/projects/${input.projectId}`);
    return { ok: true, sampleId: row.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create sample." };
  }
}
