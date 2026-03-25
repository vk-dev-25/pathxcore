"use client";

import { useState } from "react";

import { TissueAddBlockForm } from "@/components/tissue/tissue-bank-internal-client";
import { Card, CardContent } from "@/components/ui/card";

export function TissueAddBlockCollapsible() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mt-6 border-border/80 shadow-none">
      <CardContent className="pt-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left"
          aria-expanded={open}
          aria-controls="tissue-add-block-panel"
        >
          <div>
            <p className="text-lg font-semibold">Add tissue block</p>
            <p className="text-sm text-muted-foreground">
              New blocks default to <span className="font-medium">available</span>.
            </p>
          </div>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-border px-2 text-base leading-none text-muted-foreground">
            {open ? "-" : "+"}
          </span>
        </button>

        {open ? (
          <div id="tissue-add-block-panel" className="mt-4 border-t border-border pt-4">
            <TissueAddBlockForm />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
