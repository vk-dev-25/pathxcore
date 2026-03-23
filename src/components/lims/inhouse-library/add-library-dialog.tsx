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
import { createInhouseEntryAction } from "@/lib/lims/actions";
import { generateInhouseLibraryId } from "@/lib/lims/id-gen";

export function AddLibraryDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [marker, setMarker] = useState("");
  const [role, setRole] = useState<"positive" | "negative">("positive");
  const router = useRouter();

  const previewId = marker ? generateInhouseLibraryId(marker, role) : "—";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createInhouseEntryAction({
        cell_line: fd.get("cell_line") as string,
        marker,
        expression_level: (fd.get("expression_level") as string) || null,
        role,
        last_used_date: (fd.get("last_used_date") as string) || null,
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
        <Button size="sm"><Plus className="h-4 w-4" />Add Control Cell Line</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add In-House Control</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cell_line">Cell Line *</Label>
              <Input id="cell_line" name="cell_line" required placeholder="MCF7, H1975..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="marker_input">Marker *</Label>
              <Input id="marker_input" value={marker} onChange={(e) => setMarker(e.target.value)} required placeholder="HER2, Ki-67..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "positive" | "negative")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive Control</SelectItem>
                  <SelectItem value="negative">Negative Control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expression_level">Expression Level</Label>
              <Input id="expression_level" name="expression_level" placeholder="High, Low, 3+..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_used_date">Last Used Date</Label>
            <Input id="last_used_date" name="last_used_date" type="date" />
          </div>
          {marker && (
            <div className="rounded-md bg-muted/40 px-3 py-2 border border-border/40">
              <p className="text-xs text-muted-foreground mb-0.5">Generated Library ID</p>
              <p className="font-mono text-sm font-semibold">{previewId}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="lib_notes">Notes</Label>
            <Textarea id="lib_notes" name="notes" rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Add Entry"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
