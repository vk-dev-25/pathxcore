import type { PrintThermalLabelOptions } from "@/lib/print-thermal-label";
import { buildLimsLabelPages } from "@/lib/print-thermal-label";

/**
 * ZPL for Zebra thermal printers (raw 9100 / driver “raw” queue).
 * 203 dpi, 1" × 1" (^PW/^LL in dots). Browsers cannot open TCP to the printer;
 * use Download / Copy and send via Zebra Setup Utilities, `nc IP 9100 < file.zpl`,
 * or an on‑LAN print service.
 */

function sanitizeZplField(s: string): string {
  return s.replace(/[\^~\\\r\n]/g, " ").trim().slice(0, 200);
}

/** Single-line ^FB, right-justified. TOP at 0; BOTTOM clears first line (15-dot font + gap). */
const FIELD_X = 4;
const FIELD_W = 199;
const TOP_BLOCK_Y = 0;
const BOTTOM_BLOCK_Y = 22;

/** One label: ^XA … ^XZ */
function singleLabelZpl(top: string, bottom: string): string {
  const t = sanitizeZplField(top);
  const b = sanitizeZplField(bottom);
  return (
    "^XA" +
    "^FX 203x203dots 1in preview use 1in media^FS" +
    "^PON" +
    "^PW203" +
    "^LL203" +
    "^LH0,0" +
    "^LT0" +
    "^CI28" +
    "^FO" +
    FIELD_X +
    "," +
    TOP_BLOCK_Y +
    "^FB" +
    FIELD_W +
    ",1,0,R,0^A0N,15,15^FD" +
    t +
    "^FS" +
    "^FO" +
    FIELD_X +
    "," +
    BOTTOM_BLOCK_Y +
    "^FB" +
    FIELD_W +
    ",1,0,R,0^A0N,17,17^FD" +
    b +
    "^FS" +
    "^XZ"
  );
}

export function buildLimsLabelsZpl(pages: { top: string; bottom: string }[]): string {
  return pages.map((p) => singleLabelZpl(p.top, p.bottom)).join("\n");
}

export function buildZplFromThermalLabelOptions(
  options: PrintThermalLabelOptions,
): string {
  return buildLimsLabelsZpl(buildLimsLabelPages(options));
}

export function downloadZplFile(filename: string, zpl: string): void {
  const blob = new Blob([zpl], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".zpl") ? filename : `${filename}.zpl`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyZplToClipboard(zpl: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(zpl);
    return true;
  } catch {
    return false;
  }
}
