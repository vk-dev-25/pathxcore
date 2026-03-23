"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAccessionAction } from "@/lib/lims/actions";
import type { ProjectWithClient } from "@/lib/lims/types";

export function CreateAccessionDialog({ projects }: { projects: ProjectWithClient[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isControl, setIsControl] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createAccessionAction({
        project_id: fd.get("project_id") as string,
        received_date: fd.get("received_date") as string,
        received_by: (fd.get("received_by") as string) || null,
        notes: (fd.get("notes") as string) || null,
        status: "received",
        is_control: isControl,
        control_type: isControl ? ((fd.get("control_type") as string) || null) : null,
      });
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />New Accession</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log New Accession</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Project *</Label>
            <Select name="project_id" required>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.project_id} — {p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="received_date">Date Received *</Label>
              <Input id="received_date" name="received_date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="received_by">Received By</Label>
              <Input id="received_by" name="received_by" placeholder="Initials or name" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_control"
              checked={isControl}
              onChange={(e) => setIsControl(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="is_control" className="cursor-pointer">Mark as control accession (IHC assay dev)</Label>
          </div>
          {isControl && (
            <div className="space-y-1.5">
              <Label>Control Type</Label>
              <Select name="control_type">
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_supplied">Client Supplied</SelectItem>
                  <SelectItem value="inhouse">In-House</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="acc_notes">Notes</Label>
            <Textarea id="acc_notes" name="notes" rows={2} placeholder="Shipment conditions, observations..." />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Log Accession"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
