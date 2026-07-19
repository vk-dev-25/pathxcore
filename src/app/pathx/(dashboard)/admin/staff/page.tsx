import type { Metadata } from "next";

import { StaffAdminClient } from "@/components/pathx/staff-admin-client";
import { listStaffMembers } from "@/lib/staff/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "PathX staff | PathX",
  description: "Maintain the allowlist of PathX employee accounts.",
};

export default async function StaffAdminPage() {
  const supabase = await createClient();
  const [{ data: userData }, staff] = await Promise.all([
    supabase.auth.getUser(),
    listStaffMembers(),
  ]);

  return (
    <StaffAdminClient
      initialStaff={staff.members}
      ready={staff.ready}
      currentEmail={(userData.user?.email ?? "").toLowerCase()}
    />
  );
}
