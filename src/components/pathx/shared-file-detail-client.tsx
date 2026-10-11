"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Download, Loader2, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addSharedFileAccessAction,
  deleteSharedFileAction,
  getSharedFileDownloadUrlAction,
  removeSharedFileAccessAction,
  updateSharedFileExpiryAction,
} from "@/lib/shared-files/actions";
import {
  formatBytes,
  type SharedFileAccessRow,
  type SharedFileRow,
} from "@/lib/shared-files/types";
import { cn } from "@/lib/utils";

import {
  pathxCardClass as cardClass,
  pathxFieldClass as fieldClass,
} from "@/components/pathx/workspace-field-classes";

export function SharedFileDetailClient({
  file,
  access,
  clientMode,
  initialWarning = null,
}: {
  file: SharedFileRow;
  access: SharedFileAccessRow[];
  clientMode: boolean;
  initialWarning?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(initialWarning);
  const [email, setEmail] = useState("");
  const [expiryLocal, setExpiryLocal] = useState(
    file.expires_at
      ? new Date(file.expires_at).toISOString().slice(0, 16)
      : "",
  );

  function download() {
    setError(null);
    startTransition(async () => {
      const res = await getSharedFileDownloadUrlAction(file.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      window.location.href = res.url;
    });
  }

  function addAccess() {
    setError(null);
    startTransition(async () => {
      const res = await addSharedFileAccessAction({
        fileId: file.id,
        email,
      });
      if (!res.ok) setError(res.error);
      else {
        setEmail("");
        if (res.warning) setError(res.warning);
        router.refresh();
      }
    });
  }

  function removeAccess(accessId: string) {
    setError(null);
    startTransition(async () => {
      const res = await removeSharedFileAccessAction({
        fileId: file.id,
        accessId,
      });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function saveExpiry() {
    setError(null);
    if (!expiryLocal) {
      setError("Choose an expiry date.");
      return;
    }
    startTransition(async () => {
      const res = await updateSharedFileExpiryAction({
        fileId: file.id,
        expiresAt: new Date(expiryLocal).toISOString(),
      });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function removeFile() {
    if (!confirm("Delete this file from PathX and S3 permanently?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteSharedFileAction(file.id);
      if (!res.ok) setError(res.error);
      else router.push("/pathx/shared-files");
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/pathx/shared-files">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to shared files
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {file.title || file.original_filename}
        </h1>
        {file.title ? (
          <p className="mt-1 text-muted-foreground">{file.original_filename}</p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className={cn(cardClass)}>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Status: {file.status} · {formatBytes(file.byte_size)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            <span className="text-muted-foreground">Expires: </span>
            {file.expires_at
              ? new Date(file.expires_at).toLocaleString()
              : "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Created: </span>
            {new Date(file.created_at).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2">
            {file.status === "ready" ? (
              <Button type="button" onClick={download} disabled={pending}>
                {pending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download
              </Button>
            ) : null}
            {!clientMode ? (
              <Button
                type="button"
                variant="outline"
                onClick={removeFile}
                disabled={pending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete permanently
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {!clientMode && file.status === "ready" ? (
        <>
          <Card className={cn(cardClass)}>
            <CardHeader>
              <CardTitle>Expiry</CardTitle>
              <CardDescription>
                After this time clients cannot download; cleanup deletes the S3
                object.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expires at</Label>
                <Input
                  id="expiry"
                  type="datetime-local"
                  value={expiryLocal}
                  onChange={(e) => setExpiryLocal(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <Button type="button" onClick={saveExpiry} disabled={pending}>
                Save expiry
              </Button>
            </CardContent>
          </Card>

          <Card className={cn(cardClass)}>
            <CardHeader>
              <CardTitle>Client access</CardTitle>
              <CardDescription>
                Clients get a magic-link email to sign in — no password needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[240px] flex-1 space-y-2">
                  <Label htmlFor="access-email">Email</Label>
                  <Input
                    id="access-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                    placeholder="client@company.com"
                  />
                </div>
                <Button type="button" onClick={addAccess} disabled={pending || !email}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
              {access.length === 0 ? (
                <p className="text-sm text-muted-foreground">No client emails yet.</p>
              ) : (
                <ul className="divide-y divide-white/[0.06] rounded-md border border-white/[0.08]">
                  {access.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span>{a.email}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAccess(a.id)}
                        disabled={pending}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
