import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

import { assertS3Configured } from "@/lib/s3/config";

let cached: S3Client | null = null;

export function getS3Client(): S3Client {
  if (cached) return cached;
  const cfg = assertS3Configured();
  cached = new S3Client({
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    // Uses pathxdx-images.s3-accelerate.amazonaws.com when enabled on the bucket.
    useAccelerateEndpoint: cfg.useAccelerate,
  });
  return cached;
}
