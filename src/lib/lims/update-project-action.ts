"use server";

import { revalidatePath } from "next/cache";

import {
  canTransitionProjectStatus,
  isLimsProjectStatus,
  type LimsProjectStatus,
} from "@/lib/lims/types";
import { createClient } from "@/lib/supabase/server";

export type UpdateProjectResult = { ok: true } | { ok: false; error: string };

export async function updateLimsProjectAction(input: {
  projectId: string;
  projectDetails: string;
  status: LimsProjectStatus;
}): Promise<UpdateProjectResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    if (!isLimsProjectStatus(input.status)) {
      return { ok: false, error: "Invalid project status." };
    }

    const { data: current, error: cErr } = await supabase
      .from("lims_projects")
      .select("status")
      .eq("id", input.projectId)
      .maybeSingle();
    if (cErr || !current) return { ok: false, error: "Project not found." };

    const from = isLimsProjectStatus(current.status) ? current.status : "created";
    if (!canTransitionProjectStatus(from, input.status)) {
      return { ok: false, error: "Invalid status transition." };
    }

    const { error } = await supabase
      .from("lims_projects")
      .update({
        procedures: input.projectDetails.trim() || null,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.projectId);

    if (error) {
      console.error(error);
      return { ok: false, error: "Could not update project." };
    }

    revalidatePath("/pathx/lims/projects");
    revalidatePath(`/pathx/lims/projects/${input.projectId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update project." };
  }
}
