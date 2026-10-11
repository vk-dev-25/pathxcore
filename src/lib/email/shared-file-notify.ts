import "server-only";

import { inviteClientUser } from "@/lib/auth/invite-client";
import { readEnv } from "@/lib/email/read-env";
import nodemailer from "nodemailer";
import { Resend } from "resend";

import { createServiceRoleClient } from "@/lib/supabase/admin";

function resendReady(): boolean {
  return Boolean(readEnv("RESEND_API_KEY") && readEnv("RESEND_FROM_EMAIL"));
}

function smtpReady(): boolean {
  return Boolean(
    readEnv("SMTP_HOST") && readEnv("SMTP_USER") && readEnv("SMTP_PASS"),
  );
}

async function sendMail(
  to: string[],
  subject: string,
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!to.length) return { ok: true };

  if (resendReady()) {
    try {
      const resend = new Resend(readEnv("RESEND_API_KEY"));
      const { error } = await resend.emails.send({
        from: readEnv("RESEND_FROM_EMAIL"),
        to,
        subject,
        text,
      });
      if (error) {
        console.error("shared-file-notify resend", error);
        return {
          ok: false,
          error:
            typeof error === "object" && error && "message" in error
              ? String((error as { message: string }).message)
              : "Resend rejected the email.",
        };
      }
      return { ok: true };
    } catch (e) {
      console.error("shared-file-notify resend threw", e);
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Resend send failed.",
      };
    }
  }

  if (smtpReady()) {
    try {
      const port = Number(readEnv("SMTP_PORT") || "587");
      const user = readEnv("SMTP_USER");
      const transporter = nodemailer.createTransport({
        host: readEnv("SMTP_HOST"),
        port,
        secure: port === 465,
        auth: { user, pass: readEnv("SMTP_PASS") },
        requireTLS: port === 587,
      });
      await transporter.sendMail({
        from: readEnv("SMTP_FROM") || `PathX <${user}>`,
        to: to.join(", "),
        subject,
        text,
      });
      return { ok: true };
    } catch (e) {
      console.error("shared-file-notify smtp threw", e);
      return {
        ok: false,
        error: e instanceof Error ? e.message : "SMTP send failed.",
      };
    }
  }

  console.warn(
    "shared-file-notify: no email provider configured (set RESEND_* or SMTP_*).",
  );
  return {
    ok: false,
    error: "No email provider configured (set RESEND_* or SMTP_*).",
  };
}

function appOrigin(): string {
  return (
    readEnv("NEXT_PUBLIC_SITE_URL") ||
    readEnv("NEXT_PUBLIC_APP_URL") ||
    "https://pathxdx.com"
  ).replace(/\/$/, "");
}

/** Email clients that a file was shared and how to sign in. */
export async function notifySharedFileAccess(input: {
  fileId: string;
  filename: string;
  emails: string[];
  expiresAt: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const emails = [
      ...new Set(
        input.emails
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
    if (!emails.length) return { ok: true };

    for (const email of emails) {
      await inviteClientUser(email);
    }

    const next = `/pathx/shared-files/${input.fileId}`;
    const signInUrl = `${appOrigin()}/pathx/client-sign-in?next=${encodeURIComponent(next)}`;
    const expiryLine = input.expiresAt
      ? `This file is available until ${new Date(input.expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.`
      : "This file has a limited access window set by PathX.";

    return await sendMail(
      emails,
      `PathX shared file: ${input.filename}`,
      [
        "Pathology X Diagnostic Services has shared a file with you.",
        "",
        `File: ${input.filename}`,
        expiryLine,
        "",
        "Sign in with this email (magic link, no password) to view and download it:",
        signInUrl,
        "",
        "If you did not expect this message, you can ignore it.",
      ].join("\n"),
    );
  } catch (e) {
    console.error("notifySharedFileAccess failed", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Notify failed.",
    };
  }
}

/** Used by cron / staff tools. */
export async function listSharedFileAccessEmails(
  fileId: string,
): Promise<string[]> {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("shared_file_access")
    .select("email")
    .eq("shared_file_id", fileId);
  return (data ?? [])
    .map((r) => (r.email as string)?.toLowerCase())
    .filter(Boolean);
}
