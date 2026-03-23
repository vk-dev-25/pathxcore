import Link from "next/link";

import { PathXNav } from "@/components/pathx/pathx-nav";
import { PathXSignOutButton } from "@/components/pathx/sign-out-button";
import { Button } from "@/components/ui/button";

export function PathXShell({
  email,
  children,
}: {
  email: string | null | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/pathx"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              PathX workspace
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {email ?? "Signed in"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">PathX Website</Link>
            </Button>
            <PathXSignOutButton />
          </div>
        </div>
      </header>
      <PathXNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
