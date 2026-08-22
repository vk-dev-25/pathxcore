"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { pathxFieldClass as fieldClass } from "@/components/pathx/workspace-field-classes";

export type KvRow = { id: string; key: string; value: string };

function ValueCell({
  rowKey,
  initialValue,
  onCommit,
}: {
  rowKey: string;
  initialValue: string;
  onCommit: (value: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [val, setVal] = useState(initialValue);
  const [pending, start] = useTransition();
  useEffect(() => {
    setVal(initialValue);
  }, [initialValue, rowKey]);
  return (
    <Input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      disabled={pending}
      onBlur={() =>
        start(async () => {
          if (val === initialValue) return;
          await onCommit(val);
        })
      }
      className={cn("text-sm", fieldClass)}
    />
  );
}

export function LimsKeyValueEditor({
  title,
  showTitle = true,
  rows,
  onSave,
  onDelete,
}: {
  title: string;
  showTitle?: boolean;
  rows: KvRow[];
  onSave: (key: string, value: string) => Promise<{ ok: boolean; error?: string }>;
  onDelete: (metadataId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {showTitle ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      ) : null}
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
          >
            <Input
              readOnly
              value={r.key}
              className={cn("font-mono text-xs", fieldClass)}
            />
            <ValueCell
              rowKey={r.key}
              initialValue={r.value}
              onCommit={async (value) => {
                setMsg(null);
                const res = await onSave(r.key, value);
                if (!res.ok) setMsg(res.error ?? "Save failed");
                return res;
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="justify-self-end"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setMsg(null);
                  const res = await onDelete(r.id);
                  setMsg(res.ok ? null : res.error ?? "Delete failed");
                })
              }
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Key</Label>
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="e.g. Block type"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Value</Label>
          <Input
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            placeholder="e.g. FFPE"
            className={fieldClass}
          />
        </div>
        <Button
          type="button"
          disabled={pending || !newKey.trim()}
          onClick={() =>
            start(async () => {
              setMsg(null);
              const res = await onSave(newKey.trim(), newVal);
              if (res.ok) {
                setNewKey("");
                setNewVal("");
              } else setMsg(res.error ?? "Save failed");
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
      {msg ? <p className="text-xs text-destructive">{msg}</p> : null}
    </div>
  );
}
