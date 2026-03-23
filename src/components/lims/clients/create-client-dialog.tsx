"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClientAction } from "@/lib/lims/actions";

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createClientAction({
        name: fd.get("name") as string,
        code: (fd.get("code") as string).toUpperCase().slice(0, 3),
        contact_name: (fd.get("contact_name") as string) || null,
        email: (fd.get("email") as string) || null,
        phone: (fd.get("phone") as string) || null,
        address: (fd.get("address") as string) || null,
      });
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />New Client</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" name="name" required placeholder="Novagen Bio" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Code * <span className="text-muted-foreground font-normal">(3 letters)</span></Label>
              <Input id="code" name="code" required maxLength={3} placeholder="NVG" className="uppercase" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">Contact Name</Label>
            <Input id="contact_name" name="contact_name" placeholder="Dr. Jane Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="contact@client.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+1 555 000 0000" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" rows={2} placeholder="123 Research Blvd..." />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Register Client"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
