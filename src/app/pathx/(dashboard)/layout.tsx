import { PathXShell } from "@/components/pathx/pathx-shell";
import { createClient } from "@/lib/supabase/server";

export default async function PathXDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PathXShell email={user?.email}>{children}</PathXShell>
  );
}
