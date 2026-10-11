"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AntibodyActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function currentUserLabel(): Promise<
  | { ok: true; label: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const label = user.email ?? user.id;
  return { ok: true, label };
}

export async function createAntibodyAction(input: {
  antibody_name: string;
  clone_detail?: string;
  vendor_name?: string;
  catalog?: string;
  lot_number?: string;
  ig_species?: string;
  working_concentration?: string;
  antigen_retrieval?: string;
  detection_method?: string;
  provided_by?: string;
  date_provided?: string | null;
}): Promise<AntibodyActionResult> {
  const who = await currentUserLabel();
  if (!who.ok) return who;

  const name = input.antibody_name.trim();
  if (!name) return { ok: false, error: "Antibody name is required." };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const dateProvided =
    input.date_provided?.trim() === "" || input.date_provided === undefined
      ? null
      : input.date_provided;

  const { error } = await supabase.from("pathx_antibodies").insert({
    antibody_name: name,
    clone_detail: input.clone_detail?.trim() ?? "",
    vendor_name: input.vendor_name?.trim() ?? "",
    catalog: input.catalog?.trim() ?? "",
    lot_number: input.lot_number?.trim() ?? "",
    ig_species: input.ig_species?.trim() ?? "",
    working_concentration: input.working_concentration?.trim() ?? "",
    antigen_retrieval: input.antigen_retrieval?.trim() ?? "",
    detection_method: input.detection_method?.trim() ?? "",
    provided_by: input.provided_by?.trim() ?? "",
    date_provided: dateProvided,
    last_updated_by: who.label,
    updated_at: now,
  });

  if (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/pathx/antibodies");
  return { ok: true };
}

export async function updateAntibodyAction(input: {
  id: string;
  antibody_name: string;
  clone_detail?: string;
  vendor_name?: string;
  catalog?: string;
  lot_number?: string;
  ig_species?: string;
  working_concentration?: string;
  antigen_retrieval?: string;
  detection_method?: string;
  provided_by?: string;
  date_provided?: string | null;
}): Promise<AntibodyActionResult> {
  const who = await currentUserLabel();
  if (!who.ok) return who;

  const name = input.antibody_name.trim();
  if (!name) return { ok: false, error: "Antibody name is required." };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const dateProvided =
    input.date_provided?.trim() === "" || input.date_provided === undefined
      ? null
      : input.date_provided;

  const { error } = await supabase
    .from("pathx_antibodies")
    .update({
      antibody_name: name,
      clone_detail: input.clone_detail?.trim() ?? "",
      vendor_name: input.vendor_name?.trim() ?? "",
      catalog: input.catalog?.trim() ?? "",
      lot_number: input.lot_number?.trim() ?? "",
      ig_species: input.ig_species?.trim() ?? "",
      working_concentration: input.working_concentration?.trim() ?? "",
      antigen_retrieval: input.antigen_retrieval?.trim() ?? "",
      detection_method: input.detection_method?.trim() ?? "",
      provided_by: input.provided_by?.trim() ?? "",
      date_provided: dateProvided,
      last_updated_by: who.label,
      updated_at: now,
    })
    .eq("id", input.id);

  if (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/pathx/antibodies");
  return { ok: true };
}

export async function deleteAntibodyAction(input: {
  id: string;
}): Promise<AntibodyActionResult> {
  const who = await currentUserLabel();
  if (!who.ok) return who;

  const supabase = await createClient();
  const { error } = await supabase
    .from("pathx_antibodies")
    .delete()
    .eq("id", input.id);

  if (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/pathx/antibodies");
  return { ok: true };
}
