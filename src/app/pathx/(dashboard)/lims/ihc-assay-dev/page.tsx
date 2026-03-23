import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { AssayProjectsTable } from "@/components/lims/ihc-assay-dev/assay-projects-table";
import { CreateAssayDialog } from "@/components/lims/ihc-assay-dev/create-assay-dialog";
import { getIhcAssayProjects, getProjects } from "@/lib/lims/queries";

export default async function IhcAssayDevPage() {
  const supabase = await createClient();
  const [assayProjects, projects] = await Promise.all([
    getIhcAssayProjects(supabase),
    getProjects(supabase),
  ]);

  return (
    <LimsShell>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">IHC Assay Development</h1>
            <p className="text-sm text-muted-foreground">{assayProjects.length} assay(s)</p>
          </div>
          <CreateAssayDialog projects={projects} />
        </div>
        <AssayProjectsTable projects={assayProjects} />
      </div>
    </LimsShell>
  );
}
