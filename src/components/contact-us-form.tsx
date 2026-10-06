"use client";

import { useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ContactUsFormProps = {
  variant?: "inline" | "dialog";
  className?: string;
  /** Pre-selects an inquiry type, e.g. from the tissue block request list. */
  defaultInquiryType?: InquiryType;
  /** Pre-fills the message body. */
  defaultMessage?: string;
};

/** Tissue first: these lead the chip list and get colored dots. */
const TISSUE_TYPES = [
  "Human FFPE tissue",
  "Cell pellet blocks",
  "Mouse tissue",
] as const;

const OTHER_TYPES = [
  "Histology / routine processing",
  "Immunohistochemistry",
  "Multiplex immunofluorescence",
  "Pathologist evaluation",
  "Whole-slide scanning",
  "Partnership",
  "General inquiry",
] as const;

const INQUIRY_TYPES = [...TISSUE_TYPES, ...OTHER_TYPES] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

const TISSUE_DOT: Record<(typeof TISSUE_TYPES)[number], string> = {
  "Human FFPE tissue": "bg-fuchsia-500",
  "Cell pellet blocks": "bg-amber-500",
  "Mouse tissue": "bg-sky-500",
};

const MESSAGE_MIN = 10;

/** Visible outline for fields: the theme's input color is white in light mode. */
const FIELD =
  "border-border bg-background shadow-sm focus-visible:border-primary";

function InquiryChip({
  label,
  dot,
  selected,
  disabled,
  onSelect,
}: {
  label: string;
  dot?: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border/80 bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {dot ? (
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            selected ? "bg-primary-foreground" : dot,
          )}
          aria-hidden
        />
      ) : null}
      {label}
    </button>
  );
}

export function ContactUsForm({
  variant = "inline",
  className,
  defaultInquiryType,
  defaultMessage,
}: ContactUsFormProps) {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState<string>(
    defaultInquiryType ?? "",
  );
  const [message, setMessage] = useState(defaultMessage ?? "");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const loading = status === "loading";
  const inline = variant === "inline";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;

    setStatus("loading");
    setErrorMsg("");

    // The API takes one message body; name, organization, and inquiry type
    // are prepended so the team sees them at the top of the email.
    const header = [
      name.trim() ? `Name: ${name.trim()}` : null,
      organization.trim() ? `Organization: ${organization.trim()}` : null,
      inquiryType ? `Inquiry type: ${inquiryType}` : null,
    ].filter(Boolean);
    const composed = header.length
      ? `${header.join("\n")}\n\n${message.trim()}`
      : message.trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: composed,
          website: honeypot,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again.",
        );
        return;
      }

      setStatus("success");
      setName("");
      setOrganization("");
      setEmail("");
      setInquiryType("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  const shell = (children: React.ReactNode) =>
    inline ? (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg",
          className,
        )}
      >
        <div
          className="h-1 bg-gradient-to-r from-[#3b1f6e] via-[#8e3fa0] to-[#f08bb8]"
          aria-hidden
        />
        <div className="p-6 sm:p-7">{children}</div>
      </div>
    ) : (
      <div className={className}>{children}</div>
    );

  if (status === "success") {
    return shell(
      <div
        className={cn(
          "flex flex-col items-center py-6 text-center",
          !inline && "pr-8",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-4 text-lg font-semibold">Message sent</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Thanks, we received your message and will get back to you by email.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </Button>
      </div>,
    );
  }

  const messageLength = message.trim().length;

  return shell(
    <>
      {inline ? (
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Send us a message
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what you need and we&apos;ll reply by email.
          </p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name">
              Name{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
              className={FIELD}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-org">
              Organization{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="contact-org"
              name="organization"
              autoComplete="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Company or institution"
              disabled={loading}
              className={FIELD}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="contact-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.com"
              disabled={loading}
              className={cn(FIELD, "pl-9")}
            />
          </div>
        </div>

        <fieldset className="space-y-2.5">
          <legend className="text-sm font-medium leading-none">
            What can we help with?
          </legend>
          <div
            role="radiogroup"
            aria-label="Tissue blocks"
            className="flex flex-wrap gap-2 pt-1"
          >
            {TISSUE_TYPES.map((t) => (
              <InquiryChip
                key={t}
                label={t}
                dot={TISSUE_DOT[t]}
                selected={inquiryType === t}
                disabled={loading}
                onSelect={() => setInquiryType(inquiryType === t ? "" : t)}
              />
            ))}
          </div>
          <div
            role="radiogroup"
            aria-label="Services and other"
            className="flex flex-wrap gap-2"
          >
            {OTHER_TYPES.map((t) => (
              <InquiryChip
                key={t}
                label={t}
                selected={inquiryType === t}
                disabled={loading}
                onSelect={() => setInquiryType(inquiryType === t ? "" : t)}
              />
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            name="message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tissue or indication, quantity, format, timeline…"
            disabled={loading}
            rows={inline ? 6 : 8}
            className={FIELD}
          />
          <p
            className={cn(
              "text-xs tabular-nums",
              messageLength > 0 && messageLength < MESSAGE_MIN
                ? "text-amber-700 dark:text-amber-400"
                : "text-muted-foreground",
            )}
          >
            {messageLength < MESSAGE_MIN
              ? `At least ${MESSAGE_MIN} characters (${messageLength} so far)`
              : `${messageLength} characters`}
          </p>
        </div>

        {status === "error" && errorMsg ? (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {errorMsg}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full font-semibold"
        >
          {loading ? "Sending…" : "Send message"}
          {loading ? null : <Send aria-hidden />}
        </Button>
      </form>
    </>,
  );
}
