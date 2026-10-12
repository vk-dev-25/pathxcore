import "server-only";

import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { Resend } from "resend";

import { inviteClientUser } from "@/lib/auth/invite-client";
import { readEnv } from "@/lib/email/read-env";
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
  to: string,
  subject: string,
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!to) return { ok: true };

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
        to,
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

/**
 * Prefer the host that handled the share action (localhost in local dev),
 * not NEXT_PUBLIC_SITE_URL — otherwise local shares email production links.
 */
async function appOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "").trim();
    if (host) {
      const forwarded = (h.get("x-forwarded-proto") || "").split(",")[0]?.trim();
      const proto =
        forwarded ||
        (host.startsWith("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // Outside a request context (scripts / cron).
  }

  const raw = (
    readEnv("NEXT_PUBLIC_SITE_URL") ||
    readEnv("NEXT_PUBLIC_APP_URL") ||
    "https://pathxdx.com"
  ).replace(/\/$/, "");
  if (/^http:\/\/(www\.)?pathxdx\.com$/i.test(raw)) {
    return raw.replace(/^http:/i, "https:");
  }
  return raw;
}

async function magicLinkForEmail(
  email: string,
  nextPath: string,
  origin: string,
): Promise<string | null> {
  try {
    const admin = createServiceRoleClient();
    // Link to /auth/confirm (not /auth/callback) so inbox link-scanners do not
    // burn the one-time token. Confirm page then sends the user to callback.
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) {
      console.error("shared-file-notify generateLink", error.message);
      return null;
    }
    const hashed = data?.properties?.hashed_token;
    if (!hashed) {
      console.error("shared-file-notify generateLink missing hashed_token");
      return null;
    }
    const params = new URLSearchParams({
      token_hash: hashed,
      type: "magiclink",
      next: nextPath,
    });
    return `${origin}/auth/confirm?${params.toString()}`;
  } catch (e) {
    console.error("shared-file-notify generateLink threw", e);
    return null;
  }
}

/** Email each client a one-click magic sign-in link to the shared file. */
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

    const origin = await appOrigin();
    const next = `/pathx/shared-files/${input.fileId}`;
    const signInFallback = `${origin}/pathx/client-sign-in?next=${encodeURIComponent(next)}`;
    const expiryLine = input.expiresAt
      ? `This file is available until ${new Date(input.expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.`
      : "This file has a limited access window set by PathX.";

    const failures: string[] = [];

    for (const email of emails) {
      await inviteClientUser(email);
      const magicLink = await magicLinkForEmail(email, next, origin);

      const body = magicLink
        ? [
            "Pathology X Diagnostic Services has shared a file with you.",
            "",
            `File: ${input.filename}`,
            expiryLine,
            "",
            "Click this secure magic link to sign in (no password) and open the file:",
            magicLink,
            "",
            "This link expires shortly and can only be used once. If it no longer works, request a new one here:",
            signInFallback,
            "",
            "If you did not expect this message, you can ignore it.",
          ].join("\n")
        : [
            "Pathology X Diagnostic Services has shared a file with you.",
            "",
            `File: ${input.filename}`,
            expiryLine,
            "",
            "Open this page and request a magic sign-in link with this email:",
            signInFallback,
            "",
            "If you did not expect this message, you can ignore it.",
          ].join("\n");

      const sent = await sendMail(
        email,
        `PathXdx shared file: ${input.filename}`,
        body,
      );
      if (!sent.ok) failures.push(`${email}: ${sent.error}`);
      if (!magicLink) {
        failures.push(`${email}: could not generate magic link (sent fallback).`);
      }
    }

    if (failures.length === emails.length) {
      return { ok: false, error: failures.join(" ") };
    }
    if (failures.length) {
      return { ok: false, error: failures.join(" ") };
    }
    return { ok: true };
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
