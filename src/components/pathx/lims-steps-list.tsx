"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { pathxFieldClass as fieldClass } from "@/components/pathx/workspace-field-classes";

export type StepRow = {
  id: string;
  content: string;
  completed_at: string | null;
};

export function LimsStepsList({
  title,
  showTitle = true,
  steps,
  onAdd,
  onToggleComplete,
  onDelete,
}: {
  title: string;
  showTitle?: boolean;
  steps: StepRow[];
  onAdd: (content: string) => Promise<{ ok: boolean; error?: string }>;
  onToggleComplete: (stepId: string, completed: boolean) => Promise<{ ok: boolean; error?: string }>;
  onDelete: (stepId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {showTitle ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      ) : null}
      <ul className="space-y-2">
        {steps.map((s) => {
          const done = Boolean(s.completed_at);
          const toggling = toggleId === s.id;
          return (
            <li
              key={s.id}
              className="flex flex-wrap items-start gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 dark:border-white/[0.08] dark:bg-white/[0.02]"
            >
              <Button
                type="button"
                variant={done ? "default" : "outline"}
                size="icon"
                className="mt-0.5 h-8 w-8 shrink-0"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    setMsg(null);
                    setToggleId(s.id);
                    const res = await onToggleComplete(s.id, !done);
                    setToggleId(null);
                    if (!res.ok) setMsg(res.error ?? "Update failed");
                  })
                }
              >
                {toggling && pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <p
                className={cn(
                  "min-w-0 flex-1 text-sm leading-relaxed",
                  done && "text-muted-foreground line-through",
                )}
              >
                {s.content || "—"}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() =>
                  start(async () => {
                    setMsg(null);
                    const res = await onDelete(s.id);
                    if (!res.ok) setMsg(res.error ?? "Delete failed");
                  })
                }
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a workflow step…"
          className={cn("flex-1", fieldClass)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              start(async () => {
                if (!draft.trim()) return;
                setMsg(null);
                const res = await onAdd(draft.trim());
                if (res.ok) setDraft("");
                else setMsg(res.error ?? "Add failed");
              });
            }
          }}
        />
        <Button
          type="button"
          disabled={pending || !draft.trim()}
          onClick={() =>
            start(async () => {
              setMsg(null);
              const res = await onAdd(draft.trim());
              if (res.ok) setDraft("");
              else setMsg(res.error ?? "Add failed");
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add step
        </Button>
      </div>
      {msg ? <p className="text-xs text-destructive">{msg}</p> : null}
    </div>
  );
}
