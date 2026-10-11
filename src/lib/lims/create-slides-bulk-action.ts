"use server";

import { revalidatePath } from "next/cache";

import { allocateSlideReferences } from "@/lib/lims/id-allocation";
import { createClient } from "@/lib/supabase/server";

export type CreateSlidesBulkResult =
  | { ok: true; slideIds: string[] }
  | { ok: false; error: string };

export async function createLimsSlidesBulkAction(input: {
  projectId: string;
  sampleId: string;
  count: number;
}): Promise<CreateSlidesBulkResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    const n = Math.floor(input.count);
    if (n < 1 || n > 200) {
      return { ok: false, error: "Count must be between 1 and 200." };
    }

    const { data: sample, error: sErr } = await supabase
      .from("lims_samples")
      .select("id, sample_reference, project_id")
      .eq("id", input.sampleId)
      .maybeSingle();
    if (sErr || !sample || sample.project_id !== input.projectId) {
      return { ok: false, error: "Sample not found." };
    }

    const refs = await allocateSlideReferences(
      supabase,
      sample.sample_reference,
      n,
    );

    const rows = refs.map((slide_reference) => ({
      slide_reference,
      sample_id: sample.id,
    }));

    const { data: inserted, error: insErr } = await supabase
      .from("lims_slides")
      .insert(rows)
      .select("id");

    if (insErr) {
      console.error(insErr);
      return { ok: false, error: "Could not create slides." };
    }

    revalidatePath(`/pathx/lims/projects/${input.projectId}`);
    return { ok: true, slideIds: (inserted ?? []).map((r) => r.id) };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create slides." };
  }
}
