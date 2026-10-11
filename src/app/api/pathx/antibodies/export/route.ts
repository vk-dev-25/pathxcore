import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { fetchAllAntibodiesForExport } from "@/lib/antibodies/list-antibodies";
import type { AntibodyRow } from "@/lib/antibodies/types";

export const dynamic = "force-dynamic";

function csvEscape(s: string): string {
  return `"${String(s).replace(/"/g, '""')}"`;
}

const CSV_HEADER = [
  "Id",
  "Antibody name",
  "Clone",
  "Vendor",
  "Catalog",
  "Lot number",
  "Ig species",
  "Provided by",
  "Date provided",
  "Working concentration",
  "Antigen retrieval",
  "Detection method",
  "Last updated by",
  "Created at",
  "Updated at",
].join(",");

function rowToLine(r: AntibodyRow): string {
  const clone = r.clone_detail ?? "";
  return [
    r.id,
    csvEscape(r.antibody_name ?? ""),
    csvEscape(clone),
    csvEscape(r.vendor_name ?? ""),
    csvEscape(r.catalog ?? ""),
    csvEscape(r.lot_number ?? ""),
    csvEscape(r.ig_species ?? ""),
    csvEscape(r.provided_by ?? ""),
    r.date_provided ?? "",
    csvEscape(r.working_concentration ?? ""),
    csvEscape(r.antigen_retrieval ?? ""),
    csvEscape(r.detection_method ?? ""),
    csvEscape(r.last_updated_by ?? ""),
    r.created_at ?? "",
    r.updated_at ?? "",
  ].join(",");
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await fetchAllAntibodiesForExport();
    const lines = [CSV_HEADER, ...rows.map(rowToLine)];
    const body = `\uFEFF${lines.join("\r\n")}`;
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="PathX_antibodies_${date}.csv"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
