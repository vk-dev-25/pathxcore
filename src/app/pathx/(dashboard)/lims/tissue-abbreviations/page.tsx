import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { TissueTable } from "@/components/lims/tissue-abbreviations/tissue-table";
import { getTissueAbbreviations } from "@/lib/lims/queries";

export default async function TissueAbbreviationsPage() {
  const supabase = await createClient();
  const tissues = await getTissueAbbreviations(supabase);

  return (
    <LimsShell>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Tissue Abbreviations</h1>
            <p className="text-sm text-muted-foreground">{tissues.length} entries across {new Set(tissues.map((t) => t.organ_system)).size} organ systems</p>
          </div>
        </div>
        <TissueTable tissues={tissues} />
      </div>
    </LimsShell>
  );
}
