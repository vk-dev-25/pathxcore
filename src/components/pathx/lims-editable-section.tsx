"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function LimsEditableSection({
  title,
  description,
  defaultOpen = true,
  className,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.08] bg-white/[0.02]",
        className,
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-2 rounded-t-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          {description ? (
            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-white/[0.06] px-3 py-3">{children}</div>
      ) : null}
    </div>
  );
}
