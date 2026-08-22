"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ContactUsFormProps = {
  variant?: "inline" | "dialog";
  className?: string;
};

const INQUIRY_TYPES = [
  "Digital pathology / image analysis",
  "Multiplex immunofluorescence",
  "Immunohistochemistry",
  "Histology / routine processing",
  "Pathologist evaluation",
  "Tissue bank inquiry",
  "International collaboration",
  "General inquiry",
] as const;

export function ContactUsForm({
  variant = "inline",
  className,
}: ContactUsFormProps) {
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;

    setStatus("loading");
    setErrorMsg("");

    const composed = inquiryType
      ? `Inquiry type: ${inquiryType}\n\n${message.trim()}`
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
      setEmail("");
      setInquiryType("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p
        className={cn(
          "text-sm text-muted-foreground",
          variant === "dialog" && "pr-8",
        )}
      >
        Thanks, we received your message and will get back to you soon.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-4", className)}
      noValidate
    >
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

      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@organization.com"
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-inquiry">Inquiry type</Label>
        <select
          id="contact-inquiry"
          name="inquiryType"
          required
          value={inquiryType}
          onChange={(e) => setInquiryType(e.target.value)}
          disabled={status === "loading"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select…</option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tissue type, targets, study stage, timeline…"
          disabled={status === "loading"}
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          At least 10 characters.
        </p>
      </div>

      {status === "error" && errorMsg ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
