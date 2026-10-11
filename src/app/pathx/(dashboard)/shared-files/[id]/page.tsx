import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SharedFileDetailClient } from "@/components/pathx/shared-file-detail-client";
import { getSharedFileDetailAction } from "@/lib/shared-files/actions";
import { getViewerContext } from "@/lib/trackers/access";

export const metadata: Metadata = {
  title: "Shared file | PathX",
  description: "Shared file details and download.",
};

export default async function SharedFileDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ warn?: string }>;
}) {
  const viewer = await getViewerContext();
  if (!viewer) redirect("/pathx/sign-in");

  const { id } = await params;
  const { warn } = await searchParams;
  const res = await getSharedFileDetailAction(id);
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-destructive">
        {res.error}
      </div>
    );
  }

  return (
    <SharedFileDetailClient
      file={res.file}
      access={res.access}
      clientMode={res.clientMode}
      initialWarning={warn || null}
    />
  );
}
