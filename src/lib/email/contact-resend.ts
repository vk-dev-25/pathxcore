import { Resend } from "resend";

import { readEnv } from "@/lib/email/read-env";

export type SendContactResendInput = {
  visitorEmail: string;
  message: string;
};

function parseToList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function resendConfigured(): boolean {
  return Boolean(
    readEnv("RESEND_API_KEY") &&
      readEnv("RESEND_FROM_EMAIL") &&
      readEnv("CONTACT_TO_EMAIL"),
  );
}

export function isResendReady(): boolean {
  const key = Boolean(readEnv("RESEND_API_KEY"));
  const from = Boolean(readEnv("RESEND_FROM_EMAIL"));
  const to = Boolean(readEnv("CONTACT_TO_EMAIL"));

  if (process.env.NODE_ENV === "development" && key && (!from || !to)) {
    console.warn("[contact-resend] Set RESEND_FROM_EMAIL and CONTACT_TO_EMAIL:", {
      RESEND_FROM_EMAIL: from,
      CONTACT_TO_EMAIL: to,
    });
  }

  return key && from && to;
}

export async function sendContactViaResend(
  input: SendContactResendInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!resendConfigured()) {
    return {
      ok: false,
      error:
        "Resend is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and CONTACT_TO_EMAIL.",
    };
  }

  const apiKey = readEnv("RESEND_API_KEY");
  const from = readEnv("RESEND_FROM_EMAIL");
  const to = parseToList(readEnv("CONTACT_TO_EMAIL"));

  const preview =
    input.message.length > 80
      ? `${input.message.slice(0, 80)}…`
      : input.message;

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: input.visitorEmail,
      subject: `[pathxdx.com] Contact: ${preview.replace(/\s+/g, " ").trim()}`,
      text: [
        `From (visitor): ${input.visitorEmail}`,
        "",
        input.message,
        "",
        `— Sent via pathxdx.com contact form at ${new Date().toISOString()}`,
      ].join("\n"),
    });

    if (error) {
      console.error("sendContactViaResend", error);
      return {
        ok: false,
        error:
          error.message ||
          "Could not send message. Check Resend dashboard and domain verification.",
      };
    }

    return { ok: true };
  } catch (e) {
    console.error("sendContactViaResend", e);
    return { ok: false, error: "Could not send message. Please try again later." };
  }
}
