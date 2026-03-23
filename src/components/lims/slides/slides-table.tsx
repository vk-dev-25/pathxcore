import Link from "next/link";
import { StatusBadge } from "@/components/lims/status-badge";
import type { SlideWithSpecimen } from "@/lib/lims/types";

export function SlidesTable({ slides }: { slides: SlideWithSpecimen[] }) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Slide ID</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Specimen</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Section #</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cut Date</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Label Type</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stain Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Marker / Stain</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {slides.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No slides yet.</td></tr>
          )}
          {slides.map((s) => (
            <tr key={s.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5">
                <span className="font-mono text-xs font-semibold text-foreground">{s.slide_id}</span>
              </td>
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/specimens/${s.specimen_id}`} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                  {s.specimen?.specimen_id}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-center text-muted-foreground">{s.section_number ?? "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {s.cut_date ? new Date(s.cut_date).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-2.5">
                {s.label_type ? <StatusBadge status={s.label_type} /> : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-2.5"><StatusBadge status={s.stain_status} /></td>
              <td className="px-4 py-2.5">
                {s.stain_status === "unassigned" ? (
                  <span className="text-xs text-muted-foreground italic">— handwrite on slide —</span>
                ) : (
                  <span className="text-xs font-medium">{s.marker ?? s.stain_type ?? "—"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
