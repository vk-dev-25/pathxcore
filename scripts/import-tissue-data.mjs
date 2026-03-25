/**
 * One-time import of legacy data.json into public.tissue_inventory.
 *
 * Usage:
 *   node scripts/import-tissue-data.mjs /path/to/data.json
 *
 * Requires env (e.g. from .env or shell):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadDotEnv() {
  try {
    const p = resolve(process.cwd(), ".env");
    const raw = readFileSync(p, "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* no .env */
  }
}

loadDotEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jsonPath = process.argv[2];

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!jsonPath) {
  console.error("Usage: node scripts/import-tissue-data.mjs /path/to/data.json");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("Reading JSON (may take a moment)…");
const raw = JSON.parse(readFileSync(resolve(jsonPath), "utf8"));
if (!Array.isArray(raw)) {
  console.error("data.json must be a JSON array.");
  process.exit(1);
}

const BATCH = 400;
let inserted = 0;
let updated = 0;
let skipped = 0;
let errors = 0;

for (let i = 0; i < raw.length; i += BATCH) {
  const chunk = raw.slice(i, i + BATCH);
  const rows = [];

  for (const r of chunk) {
    if (!Array.isArray(r) || r.length < 7) {
      skipped++;
      continue;
    }
    const catalogId = r[8] != null ? String(r[8]).trim() : "";
    const row = {
      accession: String(r[0] ?? "").trim(),
      dob: r[1] != null ? String(r[1]) : null,
      gender: r[2] != null ? String(r[2]) : null,
      tissue: String(r[3] ?? "").trim(),
      diag_short: r[4] != null ? String(r[4]) : null,
      diag_text: r[5] != null ? String(r[5]) : null,
      category: String(r[6] ?? "").trim(),
      source_tab: r[7] != null ? String(r[7]) : "Sheet1",
      catalog_id: catalogId || null,
      status: "available",
    };
    if (!row.accession || !row.tissue || !row.category) {
      skipped++;
      continue;
    }
    rows.push(row);
  }

  if (!rows.length) continue;

  const withCatalog = rows.filter((r) => r.catalog_id);
  const withoutCatalog = rows.filter((r) => !r.catalog_id);

  let batchErr = null;
  if (withCatalog.length) {
    const ids = [...new Set(withCatalog.map((r) => r.catalog_id))];
    const { data: existingRows, error: preErr } = await supabase
      .from("tissue_inventory")
      .select("catalog_id")
      .in("catalog_id", ids);
    if (preErr) {
      console.error(`Batch ${i} (precheck):`, preErr.message);
      errors++;
    } else {
      const existing = new Set(
        (existingRows ?? []).map((e) => e.catalog_id).filter(Boolean),
      );
      const toUpdate = withCatalog.filter((r) => existing.has(r.catalog_id));
      const toInsert = withCatalog.filter((r) => !existing.has(r.catalog_id));

      if (toInsert.length) {
        const { error: insErr } = await supabase
          .from("tissue_inventory")
          .insert(toInsert);
        if (insErr) {
          batchErr = insErr;
        } else {
          inserted += toInsert.length;
        }
      }

      if (!batchErr && toUpdate.length) {
        for (const row of toUpdate) {
          const { error: updErr } = await supabase
            .from("tissue_inventory")
            .update({
              accession: row.accession,
              dob: row.dob,
              gender: row.gender,
              tissue: row.tissue,
              diag_short: row.diag_short,
              diag_text: row.diag_text,
              category: row.category,
              source_tab: row.source_tab,
              status: row.status,
            })
            .eq("catalog_id", row.catalog_id)
            .limit(1);
          if (updErr) {
            batchErr = updErr;
            break;
          }
          updated++;
        }
      }
    }
  }
  if (!batchErr && withoutCatalog.length) {
    const { error } = await supabase.from("tissue_inventory").insert(withoutCatalog);
    if (error) {
      batchErr = error;
    } else {
      inserted += withoutCatalog.length;
    }
  }

  if (batchErr) {
    console.error(`Batch ${i}:`, batchErr.message);
    errors++;
  }

  if (i % (BATCH * 25) === 0 && i > 0) {
    console.log(`… ${i.toLocaleString()} / ${raw.length.toLocaleString()} rows processed`);
  }
}

console.log("Done.");
console.log({ inserted, updated, skipped, errors, total: raw.length });
