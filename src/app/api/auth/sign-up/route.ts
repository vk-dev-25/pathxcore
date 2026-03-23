import { NextResponse, type NextRequest } from "next/server";

import { grantSignupAllowance } from "@/lib/auth/access-code";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step 1 of password sign-up: validate access code and create signup_allowances.
 * The client must immediately call supabase.auth.signUp({ email, password }) so the
 * auth.users insert passes the database trigger.
 */
export async function POST(request: NextRequest) {
  let body: { email?: string; accessCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const accessCode =
    typeof body.accessCode === "string" ? body.accessCode.trim() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid work email is required." },
      { status: 400 },
    );
  }

  if (!accessCode) {
    return NextResponse.json(
      { error: "An access code is required to create an account." },
      { status: 400 },
    );
  }

  let service;
  try {
    service = createServiceRoleClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 },
    );
  }

  const { error } = await grantSignupAllowance(service, email, accessCode);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
