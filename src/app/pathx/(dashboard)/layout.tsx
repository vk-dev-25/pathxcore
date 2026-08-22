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

  const clientMode =
    (user?.app_metadata as { role?: string } | null)?.role === "client";

  return (
    <PathXShell email={user?.email} clientMode={clientMode}>
      {children}
    </PathXShell>
  );
}
