import { StatusBadge } from "@/components/lims/status-badge";
import type { InhouseLibrary } from "@/lib/lims/types";

export function LibraryTable({ entries }: { entries: InhouseLibrary[] }) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Library ID</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cell Line</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Marker</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Expression</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Used</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {entries.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No in-house controls registered yet.</td></tr>
          )}
          {entries.map((e) => (
            <tr key={e.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5 font-mono text-xs font-semibold">{e.library_id}</td>
              <td className="px-4 py-2.5 font-medium">{e.cell_line}</td>
              <td className="px-4 py-2.5">{e.marker}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{e.expression_level ?? "—"}</td>
              <td className="px-4 py-2.5"><StatusBadge status={e.role} /></td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {e.last_used_date ? new Date(e.last_used_date).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground max-w-[200px] truncate">{e.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
