import type { Metadata } from "next";
import { Suspense } from "react";

import { PathXSignInForm } from "@/components/pathx/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in | PathX",
  description:
    "Sign in with email and password, or create an account with an access code.",
};

function SignInFormFallback() {
  return (
    <div className="h-48 w-full max-w-md animate-pulse rounded-xl border border-border bg-card" />
  );
}

export default function PathXSignInPage() {
  return (
    <Suspense fallback={<SignInFormFallback />}>
      <PathXSignInForm />
    </Suspense>
  );
}
