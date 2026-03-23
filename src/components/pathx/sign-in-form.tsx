"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

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

export function PathXSignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/pathx";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(
    authError ? "We could not complete sign-in. Try again." : null,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);

    const supabase = createClient();
    const origin = window.location.origin;
    const redirect = new URL("/auth/callback", origin);
    redirect.searchParams.set("next", next.startsWith("/pathx") ? next : "/pathx");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirect.toString(),
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the sign-in link.");
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          We&apos;ll email you a secure link to access PathX modules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.com"
            />
          </div>
          {message ? (
            <p
              className={
                status === "error" || authError
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
            >
              {message}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
