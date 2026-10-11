"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type DeleteSampleResult = { ok: true } | { ok: false; error: string };

export async function deleteLimsSampleAction(input: {
  projectId: string;
  sampleId: string;
}): Promise<DeleteSampleResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    const { error } = await supabase
      .from("lims_samples")
      .delete()
      .eq("id", input.sampleId)
      .eq("project_id", input.projectId);

    if (error) {
      console.error(error);
      return { ok: false, error: "Could not delete sample." };
    }

    revalidatePath("/pathx/lims/projects");
    revalidatePath(`/pathx/lims/projects/${input.projectId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete sample." };
  }
}
