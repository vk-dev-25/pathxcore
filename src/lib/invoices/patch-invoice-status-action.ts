"use server";

import { revalidatePath } from "next/cache";

import { isInvoiceStatus, type InvoiceStatus } from "@/lib/invoices/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function patchInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isInvoiceStatus(status)) {
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
      "patchInvoiceStatusAction: service role unavailable, using session client (RLS must allow updating any invoice):",
      e,
    );
  }

  const { data: updated, error } = await db
    .from("invoices")
    .update({
      status,
      updated_at: new Date().toISOString(),
      last_updated_by: user.id,
      last_updated_by_email: user.email ?? null,
    })
    .eq("id", invoiceId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not update invoice status." };
  }
  if (!updated) {
    return {
      ok: false,
      error:
        "Invoice was not updated (not found or no permission). Refresh the page and try again.",
    };
  }

  revalidatePath("/pathx/invoices");
  revalidatePath(`/pathx/invoices/${invoiceId}`);
  return { ok: true };
}
