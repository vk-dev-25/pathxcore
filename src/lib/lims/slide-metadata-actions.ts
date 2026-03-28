"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function upsertLimsSlideMetadataAction(input: {
  projectId: string;
  slideId: string;
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

  const { data: slide } = await supabase
    .from("lims_slides")
    .select("id, sample_id")
    .eq("id", input.slideId)
    .maybeSingle();
  if (!slide) return { ok: false, error: "Slide not found." };

  const { data: sample } = await supabase
    .from("lims_samples")
    .select("project_id")
    .eq("id", slide.sample_id)
    .maybeSingle();
  if (!sample || sample.project_id !== input.projectId) {
    return { ok: false, error: "Slide not found." };
  }

  const { data: existing } = await supabase
    .from("lims_slide_metadata")
    .select("id")
    .eq("slide_id", input.slideId)
    .eq("key", key)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("lims_slide_metadata")
      .update({ value: input.value })
      .eq("id", existing.id);
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save metadata." };
    }
  } else {
    const { error } = await supabase.from("lims_slide_metadata").insert({
      slide_id: input.slideId,
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

export async function deleteLimsSlideMetadataAction(input: {
  projectId: string;
  slideId: string;
  metadataId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("lims_slide_metadata")
    .delete()
    .eq("id", input.metadataId)
    .eq("slide_id", input.slideId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not delete metadata." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}
