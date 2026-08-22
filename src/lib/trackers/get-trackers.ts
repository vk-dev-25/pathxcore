import "server-only";

import type {
  TrackerAccessEntry,
  TrackerRow,
  TrackerSummary,
} from "@/lib/trackers/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function resolveClientNames(
  clientIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const ids = Array.from(new Set(clientIds.filter(Boolean)));
  if (!ids.length) return map;
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin
      .from("clients")
      .select("id, org_name")
      .in("id", ids);
    for (const row of data ?? []) {
      map.set(row.id as string, (row.org_name as string) ?? "");
    }
  } catch (e) {
    console.warn("resolveClientNames failed", e);
  }
  return map;
}

/** Trackers visible to the current user (RLS-scoped: staff see all). */
export async function listTrackers(): Promise<TrackerSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trackers")
    .select("id, title, client_id, updated_at, tracker_rows(count)")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("listTrackers", error.message);
    return [];
  }

  const names = await resolveClientNames(
    data.map((t) => t.client_id as string),
  );

  return data.map((t) => {
    const countRel = t.tracker_rows as { count: number }[] | null;
    return {
      id: t.id as string,
      title: (t.title as string) ?? "Project tracker",
      client_id: t.client_id as string,
      client_name: names.get(t.client_id as string) ?? "Client",
      row_count: countRel?.[0]?.count ?? 0,
      updated_at: t.updated_at as string,
    };
  });
}

export type TrackerDetail = {
  id: string;
  title: string;
  client_id: string;
  client_name: string;
  updated_at: string;
  rows: TrackerRow[];
  access: TrackerAccessEntry[];
};

/** Full tracker (header + rows + access). Returns null if not found/allowed. */
export async function getTrackerDetail(
  trackerId: string,
): Promise<TrackerDetail | null> {
  const supabase = await createClient();

  const { data: tracker, error } = await supabase
    .from("trackers")
    .select("id, title, client_id, updated_at")
    .eq("id", trackerId)
    .maybeSingle();

  if (error || !tracker) return null;

  const [{ data: rows }, { data: access }, names] = await Promise.all([
    supabase
      .from("tracker_rows")
      .select("*")
      .eq("tracker_id", trackerId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("tracker_access")
      .select("id, email, role")
      .eq("tracker_id", trackerId)
      .order("role", { ascending: true }),
    resolveClientNames([tracker.client_id as string]),
  ]);

  return {
    id: tracker.id as string,
    title: (tracker.title as string) ?? "Project tracker",
    client_id: tracker.client_id as string,
    client_name: names.get(tracker.client_id as string) ?? "Client",
    updated_at: tracker.updated_at as string,
    rows: (rows ?? []) as unknown as TrackerRow[],
    access: (access ?? []) as TrackerAccessEntry[],
  };
}
