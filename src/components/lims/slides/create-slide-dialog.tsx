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
import { createSlideAction } from "@/lib/lims/actions";
import type { SpecimenWithAccession } from "@/lib/lims/types";

export function CreateSlideDialog({ specimens, preselectedSpecimenId }: {
  specimens: SpecimenWithAccession[];
  preselectedSpecimenId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecimenId, setSelectedSpecimenId] = useState(preselectedSpecimenId ?? "");
  const router = useRouter();

  const selectedSpecimen = specimens.find((s) => s.id === selectedSpecimenId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (!selectedSpecimen) { setError("Select a specimen"); return; }

    startTransition(async () => {
      const result = await createSlideAction({
        specimen_id: selectedSpecimen.id,
        specimen_id_str: selectedSpecimen.specimen_id,
        count: Number(fd.get("count") ?? 1),
        cut_date: (fd.get("cut_date") as string) || null,
        cut_by: (fd.get("cut_by") as string) || null,
        label_type: (fd.get("label_type") as "direct_print" | "adhesive") || null,
        stain_status: "unassigned",
        stain_type: null,
        marker: null,
        isotype_control: null,
        stained_date: null,
        stained_by: null,
        section_number: null,
        notes: (fd.get("notes") as string) || null,
      });
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />Cut Slides</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Cut Slides</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Specimen *</Label>
            <Select value={selectedSpecimenId} onValueChange={setSelectedSpecimenId} required>
              <SelectTrigger><SelectValue placeholder="Select specimen" /></SelectTrigger>
              <SelectContent>
                {specimens.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.specimen_id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="count">Number of Slides *</Label>
              <Input id="count" name="count" type="number" min={1} max={50} defaultValue={1} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cut_date">Cut Date</Label>
              <Input id="cut_date" name="cut_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cut_by">Cut By</Label>
              <Input id="cut_by" name="cut_by" placeholder="Initials" />
            </div>
            <div className="space-y-1.5">
              <Label>Label Type</Label>
              <Select name="label_type">
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_print">Direct Print on Glass</SelectItem>
                  <SelectItem value="adhesive">Xylene-Resistant Adhesive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md bg-amber-500/5 border border-amber-500/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            Stain field intentionally left blank — write marker/isotype + date on physical slide label after staining.
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slide_notes">Notes</Label>
            <Textarea id="slide_notes" name="notes" rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Log Slides"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
