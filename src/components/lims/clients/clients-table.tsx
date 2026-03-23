import Link from "next/link";
import type { Client } from "@/lib/lims/types";

export function ClientsTable({ clients }: { clients: Client[] }) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Added</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {clients.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No clients registered yet.
              </td>
            </tr>
          )}
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5">
                <Link href={`/pathx/lims/clients/${c.id}`} className="font-mono font-semibold text-primary hover:underline">
                  {c.code}
                </Link>
              </td>
              <td className="px-4 py-2.5 font-medium">{c.name}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{c.contact_name ?? "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{c.email ?? "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
