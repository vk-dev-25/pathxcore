"use client";

import { useState } from "react";
import { LimsShell } from "@/components/lims/lims-shell";
import { LabelPreview } from "@/components/lims/label-designer/label-preview";
import { CassetteLabelPreview } from "@/components/lims/label-designer/cassette-label-preview";

export default function LabelDesignerPage() {
  const [tab, setTab] = useState<"slide" | "cassette">("slide");

  return (
    <LimsShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Label Designer</h1>
          <p className="text-sm text-muted-foreground">
            Preview and print slide labels (direct-print or adhesive) and FFPE cassette labels.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/60">
          {(["slide", "cassette"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "slide" ? "Slide Labels" : "Cassette / Block Labels"}
            </button>
          ))}
        </div>

        {tab === "slide" ? <LabelPreview /> : <CassetteLabelPreview />}

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 space-y-1">
          <p className="font-medium">Labeling Protocol</p>
          <ul className="text-xs space-y-0.5 list-disc list-inside">
            <li>Slides are labeled at cut time — stain field intentionally left blank</li>
            <li>After staining, handwrite marker name, isotype control, and date in the blank field</li>
            <li>This preserves flexibility if a staining run fails during IHC assay development</li>
            <li>Use xylene-resistant labels for IHC slides; direct-print for H&E and archival slides</li>
          </ul>
        </div>
      </div>
    </LimsShell>
  );
}
