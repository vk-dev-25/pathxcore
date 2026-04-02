"use server";

import { revalidatePath } from "next/cache";

import { isLimsSpeciesKind, type LimsSpeciesKind } from "@/lib/lims/types";
import { createClient } from "@/lib/supabase/server";

export type UpdateSampleResult = { ok: true } | { ok: false; error: string };

export async function updateLimsSampleAction(input: {
  projectId: string;
  sampleId: string;
  name: string;
  client_sample_id?: string;
  species_kind: LimsSpeciesKind;
  tissue_type: string;
  organ_abbrev?: string;
  date_received?: string;
  date_of_dissection?: string;
  instructions_notes?: string;
}): Promise<UpdateSampleResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    if (!isLimsSpeciesKind(input.species_kind)) {
      return { ok: false, error: "Invalid species." };
    }
    const { error } = await supabase
      .from("lims_samples")
      .update({
        name: input.name.trim(),
        client_sample_id: input.client_sample_id?.trim() || null,
        species_kind: input.species_kind,
        tissue_type: input.tissue_type.trim(),
        organ_abbrev: input.organ_abbrev?.trim().toUpperCase() || null,
        date_received: input.date_received?.trim() || null,
        date_of_dissection: input.date_of_dissection?.trim() || null,
        instructions_notes: input.instructions_notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.sampleId)
      .eq("project_id", input.projectId);

    if (error) {
      console.error(error);
      return { ok: false, error: "Could not update sample." };
    }

    revalidatePath(`/pathx/lims/projects/${input.projectId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update sample." };
  }
}
