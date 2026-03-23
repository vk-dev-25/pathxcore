import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { StatusBadge } from "@/components/lims/status-badge";
import { getClient, getProjects } from "@/lib/lims/queries";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [client, projects] = await Promise.all([
    getClient(supabase, id),
    getProjects(supabase, { clientId: id }),
  ]);

  if (!client) notFound();

  return (
    <LimsShell>
      <div className="p-6 space-y-6">
        <div>
          <Link href="/pathx/lims/clients" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="h-4 w-4" />Clients
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-primary">{client.code}</span>
            <h1 className="text-xl font-semibold">{client.name}</h1>
          </div>
          {client.contact_name && <p className="text-sm text-muted-foreground">{client.contact_name} · {client.email}</p>}
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Projects ({projects.length})</h2>
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border/60">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {projects.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No projects yet.</td></tr>
                )}
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/pathx/lims/projects/${p.id}`} className="font-mono font-semibold text-primary hover:underline">{p.project_id}</Link>
                    </td>
                    <td className="px-4 py-2.5 font-medium">{p.title}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={p.project_type} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LimsShell>
  );
}
