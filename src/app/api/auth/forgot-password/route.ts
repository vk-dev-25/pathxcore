import { NextResponse, type NextRequest } from "next/server";

import { validateAccessCodeForPasswordReset } from "@/lib/auth/access-code";
import {
  createAnonAuthClient,
  createServiceRoleClient,
} from "@/lib/supabase/service-role";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      { error: "An access code is required to reset your password." },
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

  const { error: codeErr } = await validateAccessCodeForPasswordReset(
    service,
    accessCode,
  );
  if (codeErr) {
    return NextResponse.json({ error: codeErr }, { status: 400 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    request.headers.get("origin") ??
    "http://localhost:3000";

  const redirect = new URL("/auth/callback", siteUrl.replace(/\/$/, ""));
  redirect.searchParams.set("next", "/pathx/update-password");

  let anon;
  try {
    anon = createAnonAuthClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 },
    );
  }

  const { error: resetErr } = await anon.auth.resetPasswordForEmail(email, {
    redirectTo: redirect.toString(),
  });

  if (resetErr) {
    console.error(resetErr);
    return NextResponse.json(
      { error: resetErr.message || "Could not send reset email." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
