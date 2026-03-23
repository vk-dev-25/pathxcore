import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { LibraryTable } from "@/components/lims/inhouse-library/library-table";
import { AddLibraryDialog } from "@/components/lims/inhouse-library/add-library-dialog";
import { getInhouseLibrary } from "@/lib/lims/queries";

export default async function InhouseLibraryPage() {
  const supabase = await createClient();
  const entries = await getInhouseLibrary(supabase);

  return (
    <LimsShell>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">In-House Control Library</h1>
            <p className="text-sm text-muted-foreground">PathxDx reference cell lines for IHC assay development</p>
          </div>
          <AddLibraryDialog />
        </div>
        <LibraryTable entries={entries} />
      </div>
    </LimsShell>
  );
}
