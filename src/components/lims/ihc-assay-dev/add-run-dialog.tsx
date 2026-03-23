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
import { createOptimizationRunAction } from "@/lib/lims/actions";

const ANTIGEN_RETRIEVAL_OPTIONS = ["pH6 (Citrate)", "pH9 (EDTA/Tris)", "Enzymatic (Proteinase K)", "Enzymatic (Trypsin)", "No retrieval"];
const SECONDARY_OPTIONS = ["HRP-Polymer (Rabbit)", "HRP-Polymer (Mouse)", "HRP-Polymer (Universal)", "AP-Polymer", "Avidin-Biotin (ABC)", "Other"];

export function AddRunDialog({ assayProjectId, runNumber, disabled }: {
  assayProjectId: string;
  runNumber: number;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createOptimizationRunAction({
        assay_project_id: assayProjectId,
        run_number: runNumber,
        ab_dilution: (fd.get("ab_dilution") as string) || null,
        antigen_retrieval: (fd.get("antigen_retrieval") as string) || null,
        secondary_system: (fd.get("secondary_system") as string) || null,
        incubation_time_min: fd.get("incubation_time_min") ? Number(fd.get("incubation_time_min")) : null,
        incubation_temp: (fd.get("incubation_temp") as string) || null,
        blocking_conditions: (fd.get("blocking_conditions") as string) || null,
        outcome: "pending",
        notes: (fd.get("notes") as string) || null,
        run_date: (fd.get("run_date") as string) || null,
      });
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}><Plus className="h-4 w-4" />Add Run {runNumber}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Optimization Run {runNumber}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ab_dilution">Ab Dilution</Label>
              <Input id="ab_dilution" name="ab_dilution" placeholder="1:100, 1:200..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="run_date">Run Date</Label>
              <Input id="run_date" name="run_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Antigen Retrieval</Label>
            <Select name="antigen_retrieval">
              <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                {ANTIGEN_RETRIEVAL_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Secondary / Detection System</Label>
            <Select name="secondary_system">
              <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
              <SelectContent>
                {SECONDARY_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="incubation_time_min">Incubation Time (min)</Label>
              <Input id="incubation_time_min" name="incubation_time_min" type="number" placeholder="60" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="incubation_temp">Incubation Temp (°C)</Label>
              <Input id="incubation_temp" name="incubation_temp" placeholder="RT, 37°C..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blocking_conditions">Blocking Conditions</Label>
            <Input id="blocking_conditions" name="blocking_conditions" placeholder="5% BSA, 10% normal goat serum..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="run_notes">Notes</Label>
            <Textarea id="run_notes" name="notes" rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Log Run"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
