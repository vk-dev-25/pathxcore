"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2 } from "lucide-react";
import { type EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/pathx")) return "/pathx/shared-files";
  if (raw.startsWith("//")) return "/pathx/shared-files";
  return raw;
}

function AuthConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token_hash = searchParams.get("token_hash")?.trim() || "";
  const type = (searchParams.get("type")?.trim() ||
    "magiclink") as EmailOtpType;
  const next = safeNextPath(searchParams.get("next"));
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(
    token_hash ? null : "This sign-in link is missing or invalid.",
  );

  async function continueSignIn() {
    if (!token_hash || working) return;
    setWorking(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (verifyError) {
      console.error("auth/confirm verifyOtp", verifyError.message);
      setWorking(false);
      setError(
        "That sign-in link expired or was already used. Request a new one below.",
      );
      return;
    }

    router.replace(next);
    router.refresh();
  }

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
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            className="w-full"
            disabled={!token_hash || working}
            onClick={() => void continueSignIn()}
          >
            {working ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Continue to shared file"
            )}
          </Button>
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

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={null}>
      <AuthConfirmInner />
    </Suspense>
  );
}
