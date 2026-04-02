"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Plus, Printer, Save, Trash2 } from "lucide-react";

import type { LimsSlideLabelPayload } from "@/components/pathx/lims-slide-label-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLimsSlidesBulkAction } from "@/lib/lims/create-slides-bulk-action";
import { deleteLimsSlideAction } from "@/lib/lims/delete-slide-action";
import type { LimsSampleDetail } from "@/lib/lims/get-lims-project-detail-action";
import {
  deleteLimsSlideMetadataAction,
  upsertLimsSlideMetadataAction,
} from "@/lib/lims/slide-metadata-actions";
import { updateLimsSlideNotesAction } from "@/lib/lims/update-slide-notes-action";
import { cn } from "@/lib/utils";

import { pathxFieldClass as fieldClass } from "@/components/pathx/workspace-field-classes";

const cellPad = "border-b border-border p-2 align-top dark:border-white/[0.06]";
const headCell =
  "sticky top-0 z-[1] border-b border-border bg-muted px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide dark:border-white/[0.08] dark:bg-muted";

function SlideMetadataStack({
  projectId,
  slideId,
  rows,
  onRefresh,
}: {
  projectId: string;
  slideId: string;
  rows: { id: string; key: string; value: string }[];
  onRefresh: () => void;
}) {
  const [pending, start] = useTransition();
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex min-w-[180px] max-w-[220px] flex-col gap-2">
      <div className="max-h-40 space-y-1.5 overflow-y-auto pr-0.5">
        {rows.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No fields</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[1fr_auto] gap-1">
              <div className="space-y-0.5">
                <Input
                  readOnly
                  value={r.key}
                  className={cn("h-7 font-mono text-[10px]", fieldClass)}
                />
                <MetadataValueBlur
                  rowKey={r.key}
                  initial={r.value}
                  projectId={projectId}
                  slideId={slideId}
                  disabled={pending}
                  onDone={() => {
                    setMsg(null);
                    onRefresh();
                  }}
                  onError={(e) => setMsg(e)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 self-start"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    setMsg(null);
                    const res = await deleteLimsSlideMetadataAction({
                      projectId,
                      slideId,
                      metadataId: r.id,
                    });
                    if (!res.ok) setMsg(res.error ?? "Delete failed");
                    else onRefresh();
                  })
                }
              >
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          ))
        )}
      </div>
      <div className="space-y-1 border-t border-border pt-2 dark:border-white/[0.06]">
        <div className="grid gap-1">
          <Input
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className={cn("h-7 text-xs", fieldClass)}
          />
          <Input
            placeholder="Value"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            className={cn("h-7 text-xs", fieldClass)}
          />
        </div>
        <Button
          type="button"
          size="sm"
          className="h-7 w-full text-xs"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setMsg(null);
              const res = await upsertLimsSlideMetadataAction({
                projectId,
                slideId,
                key: newKey,
                value: newVal,
              });
              if (!res.ok) setMsg(res.error ?? "Save failed");
              else {
                setNewKey("");
                setNewVal("");
                onRefresh();
              }
            })
          }
        >
          <Plus className="mr-1 h-3 w-3" />
          Add field
        </Button>
      </div>
      {msg ? <p className="text-[10px] text-destructive">{msg}</p> : null}
    </div>
  );
}

function MetadataValueBlur({
  rowKey,
  initial,
  projectId,
  slideId,
  disabled,
  onDone,
  onError,
}: {
  rowKey: string;
  initial: string;
  projectId: string;
  slideId: string;
  disabled: boolean;
  onDone: () => void;
  onError: (e: string) => void;
}) {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    setVal(initial);
  }, [initial, rowKey]);
  return (
    <Input
      value={val}
      disabled={disabled}
      onChange={(e) => setVal(e.target.value)}
      className={cn("h-7 text-xs", fieldClass)}
      onBlur={() => {
        if (val === initial) return;
        void (async () => {
          const res = await upsertLimsSlideMetadataAction({
            projectId,
            slideId,
            key: rowKey,
            value: val,
          });
          if (!res.ok) onError(res.error ?? "Save failed");
          else onDone();
        })();
      }}
    />
  );
}

export function LimsSampleSlidesDialog({
  open,
  onOpenChange,
  projectId,
  sampleReference,
  sample,
  onRefresh,
  onOpenLabel,
  onPrintAllLabels,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  sampleReference: string;
  sample: LimsSampleDetail;
  onRefresh: () => void;
  onOpenLabel: (p: LimsSlideLabelPayload) => void;
  onPrintAllLabels: (payloads: LimsSlideLabelPayload[]) => void;
}) {
  const [pending, start] = useTransition();
  const [bulkCount, setBulkCount] = useState("1");
  const [notesBySlide, setNotesBySlide] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const sl of sample.slides) {
      next[sl.id] = sl.notes ?? "";
    }
    setNotesBySlide(next);
  }, [sample.slides]);

  function notesFor(slideId: string) {
    return notesBySlide[slideId] ?? "";
  }

  function setNotes(slideId: string, v: string) {
    setNotesBySlide((m) => ({ ...m, [slideId]: v }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-[min(1200px,96vw)] flex-col gap-0 overflow-hidden border-border bg-background p-0 shadow-2xl duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-3 dark:border-white/[0.08]">
          <DialogTitle className="font-mono text-base">
            Slides · {sampleReference}
          </DialogTitle>
        </DialogHeader>

        <div className="flex shrink-0 flex-wrap items-end gap-2 border-b border-border px-4 py-3 dark:border-white/[0.06]">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Create count</Label>
            <Input
              type="number"
              min={1}
              max={200}
              className={cn("w-20", fieldClass)}
              value={bulkCount}
              onChange={(e) => setBulkCount(e.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const n = Math.max(1, Math.min(200, parseInt(bulkCount, 10) || 0));
                const res = await createLimsSlidesBulkAction({
                  projectId,
                  sampleId: sample.id,
                  count: n,
                });
                if (res.ok) {
                  setBulkCount("1");
                  onRefresh();
                }
              })
            }
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create slides
          </Button>
          {sample.slides.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onPrintAllLabels(
                  sample.slides.map((sl) => ({
                    slideReference: sl.slide_reference,
                    sampleReference,
                    createdAt: sl.created_at,
                  })),
                )
              }
            >
              <Printer className="mr-2 h-4 w-4" />
              Print all labels
            </Button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {sample.slides.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No slides yet. Use Create slides above.
            </p>
          ) : (
            <table className="w-max min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={cn(headCell, "sticky left-0 z-[2] min-w-[120px]")}>
                    Slide ID
                  </th>
                  <th className={cn(headCell, "min-w-[200px]")}>Notes</th>
                  <th className={cn(headCell, "min-w-[200px]")}>Metadata</th>
                  <th className={cn(headCell, "w-24")}>Save notes</th>
                  <th className={cn(headCell, "w-24")}>Print</th>
                  <th className={cn(headCell, "w-24")}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {sample.slides.map((sl) => (
                  <tr key={sl.id}>
                    <td
                      className={cn(
                        cellPad,
                        "sticky left-0 z-[1] bg-background font-mono text-xs",
                      )}
                    >
                      {sl.slide_reference}
                    </td>
                    <td className={cellPad}>
                      <textarea
                        className={cn(
                          "min-h-[72px] w-full min-w-[180px] resize-y rounded-md border px-2 py-1.5 text-xs",
                          fieldClass,
                        )}
                        value={notesFor(sl.id)}
                        onChange={(e) => setNotes(sl.id, e.target.value)}
                      />
                    </td>
                    <td className={cellPad}>
                      <SlideMetadataStack
                        projectId={projectId}
                        slideId={sl.id}
                        rows={sl.metadata.map((m) => ({
                          id: m.id,
                          key: m.key,
                          value: m.value,
                        }))}
                        onRefresh={onRefresh}
                      />
                    </td>
                    <td className={cellPad}>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const res = await updateLimsSlideNotesAction({
                              projectId,
                              slideId: sl.id,
                              notes: notesFor(sl.id),
                            });
                            if (res.ok) onRefresh();
                          })
                        }
                      >
                        <Save className="mr-1 h-3.5 w-3.5" />
                        Save
                      </Button>
                    </td>
                    <td className={cellPad}>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() =>
                          onOpenLabel({
                            slideReference: sl.slide_reference,
                            sampleReference,
                            createdAt: sl.created_at,
                          })
                        }
                      >
                        <Printer className="mr-1 h-3.5 w-3.5" />
                        Print
                      </Button>
                    </td>
                    <td className={cellPad}>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                        disabled={pending}
                        onClick={() => {
                          const ok = window.confirm(
                            `Delete slide ${sl.slide_reference}?`,
                          );
                          if (!ok) return;
                          start(async () => {
                            const res = await deleteLimsSlideAction({
                              projectId,
                              slideId: sl.id,
                            });
                            if (res.ok) onRefresh();
                          });
                        }}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
