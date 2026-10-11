import { isResendReady, sendContactViaResend } from "@/lib/email/contact-resend";
import { isSmtpReady, sendContactViaSmtp } from "@/lib/email/contact-smtp";

export type SendContactInput = {
  visitorEmail: string;
  message: string;
};

/** Resend is used when configured; otherwise SMTP if configured. */
export function isContactMailReady(): boolean {
  return isResendReady() || isSmtpReady();
}

export async function sendContactMail(
  input: SendContactInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isResendReady()) {
    return sendContactViaResend(input);
  }
  if (isSmtpReady()) {
    return sendContactViaSmtp(input);
  }
  return {
    ok: false,
    error:
      "Contact email is not configured. Set Resend (RESEND_API_KEY, RESEND_FROM_EMAIL, CONTACT_TO_EMAIL) or SMTP variables in .env.",
  };
}
