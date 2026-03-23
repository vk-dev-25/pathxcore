import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { SpecimensTable } from "@/components/lims/specimens/specimens-table";
import { CreateSpecimenDialog } from "@/components/lims/specimens/create-specimen-dialog";
import { getSpecimens, getAccessions, getTissueAbbreviations } from "@/lib/lims/queries";

export default async function SpecimensPage() {
  const supabase = await createClient();
  const [specimens, accessions, tissues] = await Promise.all([
    getSpecimens(supabase),
    getAccessions(supabase),
    getTissueAbbreviations(supabase),
  ]);

  return (
    <LimsShell>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Specimens</h1>
            <p className="text-sm text-muted-foreground">{specimens.length} total</p>
          </div>
          <CreateSpecimenDialog accessions={accessions} tissueAbbreviations={tissues} />
        </div>
        <SpecimensTable specimens={specimens} />
      </div>
    </LimsShell>
  );
}
