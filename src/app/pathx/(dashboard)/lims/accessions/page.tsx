import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { AccessionsTable } from "@/components/lims/accessions/accessions-table";
import { CreateAccessionDialog } from "@/components/lims/accessions/create-accession-dialog";
import { getAccessions, getProjects } from "@/lib/lims/queries";

export default async function AccessionsPage() {
  const supabase = await createClient();
  const [accessions, projects] = await Promise.all([
    getAccessions(supabase),
    getProjects(supabase),
  ]);

  return (
    <LimsShell>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Accessions</h1>
            <p className="text-sm text-muted-foreground">{accessions.length} total</p>
          </div>
          <CreateAccessionDialog projects={projects} />
        </div>
        <AccessionsTable accessions={accessions} />
      </div>
    </LimsShell>
  );
}
