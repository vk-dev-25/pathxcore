import type { Metadata } from "next";

import { TrackerFinderClient } from "@/components/pathx/tracker-finder-client";
import { listClientsAction } from "@/lib/clients/list-clients-action";
import { getViewerContext } from "@/lib/trackers/access";
import { listTrackers } from "@/lib/trackers/get-trackers";

export const metadata: Metadata = {
  title: "Project Trackers | PathX",
  description: "Shared per-client project trackers.",
};

export default async function TrackersPage() {
  const viewer = await getViewerContext();
  const isStaff = viewer?.role === "staff";
  const [trackers, clients] = await Promise.all([
    listTrackers(),
    isStaff ? listClientsAction() : Promise.resolve([]),
  ]);

  return (
    <TrackerFinderClient
      trackers={trackers}
      clients={clients}
      isStaff={isStaff}
    />
  );
}
