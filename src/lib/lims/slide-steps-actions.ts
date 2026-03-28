"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

async function assertSlideInProject(
  supabase: SupabaseClient,
  projectId: string,
  slideId: string,
): Promise<boolean> {
  const { data: slide } = await supabase
    .from("lims_slides")
    .select("sample_id")
    .eq("id", slideId)
    .maybeSingle();
  if (!slide) return false;
  const { data: sample } = await supabase
    .from("lims_samples")
    .select("project_id")
    .eq("id", slide.sample_id)
    .maybeSingle();
  return sample?.project_id === projectId;
}

export async function addLimsSlideStepAction(input: {
  projectId: string;
  slideId: string;
  content: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const ok = await assertSlideInProject(supabase, input.projectId, input.slideId);
  if (!ok) return { ok: false, error: "Slide not found." };

  const { count } = await supabase
    .from("lims_slide_steps")
    .select("id", { count: "exact", head: true })
    .eq("slide_id", input.slideId);

  const sortOrder = (count ?? 0) + 1;

  const { error } = await supabase.from("lims_slide_steps").insert({
    slide_id: input.slideId,
    content: input.content.trim(),
    sort_order: sortOrder,
  });

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not add step." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}

export async function setLimsSlideStepCompletedAction(input: {
  projectId: string;
  slideId: string;
  stepId: string;
  completed: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const ok = await assertSlideInProject(supabase, input.projectId, input.slideId);
  if (!ok) return { ok: false, error: "Slide not found." };

  const { error } = await supabase
    .from("lims_slide_steps")
    .update({
      completed_at: input.completed ? new Date().toISOString() : null,
      completed_by: input.completed ? user.id : null,
    })
    .eq("id", input.stepId)
    .eq("slide_id", input.slideId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not update step." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}

export async function deleteLimsSlideStepAction(input: {
  projectId: string;
  slideId: string;
  stepId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const ok = await assertSlideInProject(supabase, input.projectId, input.slideId);
  if (!ok) return { ok: false, error: "Slide not found." };

  const { error } = await supabase
    .from("lims_slide_steps")
    .delete()
    .eq("id", input.stepId)
    .eq("slide_id", input.slideId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not delete step." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}
