import "server-only";

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  UploadPartCommand,
  type CompletedPart,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getS3Client } from "@/lib/s3/client";
import { assertS3Configured } from "@/lib/s3/config";

export async function createMultipartUpload(input: {
  key: string;
  contentType: string;
}): Promise<{ uploadId: string }> {
  const cfg = assertS3Configured();
  const client = getS3Client();
  const res = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: cfg.bucket,
      Key: input.key,
      ContentType: input.contentType || "application/octet-stream",
    }),
  );
  if (!res.UploadId) throw new Error("Could not start multipart upload.");
  return { uploadId: res.UploadId };
}

export async function presignUploadPart(input: {
  key: string;
  uploadId: string;
  partNumber: number;
}): Promise<string> {
  const cfg = assertS3Configured();
  const client = getS3Client();
  const command = new UploadPartCommand({
    Bucket: cfg.bucket,
    Key: input.key,
    UploadId: input.uploadId,
    PartNumber: input.partNumber,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function completeMultipartUpload(input: {
  key: string;
  uploadId: string;
  parts: CompletedPart[];
}): Promise<void> {
  const cfg = assertS3Configured();
  const client = getS3Client();
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: cfg.bucket,
      Key: input.key,
      UploadId: input.uploadId,
      MultipartUpload: {
        Parts: [...input.parts].sort(
          (a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0),
        ),
      },
    }),
  );
}

export async function abortMultipartUpload(input: {
  key: string;
  uploadId: string;
}): Promise<void> {
  const cfg = assertS3Configured();
  const client = getS3Client();
  await client.send(
    new AbortMultipartUploadCommand({
      Bucket: cfg.bucket,
      Key: input.key,
      UploadId: input.uploadId,
    }),
  );
}

/**
 * S3 ResponseContentDisposition must be ISO-8859-1 safe for `filename=`,
 * so use an ASCII fallback plus RFC 5987 `filename*` for the real name.
 */
function contentDispositionAttachment(filename: string): string {
  const raw = filename.split(/[/\\]/).pop()?.trim() || "download";
  const ascii = raw
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]+/g, "_")
    .replace(/["\\]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 180) || "download";
  const utf8Star = encodeURIComponent(raw).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8Star}`;
}

export async function presignDownload(input: {
  key: string;
  filename: string;
}): Promise<string> {
  const cfg = assertS3Configured();
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: cfg.bucket,
    Key: input.key,
    ResponseContentDisposition: contentDispositionAttachment(input.filename),
  });
  return getSignedUrl(client, command, { expiresIn: cfg.downloadTtlSeconds });
}

export async function deleteS3Object(key: string): Promise<void> {
  const cfg = assertS3Configured();
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
    }),
  );
}
