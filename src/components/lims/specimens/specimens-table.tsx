import Link from "next/link";
import { StatusBadge } from "@/components/lims/status-badge";
import type { SpecimenWithAccession } from "@/lib/lims/types";

export function SpecimensTable({ specimens }: { specimens: SpecimenWithAccession[] }) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Specimen ID</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Accession</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tissue</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {specimens.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No specimens yet.</td></tr>
          )}
          {specimens.map((s) => (
            <tr key={s.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/specimens/${s.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                  {s.specimen_id}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/accessions/${s.accession_id}`} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                  {s.accession?.accession_id}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge status={s.specimen_type} />
              </td>
              <td className="px-4 py-2.5">
                {s.tissue_abbreviation && (
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded font-medium">
                    {s.tissue_abbreviation}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {s.specimen_type === "mouse_tissue" && (
                  <span>{s.mouse_id ?? "—"} · {s.strain ?? "—"} · {s.sex ?? "—"}{s.day_post_treatment != null ? ` · D${s.day_post_treatment}` : ""}</span>
                )}
                {s.specimen_type === "human_tissue" && (
                  <span>{s.diagnosis ?? "—"}</span>
                )}
                {s.specimen_type === "cell_pellet" && (
                  <span>{s.cell_line ?? "—"}{s.overexpressed_marker ? ` · ${s.overexpressed_marker}↑` : ""}</span>
                )}
              </td>
              <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
