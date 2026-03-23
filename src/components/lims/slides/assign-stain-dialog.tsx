"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSlideStainAction } from "@/lib/lims/actions";
import type { Slide } from "@/lib/lims/types";

const STAIN_TYPES = ["H&E", "IHC", "Masson Trichrome", "PAS", "Alcian Blue", "Oil Red O", "IHC-FISH", "Other"];

export function AssignStainDialog({ slide }: { slide: Slide }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [stainType, setStainType] = useState(slide.stain_type ?? "");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const stainedDate = fd.get("stained_date") as string;
    startTransition(async () => {
      const result = await updateSlideStainAction(slide.id, {
        stain_status: stainedDate ? "stained" : "assigned",
        stain_type: stainType || undefined,
        marker: (fd.get("marker") as string) || undefined,
        isotype_control: (fd.get("isotype_control") as string) || undefined,
        stained_date: stainedDate || undefined,
        stained_by: (fd.get("stained_by") as string) || undefined,
      });
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Pencil className="h-3 w-3" />Assign Stain</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Stain — {slide.slide_id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Stain Type</Label>
            <Select value={stainType} onValueChange={setStainType}>
              <SelectTrigger><SelectValue placeholder="Select stain" /></SelectTrigger>
              <SelectContent>
                {STAIN_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {stainType === "IHC" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="marker">Primary Antibody / Marker</Label>
                <Input id="marker" name="marker" defaultValue={slide.marker ?? ""} placeholder="Ki-67, HER2, CD3..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="isotype_control">Isotype Control</Label>
                <Input id="isotype_control" name="isotype_control" defaultValue={slide.isotype_control ?? ""} placeholder="Rabbit IgG, Mouse IgG1..." />
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stained_date">Date Stained <span className="text-muted-foreground font-normal">(leave blank if not yet)</span></Label>
              <Input id="stained_date" name="stained_date" type="date" defaultValue={slide.stained_date ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stained_by">Stained By</Label>
              <Input id="stained_by" name="stained_by" defaultValue={slide.stained_by ?? ""} placeholder="Initials" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
