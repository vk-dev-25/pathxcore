import { NextResponse } from "next/server";

import "@/lib/email/read-env";
import { isContactMailReady, sendContactMail } from "@/lib/email/contact-send";

const EMAIL_MAX = 320;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 10_000;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(request: Request) {
  if (!isContactMailReady()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Contact by email is not configured on the server. (Missing Resend or SMTP settings.)",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;

  const trap =
    typeof record.website === "string" ? record.website.trim() : "";
  if (trap.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const email =
    typeof record.email === "string" ? record.email.trim() : "";
  const message =
    typeof record.message === "string" ? record.message.trim() : "";

  if (!email || email.length > EMAIL_MAX || !isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (message.length < MESSAGE_MIN) {
    return NextResponse.json(
      { ok: false, error: `Message must be at least ${MESSAGE_MIN} characters.` },
      { status: 400 },
    );
  }

  if (message.length > MESSAGE_MAX) {
    return NextResponse.json(
      { ok: false, error: "Message is too long." },
      { status: 400 },
    );
  }

  const sent = await sendContactMail({ visitorEmail: email, message });
  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: sent.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
