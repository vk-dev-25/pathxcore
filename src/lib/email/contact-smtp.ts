import nodemailer from "nodemailer";

import { readEnv } from "@/lib/email/read-env";

export type SendContactSmtpInput = {
  visitorEmail: string;
  message: string;
};

function smtpConfigured(): boolean {
  const hasHost = Boolean(readEnv("SMTP_HOST"));
  const hasUser = Boolean(readEnv("SMTP_USER"));
  const hasPass = Boolean(readEnv("SMTP_PASS"));
  const hasTo = Boolean(readEnv("CONTACT_TO_EMAIL"));

  if (
    process.env.NODE_ENV === "development" &&
    !(hasHost && hasUser && hasPass && hasTo) &&
    !readEnv("RESEND_API_KEY")
  ) {
    console.warn("[contact-smtp] Missing SMTP env (restart `npm run dev` after editing .env):", {
      SMTP_HOST: hasHost,
      SMTP_USER: hasUser,
      SMTP_PASS: hasPass,
      CONTACT_TO_EMAIL: hasTo,
    });
  }

  return hasHost && hasUser && hasPass && hasTo;
}

export function isSmtpReady(): boolean {
  return smtpConfigured();
}

/**
 * Sends contact form mail using SMTP (Google Workspace / etc.).
 * Requires: SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL.
 * Optional: SMTP_PORT (default 587), SMTP_FROM (default PathXdx <SMTP_USER>).
 */
export async function sendContactViaSmtp(
  input: SendContactSmtpInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!smtpConfigured()) {
    return {
      ok: false,
      error:
        "Contact email is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and CONTACT_TO_EMAIL in .env.",
    };
  }

  const host = readEnv("SMTP_HOST");
  const port = Number(readEnv("SMTP_PORT") || "587");
  const user = readEnv("SMTP_USER");
  const pass = readEnv("SMTP_PASS");
  const to = readEnv("CONTACT_TO_EMAIL");
  const from = readEnv("SMTP_FROM") || `PathXdx <${user}>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    requireTLS: port === 587,
  });

  const preview =
    input.message.length > 80
      ? `${input.message.slice(0, 80)}…`
      : input.message;

  try {
    await transporter.sendMail({
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
    return { ok: true };
  } catch (e: unknown) {
    console.error("sendContactViaSmtp", e);
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code: unknown }).code)
        : "";
    if (code === "EAUTH") {
      return {
        ok: false,
        error:
          "Mail server rejected the sign-in. For Gmail / Google Workspace, use an App Password (Google Account → Security → 2-Step Verification → App passwords), not your normal password.",
      };
    }
    return { ok: false, error: "Could not send message. Please try again later." };
  }
}
