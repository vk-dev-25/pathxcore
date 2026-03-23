import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { ProjectsTable } from "@/components/lims/projects/projects-table";
import { CreateProjectDialog } from "@/components/lims/projects/create-project-dialog";
import { getProjects, getClients } from "@/lib/lims/queries";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const [projects, clients] = await Promise.all([
    getProjects(supabase),
    getClients(supabase),
  ]);

  return (
    <LimsShell>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">{projects.length} total</p>
          </div>
          <CreateProjectDialog clients={clients} />
        </div>
        <ProjectsTable projects={projects} />
      </div>
    </LimsShell>
  );
}
