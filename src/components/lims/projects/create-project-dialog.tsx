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
import { createProjectAction } from "@/lib/lims/actions";
import type { Client } from "@/lib/lims/types";

const STUDY_TYPES = ["Oncology", "Neuroscience", "Immunology", "Metabolism", "Cardiology", "Toxicology", "Other"];
const SPECIES_OPTIONS = ["Mouse", "Human", "Rat", "Primate", "Other"];

export function CreateProjectDialog({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<string>("STANDARD");
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const router = useRouter();

  function toggleSpecies(s: string) {
    setSelectedSpecies((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createProjectAction({
        title: fd.get("title") as string,
        client_id: fd.get("client_id") as string,
        pi_name: (fd.get("pi_name") as string) || null,
        study_type: (fd.get("study_type") as string) || null,
        project_type: projectType as "STANDARD" | "IHC_DEV",
        species: selectedSpecies,
        start_date: (fd.get("start_date") as string) || null,
        end_date: (fd.get("end_date") as string) || null,
        po_reference: (fd.get("po_reference") as string) || null,
        notes: (fd.get("notes") as string) || null,
        status: "active",
      });
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />New Project</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Project Title *</Label>
            <Input id="title" name="title" required placeholder="HER2 Expression Study Q1 2025" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select name="client_id" required>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Project Type *</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="IHC_DEV">IHC Assay Dev</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pi_name">Principal Investigator</Label>
              <Input id="pi_name" name="pi_name" placeholder="Dr. Smith" />
            </div>
            <div className="space-y-1.5">
              <Label>Study Type</Label>
              <Select name="study_type">
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {STUDY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Species</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIES_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecies(s)}
                  className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                    selectedSpecies.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" name="start_date" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" name="end_date" type="date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="po_reference">PO / Budget Reference</Label>
            <Input id="po_reference" name="po_reference" placeholder="PO-2025-0042" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes / Objectives</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating…" : "Create Project"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
