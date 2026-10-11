import type { Metadata } from "next";

import { AntibodyRegistryClient } from "@/components/pathx/antibody-registry-client";
import {
  getAntibodyFilterOptionsInternal,
  listAntibodiesInternal,
} from "@/lib/antibodies/list-antibodies";
import { parseAntibodySearchParams } from "@/lib/antibodies/search-params";
import type { AntibodyFilterOptions, AntibodyRow } from "@/lib/antibodies/types";

export const metadata: Metadata = {
  title: "Antibody registry | PathX",
  description:
    "Track antibodies—vendor, catalog, lot, species, concentration, detection, and audit fields.",
};

const BASE = "/pathx/antibodies";

export default async function PathXAntibodiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const parsed = parseAntibodySearchParams(sp);

  let loadError: string | null = null;
  let list: {
    rows: AntibodyRow[];
    total: number;
    page: number;
    pageSize: number;
  } = {
    rows: [],
    total: 0,
    page: parsed.page,
    pageSize: parsed.pageSize,
  };
  let filterOptions: AntibodyFilterOptions = {
    vendors: [],
    igSpecies: [],
    detectionMethods: [],
  };

  try {
    filterOptions = await getAntibodyFilterOptionsInternal();
  } catch (e) {
    console.error(e);
  }

  try {
    list = await listAntibodiesInternal({
      page: parsed.page,
      pageSize: parsed.pageSize,
      sort: parsed.sort,
      sortDir: parsed.sortDir,
      filters: parsed.filters,
    });
  } catch (e) {
    console.error(e);
    loadError =
      "Could not load antibody registry. Apply the latest database migration and ensure you are signed in with a valid Supabase connection.";
  }

  return (
    <div className="relative mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_65%)]"
        aria-hidden
      />
      <div className="relative">
        <AntibodyRegistryClient
          rows={list.rows}
          parsed={parsed}
          total={list.total}
          loadError={loadError}
          basePath={BASE}
          filterOptions={filterOptions}
        />
      </div>
    </div>
  );
}
