import type { Metadata } from "next";

import { ClientSignInForm } from "@/components/pathx/client-sign-in-form";

export const metadata: Metadata = {
  title: "Client sign in | PathX",
  description: "Get a secure magic link to view your PathX project tracker.",
};

export default function PathXClientSignInPage() {
  return <ClientSignInForm />;
}
