import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrackerGridClient } from "@/components/pathx/tracker-grid-client";
import { getViewerContext } from "@/lib/trackers/access";
import { getTrackerDetail } from "@/lib/trackers/get-trackers";
import { getClientLimsProjects } from "@/lib/trackers/lims-link";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getTrackerDetail(id);
  return {
    title: detail ? `${detail.client_name} — Tracker | PathX` : "Tracker | PathX",
  };
}

export default async function TrackerDetailPage({ params }: Props) {
  const { id } = await params;
  const [viewer, detail] = await Promise.all([
    getViewerContext(),
    getTrackerDetail(id),
  ]);
  if (!detail) notFound();

  const isStaff = viewer?.role === "staff";
  const limsProjects = isStaff
    ? await getClientLimsProjects(detail.client_id)
    : [];

  return (
    <TrackerGridClient
      detail={detail}
      isStaff={isStaff}
      viewerEmail={viewer?.email ?? ""}
      limsProjects={limsProjects}
    />
  );
}
