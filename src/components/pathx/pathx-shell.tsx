import Link from "next/link";

import { AdminThemeToggle } from "@/components/pathx/admin-theme-toggle";
import { PathXNav } from "@/components/pathx/pathx-nav";
import { PathXSignOutButton } from "@/components/pathx/sign-out-button";
import { Button } from "@/components/ui/button";

export function PathXShell({
  email,
  clientMode = false,
  children,
}: {
  email: string | null | undefined;
  clientMode?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={clientMode ? "/pathx/trackers" : "/pathx"}
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              PathX workspace
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {email ?? "Signed in"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AdminThemeToggle className="shrink-0" />
            <Button asChild variant="ghost" size="sm">
              <Link href="/">PathX Website</Link>
            </Button>
            <PathXSignOutButton />
          </div>
        </div>
      </header>
      <PathXNav clientMode={clientMode} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
