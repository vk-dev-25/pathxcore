import "server-only";

import nodemailer from "nodemailer";
import { Resend } from "resend";

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
  to: string[],
  subject: string,
  text: string,
): Promise<void> {
  if (!to.length) return;

  if (resendReady()) {
    try {
      const resend = new Resend(readEnv("RESEND_API_KEY"));
      const { error } = await resend.emails.send({
        from: readEnv("RESEND_FROM_EMAIL"),
        to,
        subject,
        text,
      });
      if (error) console.error("tracker-notify resend", error);
      return;
    } catch (e) {
      console.error("tracker-notify resend threw", e);
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
      return;
    } catch (e) {
      console.error("tracker-notify smtp threw", e);
    }
  }

  console.warn(
    "tracker-notify: no email provider configured (set RESEND_* or SMTP_*).",
  );
}

function appOrigin(): string {
  return (
    readEnv("NEXT_PUBLIC_SITE_URL") ||
    readEnv("NEXT_PUBLIC_APP_URL") ||
    "https://pathxdx.com"
  ).replace(/\/$/, "");
}

/**
 * Email everyone with access to a tracker (staff + clients) about a change,
 * excluding the person who made it. Never throws.
 */
export async function notifyTrackerChange(input: {
  trackerId: string;
  actorEmail: string | null | undefined;
  summary: string;
}): Promise<void> {
  try {
    const admin = createServiceRoleClient();

    const { data: tracker } = await admin
      .from("trackers")
      .select("id, title, clients(org_name)")
      .eq("id", input.trackerId)
      .maybeSingle();
    if (!tracker) return;

    const { data: access } = await admin
      .from("tracker_access")
      .select("email")
      .eq("tracker_id", input.trackerId);

    const actor = (input.actorEmail ?? "").trim().toLowerCase();
    const recipients = Array.from(
      new Set(
        (access ?? [])
          .map((a) => (a.email as string).trim())
          .filter(Boolean),
      ),
    ).filter((e) => e.toLowerCase() !== actor);

    if (!recipients.length) return;

    const clientRel = tracker.clients as { org_name?: string } | { org_name?: string }[] | null;
    const clientName = Array.isArray(clientRel)
      ? clientRel[0]?.org_name
      : clientRel?.org_name;
    const name = clientName || (tracker.title as string) || "Project tracker";
    const link = `${appOrigin()}/pathx/trackers/${input.trackerId}`;

    const subject = `[PathX Tracker] ${name} updated`;
    const text = [
      `${input.actorEmail || "Someone"} updated the "${name}" project tracker.`,
      "",
      input.summary,
      "",
      `Open the tracker: ${link}`,
    ].join("\n");

    await sendMail(recipients, subject, text);
  } catch (e) {
    console.error("notifyTrackerChange failed", e);
  }
}
