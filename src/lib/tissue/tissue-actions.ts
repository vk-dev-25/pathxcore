"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { TissueBlockStatus } from "@/lib/tissue/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type TissueActionResult =
  | { ok: true }
  | { ok: false; error: string };

function tissueCatalogAbbr(tissue: string): string {
  const letters = tissue.toUpperCase().replace(/[^A-Z]/g, "");
  if (letters.length >= 2) return letters.slice(0, 2);
  if (letters.length === 1) return `${letters}X`;
  return "UN";
}

async function allocateCatalogId(
  supabase: SupabaseClient,
  tissue: string,
): Promise<string> {
  for (let i = 0; i < 80; i++) {
    const n = 1_000_000 + Math.floor(Math.random() * 9_000_000);
    const id = `PTDX-${tissueCatalogAbbr(tissue)}-${n}`;
    const { count } = await supabase
      .from("tissue_inventory")
      .select("id", { count: "exact", head: true })
      .eq("catalog_id", id);
    if (count === 0) return id;
  }
  throw new Error("catalog_id_exhausted");
}

async function allocateAccession(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TS${year}-`;
  const { data } = await supabase
    .from("tissue_inventory")
    .select("accession")
    .like("accession", `${prefix}%`)
    .order("accession", { ascending: false })
    .limit(1)
    .maybeSingle();

  let next = 1;
  if (data?.accession?.startsWith(prefix)) {
    const tail = data.accession.slice(prefix.length);
    const n = parseInt(tail, 10);
    if (!Number.isNaN(n)) next = n + 1;
  }

  for (let bump = 0; bump < 100_000; bump++) {
    const acc = `${prefix}${String(next + bump).padStart(6, "0")}`;
    const { count } = await supabase
      .from("tissue_inventory")
      .select("id", { count: "exact", head: true })
      .eq("accession", acc);
    if (count === 0) return acc;
  }
  throw new Error("accession_exhausted");
}

export async function addTissueBlockAction(input: {
  dob: string;
  gender: string;
  tissue: string;
  diag_short: string;
  diag_text: string;
  category: string;
  source_tab: string;
}): Promise<TissueActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You must be signed in." };
    }

    const row = {
      dob: input.dob.trim() || null,
      gender: input.gender.trim() || null,
      tissue: input.tissue.trim(),
      diag_short: input.diag_short.trim() || null,
      diag_text: input.diag_text.trim() || null,
      category: input.category.trim(),
      source_tab: input.source_tab.trim() || "Sheet1",
      status: "available" as const,
      created_by: user.id,
    };

    for (let attempt = 0; attempt < 12; attempt++) {
      let catalog_id: string;
      let accession: string;
      try {
        catalog_id = await allocateCatalogId(supabase, row.tissue);
        accession = await allocateAccession(supabase);
      } catch {
        return { ok: false, error: "Could not assign catalog ID or accession." };
      }

      const { error } = await supabase.from("tissue_inventory").insert({
        ...row,
        catalog_id,
        accession,
      });

      if (!error) {
        try {
          revalidatePath("/pathx/tissue-bank");
          revalidatePath("/tissue-bank");
        } catch {
          /* revalidate must not fail the action response */
        }
        return { ok: true };
      }

      if (error.code === "23505") {
        continue;
      }

      console.error(error);
      return { ok: false, error: "Could not add tissue block." };
    }

    return {
      ok: false,
      error: "Could not assign a unique catalog ID or accession. Try again.",
    };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not add tissue block." };
  }
}

export async function setTissueStatusAction(input: {
  id: string;
  status: TissueBlockStatus;
  note?: string;
}): Promise<TissueActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: input.status,
    updated_at: now,
  };

  if (input.status === "sold") {
    patch.sold_at = now;
    patch.sold_note = input.note?.trim() || null;
    patch.discarded_at = null;
    patch.discarded_note = null;
  } else if (input.status === "discarded") {
    patch.discarded_at = now;
    patch.discarded_note = input.note?.trim() || null;
    patch.sold_at = null;
    patch.sold_note = null;
  } else {
    patch.sold_at = null;
    patch.sold_note = null;
    patch.discarded_at = null;
    patch.discarded_note = null;
  }

  const { error } = await supabase
    .from("tissue_inventory")
    .update(patch)
    .eq("id", input.id);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not update status." };
  }

  revalidatePath("/pathx/tissue-bank");
  revalidatePath("/tissue-bank");
  return { ok: true };
}

export async function deleteTissueBlockAction(id: string): Promise<TissueActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { error } = await supabase.from("tissue_inventory").delete().eq("id", id);

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not delete block." };
  }

  revalidatePath("/pathx/tissue-bank");
  revalidatePath("/tissue-bank");
  return { ok: true };
}
