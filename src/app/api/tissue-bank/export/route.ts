import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { applyTissueFilters } from "@/lib/tissue/list-tissue";
import type { TissueListFilters } from "@/lib/tissue/types";
import { parseTissueSearchParams } from "@/lib/tissue/search-params";

function csvEscape(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

/** Include `id` for stable `order` + `range` pagination (PostgREST expects ordered keyset). */
const SELECT_COLS =
  "id,catalog_id,accession,dob,gender,tissue,category,diag_short,diag_text,source_tab,status,created_at,sold_at,sold_note,discarded_at,discarded_note";

/** PostgREST default max rows is often 1000; paginate to return the full filtered set. */
const PAGE_SIZE = 1000;

function rowToCsvLine(r: Record<string, unknown>): string {
  const dob = r.dob != null ? String(r.dob) : "";
  const age =
    dob && dob !== "nan"
      ? String(
          Math.floor(
            (new Date("2024-01-01").getTime() - new Date(dob).getTime()) /
              31557600000,
          ) || "",
        )
      : "";
  return [
    r.catalog_id ?? "",
    r.accession ?? "",
    r.gender ?? "",
    age,
    dob,
    r.tissue ?? "",
    r.category ?? "",
    csvEscape(String(r.diag_short ?? "")),
    csvEscape(String(r.diag_text ?? "")),
    r.source_tab ?? "",
    r.status ?? "",
    r.created_at ?? "",
    r.sold_at ?? "",
    csvEscape(String(r.sold_note ?? "")),
    r.discarded_at ?? "",
    csvEscape(String(r.discarded_note ?? "")),
  ].join(",");
}

async function fetchAllTissueRowsForExport(
  supabase: SupabaseClient,
  filters: TissueListFilters,
  publicAvailableOnly: boolean,
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let from = 0;
  for (;;) {
    let q = supabase.from("tissue_inventory").select(SELECT_COLS);
    q = applyTissueFilters(q, filters, publicAvailableOnly);
    q = q.order("id", { ascending: true });
    const { data, error } = await q.range(from, from + PAGE_SIZE - 1);
    if (error) {
      throw error;
    }
    const chunk = (data ?? []) as Record<string, unknown>[];
    all.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = Object.fromEntries(req.nextUrl.searchParams.entries());
  const { filters } = parseTissueSearchParams(sp);

  const supabaseUser = await createClient();
  const {
    data: { user },
  } = await supabaseUser.auth.getUser();

  const hdr =
    "CatalogID,Accession,Gender,Age,DOB,Tissue,Category,DiagnosisShort,DiagnosisFull,Tab,Status,CreatedAt,SoldAt,SoldNote,DiscardedAt,DiscardedNote";

  try {
    if (user) {
      const rows = await fetchAllTissueRowsForExport(
        supabaseUser,
        filters,
        false,
      );
      const body = [hdr, ...rows.map(rowToCsvLine)].join("\n");
      return new NextResponse(body, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Disposition": `attachment; filename="PathXDx_tissue_export_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const supabase = createServiceRoleClient();
    const rows = await fetchAllTissueRowsForExport(supabase, filters, true);
    const body = [hdr, ...rows.map(rowToCsvLine)].join("\n");
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="PathXDx_tissue_catalog_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
