import "server-only";

import { readEnv } from "@/lib/email/read-env";

const DEFAULT_MAX_BYTES = 5_368_709_120; // 5 GiB
const DEFAULT_DOWNLOAD_TTL = 900;
const DEFAULT_PART_SIZE = 16 * 1024 * 1024; // 16 MiB

export function s3Config() {
  const region = readEnv("AWS_REGION") || "us-east-2";
  const accessKeyId = readEnv("AWS_ACCESS_KEY_ID");
  const secretAccessKey = readEnv("AWS_SECRET_ACCESS_KEY");
  const bucket = readEnv("AWS_S3_BUCKET") || "pathxdx-images";
  const prefix = (readEnv("AWS_S3_SHARED_PREFIX") || "shared-files/").replace(
    /^\/+|\/+$/g,
    "",
  );
  const maxBytes = Number(readEnv("SHARED_FILE_MAX_BYTES") || DEFAULT_MAX_BYTES);
  const downloadTtlSeconds = Number(
    readEnv("SHARED_FILE_DOWNLOAD_TTL_SECONDS") || DEFAULT_DOWNLOAD_TTL,
  );
  const partSizeBytes = Number(
    readEnv("SHARED_FILE_PART_SIZE_BYTES") || DEFAULT_PART_SIZE,
  );

  return {
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
    prefix: prefix ? `${prefix}/` : "shared-files/",
    maxBytes: Number.isFinite(maxBytes) && maxBytes > 0 ? maxBytes : DEFAULT_MAX_BYTES,
    downloadTtlSeconds:
      Number.isFinite(downloadTtlSeconds) && downloadTtlSeconds > 60
        ? downloadTtlSeconds
        : DEFAULT_DOWNLOAD_TTL,
    partSizeBytes:
      Number.isFinite(partSizeBytes) && partSizeBytes >= 5 * 1024 * 1024
        ? partSizeBytes
        : DEFAULT_PART_SIZE,
  };
}

export function assertS3Configured(): {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  prefix: string;
  maxBytes: number;
  downloadTtlSeconds: number;
  partSizeBytes: number;
} {
  const cfg = s3Config();
  if (!cfg.accessKeyId || !cfg.secretAccessKey) {
    throw new Error(
      "AWS S3 is not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.",
    );
  }
  return {
    ...cfg,
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
  };
}

export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop()?.trim() || "file";
  return base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180) || "file";
}

export function sharedFileObjectKey(fileId: string, filename: string): string {
  const cfg = s3Config();
  return `${cfg.prefix}${fileId}/${sanitizeFilename(filename)}`;
}
