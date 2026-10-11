"use server";

import { revalidatePath } from "next/cache";

import { inviteClientUser } from "@/lib/auth/invite-client";
import { notifySharedFileAccess } from "@/lib/email/shared-file-notify";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  deleteS3Object,
  presignDownload,
  presignUploadPart,
} from "@/lib/s3/shared-files";
import { assertS3Configured, sharedFileObjectKey } from "@/lib/s3/config";
import { getViewerContext } from "@/lib/trackers/access";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SharedFileAccessRow, SharedFileRow } from "@/lib/shared-files/types";
import { isSharedFileStatus } from "@/lib/shared-files/types";

export type ActionResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

function requireStaff() {
  return getViewerContext().then((v) => {
    if (!v) return { ok: false as const, error: "You must be signed in.", viewer: null };
    if (v.role !== "staff") {
      return { ok: false as const, error: "Only PathX staff can manage shared files.", viewer: null };
    }
    return { ok: true as const, viewer: v };
  });
}

export async function listSharedFilesAction(): Promise<
  | { ok: true; files: SharedFileRow[]; clientMode: boolean }
  | { ok: false; error: string }
> {
  const viewer = await getViewerContext();
  if (!viewer) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  let query = supabase
    .from("shared_files")
    .select(
      "id, title, original_filename, content_type, byte_size, s3_key, upload_id, status, expires_at, created_by, created_at, updated_at, deleted_at",
    )
    .order("created_at", { ascending: false });

  if (viewer.role === "client") {
    query = query.eq("status", "ready").gt("expires_at", new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) {
    console.error("listSharedFilesAction", error.message);
    return { ok: false, error: "Could not load shared files." };
  }

  return {
    ok: true,
    clientMode: viewer.role === "client",
    files: (data ?? []).map(mapFile),
  };
}

export async function getSharedFileDetailAction(
  fileId: string,
): Promise<
  | {
      ok: true;
      file: SharedFileRow;
      access: SharedFileAccessRow[];
      clientMode: boolean;
    }
  | { ok: false; error: string }
> {
  const viewer = await getViewerContext();
  if (!viewer) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data: file, error } = await supabase
    .from("shared_files")
    .select(
      "id, title, original_filename, content_type, byte_size, s3_key, upload_id, status, expires_at, created_by, created_at, updated_at, deleted_at",
    )
    .eq("id", fileId)
    .maybeSingle();
  if (error || !file) return { ok: false, error: "File not found." };

  const mapped = mapFile(file);
  if (viewer.role === "client") {
    if (
      mapped.status !== "ready" ||
      !mapped.expires_at ||
      new Date(mapped.expires_at).getTime() <= Date.now()
    ) {
      return { ok: false, error: "This file is no longer available." };
    }
  }

  let access: SharedFileAccessRow[] = [];
  if (viewer.role === "staff") {
    const { data: rows } = await supabase
      .from("shared_file_access")
      .select("id, shared_file_id, email, added_by, created_at")
      .eq("shared_file_id", fileId)
      .order("created_at", { ascending: true });
    access = (rows ?? []).map((r) => ({
      id: r.id as string,
      shared_file_id: r.shared_file_id as string,
      email: r.email as string,
      added_by: (r.added_by as string) ?? null,
      created_at: r.created_at as string,
    }));
  }

  return { ok: true, file: mapped, access, clientMode: viewer.role === "client" };
}

export async function startSharedFileUploadAction(input: {
  filename: string;
  contentType: string;
  byteSize: number;
  title?: string;
}): Promise<
  | {
      ok: true;
      fileId: string;
      uploadId: string;
      key: string;
      partSizeBytes: number;
      maxBytes: number;
    }
  | { ok: false; error: string }
> {
  const gate = await requireStaff();
  if (!gate.ok || !gate.viewer) return { ok: false, error: gate.error };

  let cfg;
  try {
    cfg = assertS3Configured();
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "S3 is not configured.",
    };
  }

  if (!input.filename.trim()) {
    return { ok: false, error: "Filename is required." };
  }
  if (!Number.isFinite(input.byteSize) || input.byteSize <= 0) {
    return { ok: false, error: "Invalid file size." };
  }
  if (input.byteSize > cfg.maxBytes) {
    return {
      ok: false,
      error: `File exceeds the maximum size of ${Math.round(cfg.maxBytes / (1024 * 1024))} MB.`,
    };
  }

  const supabase = await createClient();
  const fileId = crypto.randomUUID();
  const key = sharedFileObjectKey(fileId, input.filename);

  let uploadId: string;
  try {
    ({ uploadId } = await createMultipartUpload({
      key,
      contentType: input.contentType || "application/octet-stream",
    }));
  } catch (e) {
    console.error("startSharedFileUploadAction createMultipart", e);
    return {
      ok: false,
      error: "Could not start S3 upload. Check AWS credentials and CORS.",
    };
  }

  const { error } = await supabase.from("shared_files").insert({
    id: fileId,
    title: input.title?.trim() || null,
    original_filename: input.filename.trim(),
    content_type: input.contentType || "application/octet-stream",
    byte_size: input.byteSize,
    s3_key: key,
    upload_id: uploadId,
    status: "uploading",
    created_by: gate.viewer.userId,
  });
  if (error) {
    console.error("startSharedFileUploadAction insert", error.message);
    try {
      await abortMultipartUpload({ key, uploadId });
    } catch {
      /* ignore */
    }
    return { ok: false, error: "Could not create shared file record." };
  }

  revalidatePath("/pathx/shared-files");
  return {
    ok: true,
    fileId,
    uploadId,
    key,
    partSizeBytes: cfg.partSizeBytes,
    maxBytes: cfg.maxBytes,
  };
}

export async function presignSharedFilePartAction(input: {
  fileId: string;
  partNumber: number;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const gate = await requireStaff();
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!Number.isInteger(input.partNumber) || input.partNumber < 1) {
    return { ok: false, error: "Invalid part number." };
  }

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("shared_files")
    .select("id, s3_key, upload_id, status")
    .eq("id", input.fileId)
    .maybeSingle();
  if (!file || file.status !== "uploading" || !file.upload_id) {
    return { ok: false, error: "Upload is not active." };
  }

  try {
    const url = await presignUploadPart({
      key: file.s3_key as string,
      uploadId: file.upload_id as string,
      partNumber: input.partNumber,
    });
    return { ok: true, url };
  } catch (e) {
    console.error("presignSharedFilePartAction", e);
    return { ok: false, error: "Could not prepare upload part." };
  }
}

export async function completeSharedFileUploadAction(input: {
  fileId: string;
  parts: { partNumber: number; etag: string }[];
  expiresAt: string;
  emails: string[];
  title?: string;
}): Promise<ActionResult> {
  const gate = await requireStaff();
  if (!gate.ok || !gate.viewer) return { ok: false, error: gate.error };

  const expiresMs = Date.parse(input.expiresAt);
  if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) {
    return { ok: false, error: "Expiry must be a future date/time." };
  }
  if (!input.parts.length) {
    return { ok: false, error: "No uploaded parts to complete." };
  }

  const emails = [
    ...new Set(
      input.emails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)),
    ),
  ];

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("shared_files")
    .select("id, s3_key, upload_id, status, original_filename")
    .eq("id", input.fileId)
    .maybeSingle();
  if (!file || file.status !== "uploading" || !file.upload_id) {
    return { ok: false, error: "Upload is not active." };
  }

  try {
    await completeMultipartUpload({
      key: file.s3_key as string,
      uploadId: file.upload_id as string,
      parts: input.parts.map((p) => ({
        PartNumber: p.partNumber,
        ETag: p.etag.includes('"') ? p.etag : `"${p.etag}"`,
      })),
    });
  } catch (e) {
    console.error("completeSharedFileUploadAction s3", e);
    await supabase
      .from("shared_files")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", input.fileId);
    return {
      ok: false,
      error: "Could not finalize upload in S3. Try again or abort and re-upload.",
    };
  }

  const expiresAtIso = new Date(expiresMs).toISOString();
  const { error: updErr } = await supabase
    .from("shared_files")
    .update({
      status: "ready",
      upload_id: null,
      expires_at: expiresAtIso,
      title: input.title?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.fileId);
  if (updErr) {
    console.error("completeSharedFileUploadAction update", updErr.message);
    return { ok: false, error: "Upload finished in S3 but could not update the record." };
  }

  let warning: string | undefined;
  if (emails.length) {
    const rows = emails.map((email) => ({
      shared_file_id: input.fileId,
      email,
      added_by: gate.viewer!.userId,
    }));
    const { error: accErr } = await supabase.from("shared_file_access").insert(rows);
    if (accErr) {
      console.error("completeSharedFileUploadAction access", accErr.message);
      warning = `Access rows may be incomplete: ${accErr.message}`;
    }
    const notified = await notifySharedFileAccess({
      fileId: input.fileId,
      filename: (file.original_filename as string) || "shared file",
      emails,
      expiresAt: expiresAtIso,
    });
    if (!notified.ok) {
      warning = `File uploaded, but notify email failed: ${notified.error}`;
    }
  }

  revalidatePath("/pathx/shared-files");
  revalidatePath(`/pathx/shared-files/${input.fileId}`);
  return { ok: true, warning };
}

export async function abortSharedFileUploadAction(
  fileId: string,
): Promise<ActionResult> {
  const gate = await requireStaff();
  if (!gate.ok) return { ok: false, error: gate.error };

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("shared_files")
    .select("id, s3_key, upload_id, status")
    .eq("id", fileId)
    .maybeSingle();
  if (!file) return { ok: false, error: "File not found." };

  if (file.upload_id && file.s3_key) {
    try {
      await abortMultipartUpload({
        key: file.s3_key as string,
        uploadId: file.upload_id as string,
      });
    } catch (e) {
      console.warn("abortSharedFileUploadAction abort", e);
    }
  }

  await supabase
    .from("shared_files")
    .update({
      status: "failed",
      upload_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId);

  revalidatePath("/pathx/shared-files");
  return { ok: true };
}

export async function addSharedFileAccessAction(input: {
  fileId: string;
  email: string;
}): Promise<ActionResult> {
  const gate = await requireStaff();
  if (!gate.ok || !gate.viewer) return { ok: false, error: gate.error };

  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email." };
  }

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("shared_files")
    .select("id, status, expires_at, original_filename")
    .eq("id", input.fileId)
    .maybeSingle();
  if (!file) return { ok: false, error: "File not found." };
  if (file.status !== "ready") {
    return { ok: false, error: "Access can only be granted after upload completes." };
  }

  await inviteClientUser(email);
  const { error } = await supabase.from("shared_file_access").insert({
    shared_file_id: input.fileId,
    email,
    added_by: gate.viewer.userId,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "That email already has access." };
    console.error("addSharedFileAccessAction", error.message);
    return { ok: false, error: "Could not add access." };
  }

  const notified = await notifySharedFileAccess({
    fileId: input.fileId,
    filename: (file.original_filename as string) || "shared file",
    emails: [email],
    expiresAt: (file.expires_at as string) ?? null,
  });

  revalidatePath(`/pathx/shared-files/${input.fileId}`);
  if (!notified.ok) {
    return {
      ok: true,
      warning: `Access added, but notify email failed: ${notified.error}`,
    };
  }
  return { ok: true };
}

export async function removeSharedFileAccessAction(input: {
  fileId: string;
  accessId: string;
}): Promise<ActionResult> {
  const gate = await requireStaff();
  if (!gate.ok) return { ok: false, error: gate.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("shared_file_access")
    .delete()
    .eq("id", input.accessId)
    .eq("shared_file_id", input.fileId);
  if (error) {
    console.error("removeSharedFileAccessAction", error.message);
    return { ok: false, error: "Could not remove access." };
  }
  revalidatePath(`/pathx/shared-files/${input.fileId}`);
  return { ok: true };
}

export async function getSharedFileDownloadUrlAction(
  fileId: string,
): Promise<{ ok: true; url: string; filename: string } | { ok: false; error: string }> {
  const viewer = await getViewerContext();
  if (!viewer) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("shared_files")
    .select("id, s3_key, status, expires_at, original_filename")
    .eq("id", fileId)
    .maybeSingle();
  if (!file) return { ok: false, error: "File not found." };

  if (file.status !== "ready") {
    return { ok: false, error: "This file is not available for download." };
  }
  if (!file.expires_at || new Date(file.expires_at as string).getTime() <= Date.now()) {
    return { ok: false, error: "This file has expired." };
  }

  if (viewer.role === "client") {
    const admin = createServiceRoleClient();
    const { data: access } = await admin
      .from("shared_file_access")
      .select("id")
      .eq("shared_file_id", fileId)
      .eq("email", viewer.email)
      .maybeSingle();
    if (!access) return { ok: false, error: "You do not have access to this file." };
  }

  try {
    const url = await presignDownload({
      key: file.s3_key as string,
      filename: (file.original_filename as string) || "download",
    });
    return {
      ok: true,
      url,
      filename: (file.original_filename as string) || "download",
    };
  } catch (e) {
    console.error("getSharedFileDownloadUrlAction", e);
    return { ok: false, error: "Could not create download link. Try again." };
  }
}

export async function updateSharedFileExpiryAction(input: {
  fileId: string;
  expiresAt: string;
}): Promise<ActionResult> {
  const gate = await requireStaff();
  if (!gate.ok) return { ok: false, error: gate.error };

  const expiresMs = Date.parse(input.expiresAt);
  if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) {
    return { ok: false, error: "Expiry must be a future date/time." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("shared_files")
    .update({
      expires_at: new Date(expiresMs).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.fileId)
    .eq("status", "ready");
  if (error) {
    console.error("updateSharedFileExpiryAction", error.message);
    return { ok: false, error: "Could not update expiry." };
  }
  revalidatePath(`/pathx/shared-files/${input.fileId}`);
  return { ok: true };
}

export async function deleteSharedFileAction(fileId: string): Promise<ActionResult> {
  const gate = await requireStaff();
  if (!gate.ok) return { ok: false, error: gate.error };

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("shared_files")
    .select("id, s3_key, upload_id, status")
    .eq("id", fileId)
    .maybeSingle();
  if (!file) return { ok: false, error: "File not found." };

  if (file.upload_id) {
    try {
      await abortMultipartUpload({
        key: file.s3_key as string,
        uploadId: file.upload_id as string,
      });
    } catch {
      /* ignore */
    }
  }
  if (file.s3_key && file.status !== "deleted") {
    try {
      await deleteS3Object(file.s3_key as string);
    } catch (e) {
      console.warn("deleteSharedFileAction s3", e);
    }
  }

  await supabase
    .from("shared_files")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      upload_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId);

  revalidatePath("/pathx/shared-files");
  return { ok: true };
}

function mapFile(row: Record<string, unknown>): SharedFileRow {
  const status = String(row.status ?? "failed");
  return {
    id: row.id as string,
    title: (row.title as string) ?? null,
    original_filename: row.original_filename as string,
    content_type: (row.content_type as string) || "application/octet-stream",
    byte_size: Number(row.byte_size) || 0,
    s3_key: row.s3_key as string,
    upload_id: (row.upload_id as string) ?? null,
    status: isSharedFileStatus(status) ? status : "failed",
    expires_at: (row.expires_at as string) ?? null,
    created_by: (row.created_by as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    deleted_at: (row.deleted_at as string) ?? null,
  };
}
