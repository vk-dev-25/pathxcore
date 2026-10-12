import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Confirm sign-in | PathXdx",
  description: "Confirm your PathXdx magic-link sign-in.",
};

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/pathx")) return "/pathx/shared-files";
  if (raw.startsWith("//")) return "/pathx/shared-files";
  return raw;
}

/**
 * Interstitial so email security scanners do not consume the one-time
 * token_hash before the real user clicks.
 */
export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
}) {
  const sp = await searchParams;
  const token_hash = sp.token_hash?.trim() || "";
  const type = sp.type?.trim() || "magiclink";
  const next = safeNextPath(sp.next ?? null);

  if (!token_hash) {
    redirect("/pathx/client-sign-in?error=auth");
  }

  const action = `/auth/callback?${new URLSearchParams({
    token_hash,
    type,
    next,
  }).toString()}`;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader>
          <CardTitle>Sign in to PathXdx</CardTitle>
          <CardDescription>
            Confirm to open the file PathXdx shared with you. This step stops
            email scanners from using your one-time link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={action} method="get">
            <Button type="submit" className="w-full">
              Continue to shared file
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Link already used?{" "}
            <Link
              href={`/pathx/client-sign-in?next=${encodeURIComponent(next)}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Request a new sign-in link
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
