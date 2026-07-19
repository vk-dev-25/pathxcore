import "server-only";

import type { TrackerRole } from "@/lib/trackers/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ViewerContext = {
  userId: string;
  email: string;
  role: TrackerRole;
};

/**
 * Resolve the signed-in user and whether they are a client (email present in
 * tracker_access with role 'client') or internal staff. Returns null if signed
 * out. Uses the service role to classify so it works for client users too.
 */
export async function getViewerContext(): Promise<ViewerContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const email = user.email.toLowerCase();

  let isClient = false;
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin
      .from("tracker_access")
      .select("id")
      .eq("role", "client")
      .eq("email", email)
      .limit(1);
    isClient = (data?.length ?? 0) > 0;
  } catch (e) {
    console.warn("getViewerContext: classification failed, defaulting staff", e);
  }

  return { userId: user.id, email, role: isClient ? "client" : "staff" };
}
