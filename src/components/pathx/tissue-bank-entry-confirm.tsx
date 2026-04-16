"use client";

import { AlertTriangle, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PATH = "/pathx/tissue-bank";

const CONFIRM_BODY =
  "Opening Tissue Blocks runs a large database query. The page may take a moment to load. Continue?";

function TissueBankLoadDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-destructive/45 sm:border-l-4 sm:border-l-destructive">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2.5 text-destructive">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden
            />
            <span>Load Tissue Blocks?</span>
          </DialogTitle>
        </DialogHeader>
        <div
          className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2.5"
          role="alert"
        >
          <p className="text-sm font-medium leading-relaxed text-destructive">
            {CONFIRM_BODY}
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PathXTissueBankNavLink({
  className,
  active,
  children,
}: {
  className?: string;
  active: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        aria-current={active ? "page" : undefined}
      >
        {children}
      </button>
      <TissueBankLoadDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => router.push(PATH)}
      />
    </>
  );
}

export function PathXTissueBankDashboardTile({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "group block h-full w-full cursor-pointer rounded-xl text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        onClick={() => setOpen(true)}
      >
        <Card className="h-full border-border/80 transition-all group-hover:border-primary/40 group-hover:shadow-md">
          <CardHeader>
            <Layers className="h-9 w-9 text-primary" />
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-sm font-medium text-primary group-hover:underline">
              Open →
            </span>
          </CardContent>
        </Card>
      </button>
      <TissueBankLoadDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => router.push(PATH)}
      />
    </>
  );
}
