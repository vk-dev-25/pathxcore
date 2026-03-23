import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { SlidesTable } from "@/components/lims/slides/slides-table";
import { CreateSlideDialog } from "@/components/lims/slides/create-slide-dialog";
import { getSlides, getSpecimens } from "@/lib/lims/queries";

export default async function SlidesPage() {
  const supabase = await createClient();
  const [slides, specimens] = await Promise.all([
    getSlides(supabase),
    getSpecimens(supabase),
  ]);

  const unassigned = slides.filter((s) => s.stain_status === "unassigned").length;
  const assigned = slides.filter((s) => s.stain_status === "assigned").length;
  const stained = slides.filter((s) => s.stain_status === "stained").length;

  return (
    <LimsShell>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Slides</h1>
            <p className="text-sm text-muted-foreground">
              {slides.length} total · {unassigned} unassigned · {assigned} assigned · {stained} stained
            </p>
          </div>
          <CreateSlideDialog specimens={specimens} />
        </div>
        <SlidesTable slides={slides} />
      </div>
    </LimsShell>
  );
}
