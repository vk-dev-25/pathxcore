import { NextResponse } from "next/server";

import { readEnv } from "@/lib/email/read-env";
import {
  abortMultipartUpload,
  deleteS3Object,
} from "@/lib/s3/shared-files";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function expireSharedFiles(request: Request) {
  const secret = readEnv("CRON_SECRET");
  const auth = request.headers.get("authorization") || "";
  const url = new URL(request.url);
  const qSecret = url.searchParams.get("secret") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!secret || (bearer !== secret && qSecret !== secret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const nowIso = new Date().toISOString();
  const staleUploadCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const [readyRes, staleRes] = await Promise.all([
    admin
      .from("shared_files")
      .select("id, s3_key, upload_id, status")
      .eq("status", "ready")
      .lt("expires_at", nowIso),
    admin
      .from("shared_files")
      .select("id, s3_key, upload_id, status")
      .in("status", ["uploading", "failed"])
      .lt("created_at", staleUploadCutoff),
  ]);

  if (readyRes.error || staleRes.error) {
    const msg = readyRes.error?.message || staleRes.error?.message || "query failed";
    console.error("expire-shared-files query", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  const expired = [...(readyRes.data ?? []), ...(staleRes.data ?? [])];

  let deleted = 0;
  let marked = 0;
  for (const row of expired) {
    const key = row.s3_key as string;
    const uploadId = row.upload_id as string | null;
    const status = row.status as string;

    if (uploadId && key) {
      try {
        await abortMultipartUpload({ key, uploadId });
      } catch (e) {
        console.warn("expire abort multipart", row.id, e);
      }
    }
    if (key && (status === "ready" || status === "failed")) {
      try {
        await deleteS3Object(key);
        deleted += 1;
      } catch (e) {
        console.warn("expire delete object", row.id, e);
      }
    }

    const nextStatus = status === "ready" ? "expired" : "deleted";
    const { error: updErr } = await admin
      .from("shared_files")
      .update({
        status: nextStatus,
        deleted_at: nowIso,
        upload_id: null,
        updated_at: nowIso,
      })
      .eq("id", row.id);
    if (!updErr) marked += 1;
  }

  return NextResponse.json({
    ok: true,
    scanned: expired?.length ?? 0,
    deletedObjects: deleted,
    markedRows: marked,
  });
}

export async function GET(request: Request) {
  return expireSharedFiles(request);
}

export async function POST(request: Request) {
  return expireSharedFiles(request);
}
