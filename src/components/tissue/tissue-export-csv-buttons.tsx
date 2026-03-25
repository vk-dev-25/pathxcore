"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type LoadingKey = "filtered" | "all" | null;

async function downloadExport(url: string): Promise<void> {
  const res = await fetch(url, {
    credentials: "same-origin",
    method: "GET",
  });
  if (!res.ok) {
    let msg = `Export failed (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* not json */
    }
    throw new Error(msg);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = "export.csv";
  const m = cd?.match(/filename="?([^";\n]+)"?/i);
  if (m?.[1]) filename = m[1].trim();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export function TissueExportCsvButtons({
  exportFilteredUrl,
  exportAllUrl,
  variant = "marketing",
}: {
  exportFilteredUrl: string;
  exportAllUrl: string;
  variant?: "marketing" | "dashboard";
}) {
  const [loading, setLoading] = useState<LoadingKey>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredPrimary =
    variant === "marketing" ? ("workspace" as const) : ("default" as const);
  const outline = "outline" as const;

  async function run(which: "filtered" | "all") {
    setError(null);
    const url = which === "filtered" ? exportFilteredUrl : exportAllUrl;
    setLoading(which);
    try {
      await downloadExport(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={filteredPrimary}
          className="min-w-[10rem] font-medium"
          disabled={loading !== null}
          onClick={() => run("filtered")}
        >
          {loading === "filtered" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Preparing…
            </>
          ) : (
            "Export filtered CSV"
          )}
        </Button>
        <Button
          type="button"
          variant={outline}
          className="min-w-[8rem] font-medium"
          disabled={loading !== null}
          onClick={() => run("all")}
        >
          {loading === "all" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Preparing…
            </>
          ) : (
            "Export CSV"
          )}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
