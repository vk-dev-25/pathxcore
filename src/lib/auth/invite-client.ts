import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/admin";

const INVITE_CODE = "CLIENT-INVITE-AUTO";

/** Pre-create a passwordless account so the client can later magic-link in. */
export async function inviteClientUser(email: string): Promise<void> {
  try {
    const admin = createServiceRoleClient();

    let { data: code } = await admin
      .from("access_codes")
      .select("id")
      .eq("code", INVITE_CODE)
      .maybeSingle();
    if (!code?.id) {
      const { data: created } = await admin
        .from("access_codes")
        .insert({
          code: INVITE_CODE,
          expires_at: "2099-01-01T00:00:00Z",
          max_uses: 1000000,
        })
        .select("id")
        .single();
      code = created ?? null;
    }
    if (code?.id) {
      await admin
        .from("signup_allowances")
        .delete()
        .eq("email", email)
        .is("consumed_at", null);
      await admin.from("signup_allowances").insert({
        email,
        access_code_id: code.id,
        expires_at: "2099-01-01T00:00:00Z",
      });
    }

    const { error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { role: "client" },
      user_metadata: { role: "client" },
    });
    if (error && !/already/i.test(error.message)) {
      console.error("inviteClientUser createUser", error.message);
    }
  } catch (e) {
    console.error("inviteClientUser failed", e);
  }
}
