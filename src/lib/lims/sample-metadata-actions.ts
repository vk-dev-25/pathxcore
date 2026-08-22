"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function upsertLimsSampleMetadataAction(input: {
  projectId: string;
  sampleId: string;
  key: string;
  value: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const key = input.key.trim();
  if (!key) return { ok: false, error: "Key is required." };

  const { data: sample } = await supabase
    .from("lims_samples")
    .select("id")
    .eq("id", input.sampleId)
    .eq("project_id", input.projectId)
    .maybeSingle();
  if (!sample) return { ok: false, error: "Sample not found." };

  const { data: existing } = await supabase
    .from("lims_sample_metadata")
    .select("id")
    .eq("sample_id", input.sampleId)
    .eq("key", key)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("lims_sample_metadata")
      .update({ value: input.value })
      .eq("id", existing.id);
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save metadata." };
    }
  } else {
    const { error } = await supabase.from("lims_sample_metadata").insert({
      sample_id: input.sampleId,
      key,
      value: input.value,
      sort_order: 0,
    });
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save metadata." };
    }
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}

export async function deleteLimsSampleMetadataAction(input: {
  projectId: string;
  sampleId: string;
  metadataId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("lims_sample_metadata")
    .delete()
    .eq("id", input.metadataId)
    .eq("sample_id", input.sampleId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not delete metadata." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}
