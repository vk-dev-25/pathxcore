"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TrackerDetail } from "@/lib/trackers/get-trackers";
import type { LimsProjectOption } from "@/lib/trackers/lims-link";
import {
  addTrackerAccessAction,
  addTrackerRowAction,
  addTrackerRowFromLimsAction,
  deleteTrackerRowAction,
  listSharedTrackerEmailsAction,
  listTrackerLimsProjectsAction,
  moveTrackerRowAction,
  removeTrackerAccessAction,
  updateTrackerRowAction,
} from "@/lib/trackers/actions";
import {
  STATUS_TAG_OPTIONS,
  TRACKER_COLUMNS,
  type TrackerDataField,
  type TrackerRow,
  type TrackerStatusTag,
} from "@/lib/trackers/types";
import { cn } from "@/lib/utils";

const STATUS_TAG_CLASS: Record<TrackerStatusTag, string> = {
  completed:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  awaiting_client:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  paused: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-500/30",
  halted: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  na: "bg-transparent text-muted-foreground border-border",
};

export function TrackerGridClient({
  detail,
  isStaff,
  viewerEmail,
  limsProjects = [],
}: {
  detail: TrackerDetail;
  isStaff: boolean;
  viewerEmail: string;
  limsProjects?: LimsProjectOption[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<TrackerRow[]>(detail.rows);
  const [pending, startTransition] = useTransition();
  const [accessOpen, setAccessOpen] = useState(false);
  const [limsOpen, setLimsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(detail.rows);
  }, [detail.rows]);

  function saveCell(
    rowId: string,
    field: TrackerDataField | "group_label" | "status_tag",
    value: string | null,
  ) {
    startTransition(async () => {
      const res = await updateTrackerRowAction({
        trackerId: detail.id,
        rowId,
        patch: { [field]: value },
      });
      if (!res.ok) {
        setError(res.error);
        router.refresh();
      }
    });
  }

  function setLocal(
    rowId: string,
    field: keyof TrackerRow,
    value: string | null,
  ) {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
    );
  }

  function addRow(rowType: "data" | "group") {
    setError(null);
    startTransition(async () => {
      const res = await addTrackerRowAction({ trackerId: detail.id, rowType });
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  function deleteRow(rowId: string) {
    startTransition(async () => {
      const res = await deleteTrackerRowAction({ trackerId: detail.id, rowId });
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  function move(rowId: string, direction: "up" | "down") {
    startTransition(async () => {
      const res = await moveTrackerRowAction({
        trackerId: detail.id,
        rowId,
        direction,
      });
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  const colCount = TRACKER_COLUMNS.length + (isStaff ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/pathx/trackers">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            All trackers
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {detail.title}
          </h1>
          <p className="mt-1 text-muted-foreground">{detail.client_name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isStaff ? (
            <Button variant="outline" onClick={() => setAccessOpen(true)}>
              <Users className="mr-1.5 h-4 w-4" />
              Manage access
            </Button>
          ) : null}
          {isStaff ? (
            <Button
              variant="outline"
              onClick={() => setLimsOpen(true)}
              disabled={pending}
            >
              <FlaskConical className="mr-1.5 h-4 w-4" />
              Add from LIMS
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => addRow("group")} disabled={pending}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add section
          </Button>
          <Button onClick={() => addRow("data")} disabled={pending}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add row
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/60">
              {isStaff ? <th className="w-10 border-b border-border" /> : null}
              {TRACKER_COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "min-w-[140px] border-b border-l border-border px-2 py-2 text-left align-bottom font-semibold",
                    c.key === "client_comments" && "bg-amber-500/10",
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No rows yet. Use “Add row” to start.
                </td>
              </tr>
            ) : null}
            {rows.map((row, i) =>
              row.row_type === "group" ? (
                <tr key={row.id} className="bg-primary/5">
                  {isStaff ? (
                    <RowControls
                      onUp={() => move(row.id, "up")}
                      onDown={() => move(row.id, "down")}
                      onDelete={() => deleteRow(row.id)}
                      disableUp={i === 0}
                      disableDown={i === rows.length - 1}
                    />
                  ) : null}
                  <td colSpan={TRACKER_COLUMNS.length} className="border-b border-border px-2 py-1.5">
                    <input
                      className="w-full bg-transparent px-1 py-1 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
                      defaultValue={row.group_label ?? ""}
                      placeholder="Section header (e.g. PRJ20 · CRC — CDH3 & CDH17)"
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v !== (row.group_label ?? "")) {
                          setLocal(row.id, "group_label", v || null);
                          saveCell(row.id, "group_label", v || null);
                        }
                      }}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={row.id} className="align-top">
                  {isStaff ? (
                    <RowControls
                      onUp={() => move(row.id, "up")}
                      onDown={() => move(row.id, "down")}
                      onDelete={() => deleteRow(row.id)}
                      disableUp={i === 0}
                      disableDown={i === rows.length - 1}
                    />
                  ) : null}
                  {TRACKER_COLUMNS.map((c) =>
                    c.key === "status" ? (
                      <StatusCell
                        key={c.key}
                        row={row}
                        onTag={(tag) => {
                          setLocal(row.id, "status_tag", tag);
                          saveCell(row.id, "status_tag", tag);
                        }}
                        onText={(v) => {
                          setLocal(row.id, "status", v || null);
                          saveCell(row.id, "status", v || null);
                        }}
                      />
                    ) : (
                      <EditableCell
                        key={c.key}
                        value={row[c.key] ?? ""}
                        highlight={c.key === "client_comments"}
                        onSave={(v) => {
                          setLocal(row.id, c.key, v || null);
                          saveCell(row.id, c.key, v || null);
                        }}
                      />
                    ),
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Changes save automatically and notify everyone with access. Signed in as{" "}
        {viewerEmail}.
      </p>

      {isStaff ? (
        <ManageAccessDialog
          open={accessOpen}
          onOpenChange={setAccessOpen}
          detail={detail}
        />
      ) : null}

      {isStaff ? (
        <AddFromLimsDialog
          open={limsOpen}
          onOpenChange={setLimsOpen}
          trackerId={detail.id}
          projects={limsProjects}
        />
      ) : null}
    </div>
  );
}

function AddFromLimsDialog({
  open,
  onOpenChange,
  trackerId,
  projects: initialProjects,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trackerId: string;
  projects: LimsProjectOption[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [projects, setProjects] = useState<LimsProjectOption[]>(initialProjects);
  const [loading, setLoading] = useState(false);

  // Re-fetch a fresh list every time the picker opens so newly created LIMS
  // projects show up without a full page reload.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    listTrackerLimsProjectsAction(trackerId).then((res) => {
      if (!active) return;
      if (res.ok) setProjects(res.projects);
      else setError(res.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [open, trackerId]);

  function add(projectId: string) {
    setError(null);
    setPendingId(projectId);
    startTransition(async () => {
      const res = await addTrackerRowFromLimsAction({
        trackerId,
        limsProjectId: projectId,
      });
      setPendingId(null);
      if (res.ok) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add row from LIMS project</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Pick a LIMS project for this client. Project ID, quote, title, and
          status will be prefilled into a new row.
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="max-h-80 space-y-1 overflow-auto">
          {loading ? (
            <p className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading LIMS projects…
            </p>
          ) : projects.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              No LIMS projects found for this client.
            </p>
          ) : (
            projects.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={pendingId !== null}
                onClick={() => add(p.id)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
              >
                <span className="min-w-0">
                  <span className="font-medium">{p.projectReference}</span>
                  {p.projectTitle ? (
                    <span className="text-muted-foreground"> · {p.projectTitle}</span>
                  ) : null}
                  <span className="block truncate text-xs text-muted-foreground">
                    {[p.quoteReference, p.status].filter(Boolean).join(" · ") ||
                      "No quote linked"}
                  </span>
                </span>
                {pendingId === p.id ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RowControls({
  onUp,
  onDown,
  onDelete,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <td className="border-b border-border px-1 py-1 align-top">
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={onUp}
          disabled={disableUp}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDown}
          disabled={disableDown}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete row"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </td>
  );
}

function EditableCell({
  value,
  onSave,
  highlight,
}: {
  value: string;
  onSave: (v: string) => void;
  highlight?: boolean;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  return (
    <td
      className={cn(
        "border-b border-l border-border p-0 align-top",
        highlight && "bg-amber-500/5",
      )}
    >
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onSave(local);
        }}
        rows={2}
        className="min-h-[3rem] w-full resize-y bg-transparent px-2 py-1.5 text-sm outline-none focus:bg-primary/5"
      />
    </td>
  );
}

function StatusCell({
  row,
  onTag,
  onText,
}: {
  row: TrackerRow;
  onTag: (tag: TrackerStatusTag | null) => void;
  onText: (v: string) => void;
}) {
  const [local, setLocal] = useState(row.status ?? "");
  useEffect(() => setLocal(row.status ?? ""), [row.status]);

  return (
    <td className="border-b border-l border-border p-1 align-top">
      <select
        value={row.status_tag ?? ""}
        onChange={(e) =>
          onTag((e.target.value || null) as TrackerStatusTag | null)
        }
        className={cn(
          "mb-1 w-full rounded border px-1.5 py-1 text-xs font-medium outline-none",
          row.status_tag
            ? STATUS_TAG_CLASS[row.status_tag]
            : "border-border bg-transparent text-muted-foreground",
        )}
      >
        <option value="">— tag —</option>
        {STATUS_TAG_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== (row.status ?? "")) onText(local);
        }}
        rows={2}
        placeholder="Status notes…"
        className="min-h-[2.5rem] w-full resize-y bg-transparent px-1 py-1 text-sm outline-none focus:bg-primary/5"
      />
    </td>
  );
}

function ManageAccessDialog({
  open,
  onOpenChange,
  detail,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  detail: TrackerDetail;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"client" | "staff">("client");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [knownEmails, setKnownEmails] = useState<string[]>([]);

  const staff = detail.access.filter((a) => a.role === "staff");
  const clients = detail.access.filter((a) => a.role === "client");

  // Suggest emails previously used to share any tracker. Exclude ones already
  // on this tracker so the list only offers useful additions.
  const alreadyHere = new Set(detail.access.map((a) => a.email.toLowerCase()));
  const emailSuggestions = knownEmails.filter((e) => !alreadyHere.has(e));

  useEffect(() => {
    if (!open) return;
    let active = true;
    listSharedTrackerEmailsAction().then((emails) => {
      if (active) setKnownEmails(emails);
    });
    return () => {
      active = false;
    };
  }, [open]);

  function add() {
    setError(null);
    if (!email.trim()) {
      setError("Enter an email.");
      return;
    }
    startTransition(async () => {
      const res = await addTrackerAccessAction({
        trackerId: detail.id,
        email: email.trim(),
        role,
      });
      if (res.ok) {
        setEmail("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function remove(accessId: string) {
    startTransition(async () => {
      const res = await removeTrackerAccessAction({
        trackerId: detail.id,
        accessId,
      });
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage access — {detail.client_name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Everyone here can view and edit this tracker, and is notified on
          changes.
        </p>

        <div className="space-y-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              PathX team
            </p>
            <ul className="space-y-1">
              {staff.length === 0 ? (
                <li className="text-sm text-muted-foreground">None yet.</li>
              ) : (
                staff.map((a) => (
                  <AccessRow key={a.id} email={a.email} badge="staff" onRemove={() => remove(a.id)} />
                ))
              )}
            </ul>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Client access
            </p>
            <ul className="space-y-1">
              {clients.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  No clients invited yet.
                </li>
              ) : (
                clients.map((a) => (
                  <AccessRow key={a.id} email={a.email} badge="client" onRemove={() => remove(a.id)} />
                ))
              )}
            </ul>
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <Label htmlFor="access-email">Add email</Label>
            <div className="flex gap-2">
              <Input
                id="access-email"
                type="email"
                list="tracker-email-suggestions"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="person@company.com"
              />
              <datalist id="tracker-email-suggestions">
                {emailSuggestions.map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "client" | "staff")}
                className="rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="client">Client</option>
                <option value="staff">Staff</option>
              </select>
              <Button onClick={add} disabled={pending}>
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clients get a magic-link email to sign in — no password needed.
            </p>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AccessRow({
  email,
  badge,
  onRemove,
}: {
  email: string;
  badge: "staff" | "client";
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5 text-sm">
      <span className="flex items-center gap-2">
        <span>{email}</span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-xs",
            badge === "staff"
              ? "bg-muted text-muted-foreground"
              : "bg-blue-500/15 text-blue-600 dark:text-blue-400",
          )}
        >
          {badge}
        </span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
        aria-label={`Remove ${email}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
