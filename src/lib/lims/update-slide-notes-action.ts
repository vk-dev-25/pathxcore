"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function updateLimsSlideNotesAction(input: {
  projectId: string;
  slideId: string;
  notes: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: slide } = await supabase
    .from("lims_slides")
    .select("sample_id")
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

  const { error } = await supabase
    .from("lims_slides")
    .update({
      notes: input.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.slideId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not update slide." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}
