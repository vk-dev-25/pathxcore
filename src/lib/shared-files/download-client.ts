/** Browser-side accelerated download via parallel Range requests. */

const PARALLEL_THRESHOLD_BYTES = 8 * 1024 * 1024; // 8 MiB
/** Above this, avoid holding the whole file in RAM — use single-stream navigate. */
const IN_MEMORY_MAX_BYTES = 768 * 1024 * 1024; // 768 MiB
const CONCURRENCY = 6;

export type ParallelDownloadProgress = {
  loaded: number;
  total: number;
  pct: number;
};

function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

async function fetchRange(
  url: string,
  start: number,
  end: number,
): Promise<ArrayBuffer> {
  const res = await fetch(url, {
    headers: { Range: `bytes=${start}-${end}` },
    mode: "cors",
    credentials: "omit",
  });
  if (!(res.status === 206 || res.status === 200)) {
    throw new Error(`Download part failed (HTTP ${res.status}).`);
  }
  return res.arrayBuffer();
}

async function downloadParallelInMemory(
  url: string,
  filename: string,
  total: number,
  onProgress?: (p: ParallelDownloadProgress) => void,
): Promise<void> {
  const partSize = Math.max(Math.ceil(total / (CONCURRENCY * 2)), 4 * 1024 * 1024);
  const partCount = Math.ceil(total / partSize);
  const parts: ArrayBuffer[] = new Array(partCount);
  let loaded = 0;
  let next = 0;

  async function worker() {
    while (true) {
      const i = next;
      next += 1;
      if (i >= partCount) return;
      const start = i * partSize;
      const end = Math.min(start + partSize - 1, total - 1);
      const buf = await fetchRange(url, start, end);
      parts[i] = buf;
      loaded += buf.byteLength;
      onProgress?.({
        loaded,
        total,
        pct: Math.min(100, Math.round((loaded / total) * 100)),
      });
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, partCount) }, () => worker()),
  );
  triggerBlobDownload(new Blob(parts), filename);
}

/**
 * Download via parallel Ranges when size is known and mid-sized.
 * Falls back to navigating to the signed URL (still uses Transfer Acceleration).
 */
export async function downloadSharedFile(input: {
  url: string;
  filename: string;
  byteSize: number | null;
  onProgress?: (p: ParallelDownloadProgress) => void;
}): Promise<"parallel" | "direct"> {
  const size = input.byteSize && input.byteSize > 0 ? input.byteSize : null;

  if (
    size &&
    size >= PARALLEL_THRESHOLD_BYTES &&
    size <= IN_MEMORY_MAX_BYTES
  ) {
    try {
      await downloadParallelInMemory(
        input.url,
        input.filename,
        size,
        input.onProgress,
      );
      return "parallel";
    } catch (e) {
      console.warn("parallel download failed, falling back to direct", e);
    }
  }

  // Single-connection browser download (accelerate endpoint still applies).
  window.location.href = input.url;
  return "direct";
}
