import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

/** Trim and strip a single pair of surrounding quotes (common .env typo). */
export function readEnv(name: string): string {
  const raw = process.env[name];
  if (raw == null) return "";
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
    (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}
