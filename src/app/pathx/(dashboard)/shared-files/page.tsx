import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SharedFilesClient } from "@/components/pathx/shared-files-client";
import { listSharedFilesAction } from "@/lib/shared-files/actions";
import { getViewerContext } from "@/lib/trackers/access";

export const metadata: Metadata = {
  title: "Shared files | PathX",
  description: "Upload and share large histo files with clients.",
};

export default async function SharedFilesPage() {
  const viewer = await getViewerContext();
  if (!viewer) redirect("/pathx/sign-in");

  const res = await listSharedFilesAction();
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-destructive">
        {res.error}
      </div>
    );
  }

  return <SharedFilesClient files={res.files} clientMode={res.clientMode} />;
}
