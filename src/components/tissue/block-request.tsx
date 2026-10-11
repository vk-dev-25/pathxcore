"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Plus, Sparkles, X } from "lucide-react";

import { ContactUsForm, type InquiryType } from "@/components/contact-us-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type RequestKind = "normal" | "cancer" | "disease" | "cell" | "mouse";

export type RequestItem = { kind: RequestKind; name: string };

const STORAGE_KEY = "pathx-block-request";

const KIND_LABEL: Record<RequestKind, string> = {
  normal: "Normal / control FFPE",
  cancer: "Cancer FFPE",
  disease: "Disease FFPE",
  cell: "Cell pellet block",
  mouse: "Mouse FFPE",
};

const sameItem = (a: RequestItem, b: RequestItem) =>
  a.kind === b.kind && a.name === b.name;

function readStored(): RequestItem[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Drop items saved by an older version of the page.
    return (parsed as RequestItem[]).filter((item) => item?.kind in KIND_LABEL);
  } catch {
    return [];
  }
}

/**
 * Request list shared by the Human FFPE and Cell pellet pages. Kept in
 * sessionStorage so it survives moving between the two pages; it still works
 * (per page) when storage is unavailable.
 */
export function useBlockRequest() {
  const [items, setItems] = useState<RequestItem[]>([]);

  useEffect(() => {
    setItems(readStored());
  }, []);

  const update = useCallback(
    (next: (items: RequestItem[]) => RequestItem[]) => {
      setItems((current) => {
        const value = next(current);
        try {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch {
          // Storage blocked: keep the in-memory list only.
        }
        return value;
      });
    },
    [],
  );

  const has = useCallback(
    (item: RequestItem) => items.some((i) => sameItem(i, item)),
    [items],
  );

  const toggle = useCallback(
    (item: RequestItem) =>
      update((current) =>
        current.some((i) => sameItem(i, item))
          ? current.filter((i) => !sameItem(i, item))
          : [...current, item],
      ),
    [update],
  );

  const clear = useCallback(() => update(() => []), [update]);

  return { items, has, toggle, clear };
}

export function AddToRequestButton({
  added,
  onClick,
  name,
  compact = false,
}: {
  added: boolean;
  onClick: () => void;
  name: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={added}
      aria-label={
        added ? `Remove ${name} from enquiry` : `Add ${name} to enquiry`
      }
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border text-xs font-medium transition-colors",
        compact ? "h-7 w-7 justify-center" : "h-8 px-2.5",
        added
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/80 text-muted-foreground hover:border-primary hover:text-primary",
      )}
    >
      {added ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Plus className="h-3.5 w-3.5" aria-hidden />
      )}
      {compact ? null : added ? "Added" : "Add"}
    </button>
  );
}

/** Inquiry type for a mixed enquiry list: the tissue type it is mostly about. */
function inquiryTypeFor(items: RequestItem[]): InquiryType {
  if (items.length > 0 && items.every((i) => i.kind === "cell")) {
    return "Cell pellet blocks";
  }
  if (items.length > 0 && items.every((i) => i.kind === "mouse")) {
    return "Mouse tissue";
  }
  return "Human FFPE tissue";
}

function buildMessage(items: RequestItem[]): string {
  const lines = ["Tissue block enquiry (research use only)", ""];
  for (const kind of [
    "normal",
    "cancer",
    "disease",
    "cell",
    "mouse",
  ] as const) {
    const group = items.filter((i) => i.kind === kind);
    if (!group.length) continue;
    lines.push(`${KIND_LABEL[kind]}:`);
    for (const i of group) lines.push(`- ${i.name}`);
    lines.push("");
  }
  lines.push(
    "Diagnosis or category needed:",
    "Number of blocks:",
    "Intended research use:",
  );
  return lines.join("\n");
}

/** Sticky bottom bar plus review dialog that pre-fills the contact form. */
export function BlockRequestBar({
  items,
  onToggle,
}: {
  items: RequestItem[];
  onToggle: (item: RequestItem) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {items.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm">
              <span className="font-semibold tabular-nums">{items.length}</span>{" "}
              <span className="text-muted-foreground">
                {items.length === 1 ? "item" : "items"} in your enquiry
              </span>
            </p>
            <Button
              type="button"
              className="font-semibold"
              onClick={() => setOpen(true)}
            >
              Review enquiry
              <ArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your enquiry</DialogTitle>
          </DialogHeader>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your enquiry is empty. Add tissues or cell lines to get started.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-border/70 rounded-lg border border-border/70 text-sm">
                {items.map((item) => (
                  <li
                    key={`${item.kind}:${item.name}`}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <span>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {KIND_LABEL[item.kind]}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggle(item)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" aria-hidden />
                      <span className="sr-only">Remove {item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                We reply with a specimen-level list and a quote. Add the
                diagnosis, block count, and research use below.
              </p>
              <ContactUsForm
                key={items.map((i) => `${i.kind}:${i.name}`).join("|")}
                variant="dialog"
                defaultInquiryType={inquiryTypeFor(items)}
                defaultMessage={buildMessage(items)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

const CUSTOM_TEMPLATE = [
  "Custom FFPE enquiry (research use only)",
  "",
  "Tissue / indication:",
  "Diagnosis details (subtype, stage, grade):",
  "Number of cases and blocks per case:",
  "Clinical data needed (e.g. treatment history):",
  "Timeline:",
].join("\n");

/** Contact form in a dialog, pre-filled with a request template. */
export function RequestFormDialog({
  open,
  onOpenChange,
  title,
  intro,
  template,
  inquiryType = "Human FFPE tissue",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  intro: string;
  template: string;
  inquiryType?: InquiryType;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{intro}</p>
        <ContactUsForm
          variant="dialog"
          defaultInquiryType={inquiryType}
          defaultMessage={template}
        />
      </DialogContent>
    </Dialog>
  );
}

/**
 * "Not listed? We source it" card. Opens the contact form with a custom
 * request template; partner biobanks cover tissue beyond the listed catalog.
 */
export function CustomRequestCard({
  title = "Need something not listed?",
  body = "We source FFPE tissue beyond this catalog through our partner biobanks, including specific subtypes, stages, and cases with treatment history.",
}: {
  title?: string;
  body?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-lab-purple/30 bg-gradient-to-br from-lab-purple/20 via-card to-primary/20 px-6 py-8 sm:px-8">
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-lab-purple/25 blur-3xl"
        aria-hidden
      />
      <span
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-lab-purple/20 text-lab-purple"
        aria-hidden
      >
        <Sparkles className="h-5 w-5" />
      </span>
      <h2 className="relative mt-4 text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      <Button
        type="button"
        className="relative mt-5 font-semibold"
        onClick={() => setOpen(true)}
      >
        Make a custom enquiry
        <ArrowRight aria-hidden />
      </Button>
      <RequestFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Custom enquiry"
        intro="Fill in what you can. We'll check our archive and partner biobanks and reply by email."
        template={CUSTOM_TEMPLATE}
      />
    </section>
  );
}

/** Button that opens the contact form pre-filled with a request template. */
export function RequestDialogButton({
  label,
  title,
  intro,
  template,
  variant = "default",
  className,
}: {
  label: string;
  title: string;
  intro: string;
  template: string;
  variant?: "default" | "outline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={cn("font-semibold", className)}
        onClick={() => setOpen(true)}
      >
        {label}
        <ArrowRight aria-hidden />
      </Button>
      <RequestFormDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        intro={intro}
        template={template}
      />
    </>
  );
}
