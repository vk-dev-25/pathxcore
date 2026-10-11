"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Download, FileUp, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  abortSharedFileUploadAction,
  completeSharedFileUploadAction,
  deleteSharedFileAction,
  getSharedFileDownloadUrlAction,
  presignSharedFilePartAction,
  startSharedFileUploadAction,
} from "@/lib/shared-files/actions";
import { downloadSharedFile } from "@/lib/shared-files/download-client";
import { formatBytes, type SharedFileRow } from "@/lib/shared-files/types";
import { cn } from "@/lib/utils";

import {
  pathxCardClass as cardClass,
  pathxFieldClass as fieldClass,
} from "@/components/pathx/workspace-field-classes";

function defaultExpiryDateValue(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

/** End of the selected local calendar day → ISO for storage. */
function expiryIsoFromDateValue(dateValue: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return null;
  const d = new Date(`${dateValue}T23:59:59`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function statusLabel(status: SharedFileRow["status"]) {
  switch (status) {
    case "ready":
      return "Ready";
    case "uploading":
      return "Uploading";
    case "failed":
      return "Failed";
    case "expired":
      return "Expired";
    case "deleted":
      return "Deleted";
    default:
      return status;
  }
}

async function uploadPartWithRetry(
  url: string,
  blob: Blob,
  attempts = 4,
): Promise<string> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "application/octet-stream" },
      });
      if (!res.ok) {
        throw new Error(`Part upload failed (${res.status})`);
      }
      const etag = res.headers.get("ETag") || res.headers.get("etag");
      if (!etag) throw new Error("Missing ETag from S3 response (check CORS ExposeHeaders).");
      return etag.replaceAll('"', "");
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * 2 ** i));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Part upload failed.");
}

export function SharedFilesClient({
  files,
  clientMode,
}: {
  files: SharedFileRow[];
  clientMode: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [emailsRaw, setEmailsRaw] = useState("");
  const [expiryDate, setExpiryDate] = useState(defaultExpiryDateValue);
  const [uploading, setUploading] = useState(false);

  const visible = useMemo(
    () =>
      clientMode
        ? files.filter((f) => f.status === "ready")
        : files.filter((f) => f.status !== "deleted"),
    [files, clientMode],
  );

  async function runUpload() {
    setError(null);
    setProgress(null);
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setUploading(true);
    try {
      const start = await startSharedFileUploadAction({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        byteSize: file.size,
        title: title.trim() || undefined,
      });
      if (!start.ok) {
        setError(start.error);
        return;
      }

      const partSize = start.partSizeBytes;
      const totalParts = Math.ceil(file.size / partSize);
      const parts: { partNumber: number; etag: string }[] = [];

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        setProgress(`Uploading part ${partNumber} of ${totalParts}…`);
        const presign = await presignSharedFilePartAction({
          fileId: start.fileId,
          partNumber,
        });
        if (!presign.ok) {
          await abortSharedFileUploadAction(start.fileId);
          setError(presign.error);
          return;
        }
        const startByte = (partNumber - 1) * partSize;
        const endByte = Math.min(file.size, startByte + partSize);
        const blob = file.slice(startByte, endByte);
        try {
          const etag = await uploadPartWithRetry(presign.url, blob);
          parts.push({ partNumber, etag });
        } catch (e) {
          await abortSharedFileUploadAction(start.fileId);
          setError(
            e instanceof Error
              ? e.message
              : "Upload failed. Check network and S3 CORS, then try again.",
          );
          return;
        }
      }

      setProgress("Finalizing upload…");
      const expiresAt = expiryIsoFromDateValue(expiryDate);
      if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
        setError("Choose a future available-until date.");
        await abortSharedFileUploadAction(start.fileId);
        return;
      }
      const emails = emailsRaw
        .split(/[,;\s]+/)
        .map((e) => e.trim())
        .filter(Boolean);
      const done = await completeSharedFileUploadAction({
        fileId: start.fileId,
        parts,
        expiresAt,
        emails,
        title: title.trim() || undefined,
      });
      if (!done.ok) {
        setError(done.error);
        return;
      }
      setFile(null);
      setTitle("");
      setEmailsRaw("");
      setProgress(null);
      const dest = done.warning
        ? `/pathx/shared-files/${start.fileId}?warn=${encodeURIComponent(done.warning)}`
        : `/pathx/shared-files/${start.fileId}`;
      router.push(dest);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  function download(fileId: string) {
    setError(null);
    setProgress("Preparing download…");
    startTransition(async () => {
      try {
        const res = await getSharedFileDownloadUrlAction(fileId);
        if (!res.ok) {
          setError(res.error);
          setProgress(null);
          return;
        }
        await downloadSharedFile({
          url: res.url,
          filename: res.filename,
          byteSize: res.byteSize,
          onProgress: (p) => setProgress(`Downloading ${p.pct}%…`),
        });
        setProgress(null);
      } catch (e) {
        setProgress(null);
        setError(e instanceof Error ? e.message : "Download failed.");
      }
    });
  }

  function remove(fileId: string) {
    if (!confirm("Delete this file from PathX and S3 permanently?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteSharedFileAction(fileId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          PathX module
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Shared files</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {clientMode
            ? "Files PathX has shared with you. Download before the expiry date."
            : "Upload large histo files to S3 and grant client email access (magic-link sign-in), with automatic expiry."}
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!clientMode ? (
        <Card className={cn(cardClass)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Upload a file
            </CardTitle>
            <CardDescription>
              Files go directly to S3 in parts (up to the configured max size).
              Clients download via short-lived links after magic-link sign-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sf-file">File</Label>
              <Input
                id="sf-file"
                type="file"
                className={fieldClass}
                disabled={uploading}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <p className="text-xs text-muted-foreground">
                  {file.name} · {formatBytes(file.size)}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-title">Title (optional)</Label>
              <Input
                id="sf-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
                disabled={uploading}
                placeholder="e.g. Project ABC H&E export"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-expiry">Available until</Label>
              <Input
                id="sf-expiry"
                type="date"
                value={expiryDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={uploading}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sf-emails">Client emails (optional)</Label>
              <Input
                id="sf-emails"
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                className={fieldClass}
                disabled={uploading}
                placeholder="client@biotech.com, collaborator@lab.edu"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated. Each email gets a magic-link invite to download.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <Button type="button" onClick={runUpload} disabled={uploading || !file}>
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Uploading…" : "Upload & share"}
              </Button>
              {progress ? (
                <p className="text-sm text-muted-foreground">{progress}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className={cn(cardClass)}>
        <CardHeader>
          <CardTitle>{clientMode ? "Your files" : "All deliveries"}</CardTitle>
          <CardDescription>
            {visible.length} file{visible.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shared files yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2">File</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Expires</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.id} className="border-b border-white/[0.06]">
                      <td className="px-3 py-3">
                        <Link
                          href={`/pathx/shared-files/${row.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {row.title || row.original_filename}
                        </Link>
                        {row.title ? (
                          <p className="text-xs text-muted-foreground">
                            {row.original_filename}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        {formatBytes(row.byte_size)}
                      </td>
                      <td className="px-3 py-3">{statusLabel(row.status)}</td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">
                        {row.expires_at
                          ? new Date(row.expires_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          {row.status === "ready" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={pending}
                              onClick={() => download(row.id)}
                            >
                              <Download className="mr-1 h-3.5 w-3.5" />
                              Download
                            </Button>
                          ) : null}
                          {!clientMode ? (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={pending}
                              onClick={() => remove(row.id)}
                              aria-label="Delete file"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
