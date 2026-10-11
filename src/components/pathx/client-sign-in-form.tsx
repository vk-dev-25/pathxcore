"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClientSignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("working");
    setMessage(null);

    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
          "/pathx/trackers",
        )}`,
      },
    });

    if (error && !/not found|signups? not allowed/i.test(error.message)) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    // Always show a generic message so we never reveal which emails exist.
    setStatus("sent");
    setMessage(
      "If your email has access, we sent a sign-in link. Check your inbox (and spam).",
    );
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle>Client sign in</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a secure sign-in link — no
          password needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={requestLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-email">Email address</Label>
            <Input
              id="client-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          {message ? (
            <p
              className={
                status === "error"
                  ? "text-sm text-destructive"
                  : status === "sent"
                    ? "text-sm font-medium text-primary"
                    : "text-sm text-muted-foreground"
              }
            >
              {message}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            disabled={status === "working"}
          >
            {status === "working" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {status === "working" ? "Sending…" : "Email me a sign-in link"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Only invited client emails can sign in.
          </p>
        </form>
        <div className="border-t border-border pt-4 text-center text-sm">
          <span className="text-muted-foreground">PathX team member? </span>
          <Link href="/pathx/sign-in" className="font-medium text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
