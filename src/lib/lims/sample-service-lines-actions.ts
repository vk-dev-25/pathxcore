"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

async function assertSampleInProject(
  supabase: SupabaseClient,
  projectId: string,
  sampleId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("lims_samples")
    .select("id")
    .eq("id", sampleId)
    .eq("project_id", projectId)
    .maybeSingle();
  return Boolean(data);
}

export async function addLimsSampleServiceLineAction(input: {
  projectId: string;
  sampleId: string;
  catalog_service_id: string;
  label: string;
  quantity: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const ok = await assertSampleInProject(supabase, input.projectId, input.sampleId);
  if (!ok) return { ok: false, error: "Sample not found." };

  const qty = Number(input.quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    return { ok: false, error: "Quantity must be a positive number." };
  }

  const { count } = await supabase
    .from("lims_sample_service_lines")
    .select("id", { count: "exact", head: true })
    .eq("sample_id", input.sampleId);
  const sortOrder = (count ?? 0) + 1;

  const { error } = await supabase.from("lims_sample_service_lines").insert({
    sample_id: input.sampleId,
    catalog_service_id: input.catalog_service_id,
    label: input.label.trim() || "Service",
    quantity: qty,
    sort_order: sortOrder,
  });

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not add service line." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}

export async function updateLimsSampleServiceLineQuantityAction(input: {
  projectId: string;
  sampleId: string;
  lineId: string;
  quantity: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const ok = await assertSampleInProject(supabase, input.projectId, input.sampleId);
  if (!ok) return { ok: false, error: "Sample not found." };

  const qty = Number(input.quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    return { ok: false, error: "Quantity must be a positive number." };
  }

  const { error } = await supabase
    .from("lims_sample_service_lines")
    .update({ quantity: qty })
    .eq("id", input.lineId)
    .eq("sample_id", input.sampleId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not update quantity." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}

export async function deleteLimsSampleServiceLineAction(input: {
  projectId: string;
  sampleId: string;
  lineId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const ok = await assertSampleInProject(supabase, input.projectId, input.sampleId);
  if (!ok) return { ok: false, error: "Sample not found." };

  const { error } = await supabase
    .from("lims_sample_service_lines")
    .delete()
    .eq("id", input.lineId)
    .eq("sample_id", input.sampleId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not remove service line." };
  }
  revalidatePath(`/pathx/lims/projects/${input.projectId}`);
  return { ok: true };
}
