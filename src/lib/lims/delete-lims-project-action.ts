"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type DeleteLimsProjectResult = { ok: true } | { ok: false; error: string };

export async function deleteLimsProjectAction(input: {
  projectId: string;
}): Promise<DeleteLimsProjectResult> {
  try {
    const projectId = input.projectId?.trim();
    if (!projectId) return { ok: false, error: "Missing project." };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    const { error } = await supabase.from("lims_projects").delete().eq("id", projectId);

    if (error) {
      console.error(error);
      return { ok: false, error: "Could not delete project." };
    }

    revalidatePath("/pathx/lims/projects");
    revalidatePath("/pathx/lims");
    revalidatePath(`/pathx/lims/projects/${projectId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete project." };
  }
}
