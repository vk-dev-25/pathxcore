"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function PathXSignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/pathx/sign-in");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => signOut()}>
      Sign out
    </Button>
  );
}
