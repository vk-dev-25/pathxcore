"use server";

import { revalidatePath } from "next/cache";

import { allocateProjectReference } from "@/lib/lims/id-allocation";
import { createClient } from "@/lib/supabase/server";

export type CreateLimsProjectFromQuoteResult =
  | { ok: true; projectId: string }
  | { ok: false; error: string };

export async function createLimsProjectFromQuoteAction(
  quoteId: string,
): Promise<CreateLimsProjectFromQuoteResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in." };

    const { data: quote, error: qErr } = await supabase
      .from("quotes")
      .select("id, client_org_name, client_address, contact_name, project_title")
      .eq("id", quoteId)
      .maybeSingle();
    if (qErr || !quote) return { ok: false, error: "Quote not found." };

    let createdId: string | null = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      const projectReference = await allocateProjectReference(supabase);
      const { data: created, error: insErr } = await supabase
        .from("lims_projects")
        .insert({
          project_reference: projectReference,
          source_quote_id: quote.id,
          client_org_name: quote.client_org_name,
          client_address: quote.client_address,
          contact_name: quote.contact_name,
          project_title: quote.project_title,
          status: "created",
          created_by: user.id,
        })
        .select("id")
        .single();

      if (!insErr && created?.id) {
        createdId = created.id;
        break;
      }
      if (insErr?.code !== "23505") {
        console.error(insErr);
        return { ok: false, error: "Could not create LIMS project." };
      }
    }

    if (!createdId) {
      return { ok: false, error: "Could not allocate unique project number." };
    }

    revalidatePath("/pathx/lims");
    revalidatePath("/pathx/lims/projects");
    revalidatePath(`/pathx/lims/projects/${createdId}`);
    revalidatePath("/pathx/quotes");
    return { ok: true, projectId: createdId };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create LIMS project." };
  }
}
