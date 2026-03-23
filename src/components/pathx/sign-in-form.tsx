"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

type Mode = "signin" | "signup" | "forgot";

export function PathXSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/pathx";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "working" | "sent" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(
    authError ? "We could not complete sign-in. Try again." : null,
  );

  const nextPath = next.startsWith("/pathx") ? next : "/pathx";

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("working");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  async function signUpWithAccount(e: React.FormEvent) {
    e.preventDefault();
    setStatus("working");
    setMessage(null);

    const trimmedEmail = email.trim();
    if (password.length < 8) {
      setStatus("error");
      setMessage("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (!accessCode.trim()) {
      setStatus("error");
      setMessage("An access code is required to create an account.");
      return;
    }

    const prepare = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail,
        accessCode: accessCode.trim(),
      }),
    });

    const prepareData = (await prepare.json()) as { ok?: boolean; error?: string };

    if (!prepare.ok) {
      setStatus("error");
      setMessage(prepareData.error ?? "Could not start sign-up.");
      return;
    }

    const supabase = createClient();
    const origin = window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    // Always show the sign-in step; clear any session from signUp() so middleware
    // does not redirect away from this page before the user signs in explicitly.
    await supabase.auth.signOut();

    setPassword("");
    setConfirmPassword("");
    setAccessCode("");
    setMode("signin");
    setStatus("sent");
    setMessage(
      data.session
        ? "Account created successfully. Sign in below with your email and password."
        : "Account created. Confirm your email if we sent a link, then sign in below with your email and password.",
    );
  }

  async function requestPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setStatus("working");
    setMessage(null);

    if (!accessCode.trim()) {
      setStatus("error");
      setMessage("An access code is required to reset your password.");
      return;
    }

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        accessCode: accessCode.trim(),
      }),
    });

    const data = (await res.json()) as { ok?: boolean; error?: string };

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Could not send reset email.");
      return;
    }

    setStatus("sent");
    setMessage(
      "If an account exists for that email, we sent a link to set a new password.",
    );
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle>
          {mode === "signin" && "Sign in"}
          {mode === "signup" && "Create account"}
          {mode === "forgot" && "Reset password"}
        </CardTitle>
        <CardDescription>
          {mode === "signin" &&
            "Use your work email and password to open PathX modules."}
          {mode === "signup" &&
            "New accounts need an access code from your organization, then you choose a password."}
          {mode === "forgot" &&
            "Enter your email and access code. We will email you a link to set a new password."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === "signin" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("signin");
              setMessage(null);
              setStatus("idle");
            }}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("signup");
              setMessage(null);
              setStatus("idle");
            }}
          >
            Create account
          </Button>
          <Button
            type="button"
            variant={mode === "forgot" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("forgot");
              setMessage(null);
              setStatus("idle");
            }}
          >
            Forgot password
          </Button>
        </div>

        {mode === "signin" ? (
          <form onSubmit={signInWithPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Work email</Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {message ? (
              <p
                className={
                  status === "error" || authError
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
              {status === "working" ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        ) : null}

        {mode === "signup" ? (
          <form onSubmit={signUpWithAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Work email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-access">Access code</Label>
              <Input
                id="signup-access"
                name="accessCode"
                type="text"
                autoComplete="off"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="From your organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm">Confirm password</Label>
              <Input
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {message ? (
              <p
                className={
                  status === "error"
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
              disabled={status === "working"}
            >
              {status === "working" ? "Creating account…" : "Create account"}
            </Button>
          </form>
        ) : null}

        {mode === "forgot" ? (
          <form onSubmit={requestPasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Work email</Label>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-access">Access code</Label>
              <Input
                id="forgot-access"
                name="accessCode"
                type="text"
                autoComplete="off"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Same type of code used for signup"
              />
            </div>
            {message ? (
              <p
                className={
                  status === "error"
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
              disabled={status === "working"}
            >
              {status === "working" ? "Sending…" : "Email me a reset link"}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
