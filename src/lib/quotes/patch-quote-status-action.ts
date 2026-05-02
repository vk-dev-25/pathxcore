"use server";

import { revalidatePath } from "next/cache";

import { isQuoteStatus, type QuoteStatus } from "@/lib/quotes/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function patchQuoteStatusAction(
  quoteId: string,
  status: QuoteStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isQuoteStatus(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  let db = supabase as typeof supabase;
  try {
    db = createServiceRoleClient() as typeof supabase;
  } catch (e) {
    console.warn(
      "patchQuoteStatusAction: service role unavailable, using session client (RLS must allow updating any quote):",
      e,
    );
  }

  const { data: updated, error } = await db
    .from("quotes")
    .update({
      status,
      updated_at: new Date().toISOString(),
      last_updated_by: user.id,
      last_updated_by_email: user.email ?? null,
    })
    .eq("id", quoteId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not update quote status." };
  }
  if (!updated) {
    return {
      ok: false,
      error:
        "Quote was not updated (not found or no permission). Refresh the page and try again.",
    };
  }

  revalidatePath("/pathx/quotes");
  revalidatePath(`/pathx/quotes/${quoteId}/edit`);
  return { ok: true };
}
