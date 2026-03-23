import Link from "next/link";
import { StatusBadge } from "@/components/lims/status-badge";
import type { AccessionWithProject } from "@/lib/lims/types";

export function RecentAccessions({ items }: { items: AccessionWithProject[] }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <h3 className="text-sm font-semibold">Recent Accessions</h3>
        <Link
          href="/pathx/lims/accessions"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
          No accessions yet.
        </p>
      ) : (
        <div className="divide-y divide-border/40">
          {items.map((acc) => (
            <Link
              key={acc.id}
              href={`/pathx/lims/accessions/${acc.id}`}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-accent/40 transition-colors"
            >
              <div>
                <p className="text-sm font-mono font-medium">{acc.accession_id}</p>
                <p className="text-xs text-muted-foreground">
                  {acc.project?.title ?? acc.project?.project_id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(acc.received_date).toLocaleDateString()}
                </span>
                <StatusBadge status={acc.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
