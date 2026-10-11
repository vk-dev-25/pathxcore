"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type DeleteSlideResult = { ok: true } | { ok: false; error: string };

export async function deleteLimsSlideAction(input: {
  projectId: string;
  slideId: string;
}): Promise<DeleteSlideResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    const { data: slide, error: sErr } = await supabase
      .from("lims_slides")
      .select("id, sample_id")
      .eq("id", input.slideId)
      .maybeSingle();
    if (sErr || !slide) return { ok: false, error: "Slide not found." };

    const { data: sample } = await supabase
      .from("lims_samples")
      .select("project_id")
      .eq("id", slide.sample_id)
      .maybeSingle();
    if (sample?.project_id !== input.projectId) {
      return { ok: false, error: "Slide not found." };
    }

    const { error } = await supabase.from("lims_slides").delete().eq("id", input.slideId);
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not delete slide." };
    }

    revalidatePath(`/pathx/lims/projects/${input.projectId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete slide." };
  }
}
