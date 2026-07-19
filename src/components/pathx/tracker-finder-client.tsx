"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronRight, Loader2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClientCombobox } from "@/components/ui/client-combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientSuggestion } from "@/lib/clients/types";
import { createTrackerAction } from "@/lib/trackers/actions";
import type { TrackerSummary } from "@/lib/trackers/types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function TrackerFinderClient({
  trackers,
  clients,
  isStaff,
}: {
  trackers: TrackerSummary[];
  clients: ClientSuggestion[];
  isStaff: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("IHC Project Tracker");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trackers;
    return trackers.filter(
      (t) =>
        t.client_name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q),
    );
  }, [query, trackers]);

  function create() {
    setError(null);
    if (!clientName.trim()) {
      setError("Choose or type a client.");
      return;
    }
    startTransition(async () => {
      const res = await createTrackerAction({
        clientName: clientName.trim(),
        title: title.trim() || undefined,
      });
      if (res.ok) {
        setOpen(false);
        router.push(`/pathx/trackers/${res.trackerId}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isStaff ? "Project Trackers" : "Your Project Trackers"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isStaff
              ? "Shared, editable trackers per client. Both PathX and the client can update them."
              : "Open your project tracker to view progress and add comments."}
          </p>
        </div>
        {isStaff ? (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New tracker
          </Button>
        ) : null}
      </div>

      {trackers.length > 3 ? (
        <div className="relative mt-6 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by client or title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      ) : null}

      <div className="mt-6 space-y-2">
        {filtered.length === 0 ? (
          <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
            No trackers yet.
            {isStaff ? " Create one to get started." : ""}
          </Card>
        ) : (
          filtered.map((t) => (
            <Link key={t.id} href={`/pathx/trackers/${t.id}`} className="block">
              <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:border-primary/40">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{t.client_name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {t.title} · {t.row_count} rows
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    Updated {formatDate(t.updated_at)}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project tracker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracker-client">Client</Label>
              <ClientCombobox
                id="tracker-client"
                value={clientName}
                onChange={setClientName}
                onSelect={(c) => setClientName(c.org_name)}
                clients={clients}
                placeholder="Start typing to find an existing client…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracker-title">Title</Label>
              <Input
                id="tracker-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="IHC Project Tracker"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={create} disabled={pending}>
                {pending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create tracker
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
