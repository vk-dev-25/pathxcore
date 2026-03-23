"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAssayProjectAction } from "@/lib/lims/actions";
import type { ProjectWithClient } from "@/lib/lims/types";

export function CreateAssayDialog({ projects }: { projects: ProjectWithClient[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only IHC_DEV projects
  const ihcProjects = projects.filter((p) => p.project_type === "IHC_DEV");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createAssayProjectAction({
        project_id: fd.get("project_id") as string,
        target_marker: fd.get("target_marker") as string,
        antibody_clone: (fd.get("antibody_clone") as string) || null,
        vendor: (fd.get("vendor") as string) || null,
        catalogue_number: (fd.get("catalogue_number") as string) || null,
        status: "in_development",
        locked_run_id: null,
      });
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />New Assay Dev</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New IHC Assay Development</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Project (IHC Dev) *</Label>
            <Select name="project_id" required>
              <SelectTrigger><SelectValue placeholder={ihcProjects.length === 0 ? "No IHC Dev projects found" : "Select project"} /></SelectTrigger>
              <SelectContent>
                {ihcProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.project_id} — {p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {ihcProjects.length === 0 && (
              <p className="text-xs text-muted-foreground">Create a project with type "IHC Assay Dev" first.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target_marker">Target Marker *</Label>
            <Input id="target_marker" name="target_marker" required placeholder="HER2, Ki-67, CD3..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="antibody_clone">Antibody Clone</Label>
              <Input id="antibody_clone" name="antibody_clone" placeholder="SP3, 4B5..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" name="vendor" placeholder="Abcam, DAKO..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="catalogue_number">Catalogue Number</Label>
            <Input id="catalogue_number" name="catalogue_number" placeholder="ab16901" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || ihcProjects.length === 0}>
              {isPending ? "Creating…" : "Create Assay"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
