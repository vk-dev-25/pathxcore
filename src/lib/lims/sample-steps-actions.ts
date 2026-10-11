"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function addLimsSampleStepAction(input: {
  projectId: string;
  sampleId: string;
  content: string;
}): Promise<{ ok: true; stepId?: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { count } = await supabase
    .from("lims_sample_steps")
    .select("id", { count: "exact", head: true })
    .eq("sample_id", input.sampleId);

  const sortOrder = (count ?? 0) + 1;

  const { data, error } = await supabase
    .from("lims_sample_steps")
    .insert({
      sample_id: input.sampleId,
      content: input.content.trim(),
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not add step." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true, stepId: data?.id };
}

export async function setLimsSampleStepCompletedAction(input: {
  projectId: string;
  sampleId: string;
  stepId: string;
  completed: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("lims_sample_steps")
    .update({
      completed_at: input.completed ? new Date().toISOString() : null,
      completed_by: input.completed ? user.id : null,
    })
    .eq("id", input.stepId)
    .eq("sample_id", input.sampleId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not update step." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}

export async function deleteLimsSampleStepAction(input: {
  projectId: string;
  sampleId: string;
  stepId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("lims_sample_steps")
    .delete()
    .eq("id", input.stepId)
    .eq("sample_id", input.sampleId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not delete step." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}
