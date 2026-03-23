import type { Metadata } from "next";
import { Suspense } from "react";

import { UpdatePasswordForm } from "@/components/pathx/update-password-form";

export const metadata: Metadata = {
  title: "Update password | PathX",
  description: "Set a new password for your PathX workspace account.",
};

function FormFallback() {
  return (
    <div className="h-48 w-full max-w-md animate-pulse rounded-xl border border-border bg-card" />
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<FormFallback />}>
      <UpdatePasswordForm />
    </Suspense>
  );
}
