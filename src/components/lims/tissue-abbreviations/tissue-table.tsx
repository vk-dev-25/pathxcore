import type { TissueAbbreviation } from "@/lib/lims/types";

export function TissueTable({ tissues }: { tissues: TissueAbbreviation[] }) {
  // Group by organ system
  const groups = tissues.reduce<Record<string, TissueAbbreviation[]>>((acc, t) => {
    const sys = t.organ_system ?? "Other";
    if (!acc[sys]) acc[sys] = [];
    acc[sys].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([system, tissues]) => (
        <div key={system}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {system}
          </h3>
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border/60">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">Abbrev</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tissue Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Decal</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tissues.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-2">
                      <span className="font-mono font-bold text-primary">{t.abbreviation}</span>
                    </td>
                    <td className="px-4 py-2 font-medium">{t.name}</td>
                    <td className="px-4 py-2">
                      {t.requires_decal ? (
                        <span className="text-xs bg-amber-500/10 text-amber-600 rounded px-1.5 py-0.5">Required</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground text-xs">{t.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
