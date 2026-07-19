import "server-only";

import { normalizeClientName } from "@/lib/clients/normalize";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export type LimsProjectOption = {
  id: string;
  projectReference: string;
  quoteReference: string | null;
  projectTitle: string | null;
  procedures: string | null;
  details: string | null;
  status: string | null;
};

/**
 * LIMS projects belonging to a tracker's client. Matched two ways and merged:
 *  1) via quotes linked to the client (quotes.client_id -> lims.source_quote_id)
 *  2) via exact client_org_name / alias spellings on the LIMS project.
 * Uses the service role so it works for staff regardless of RLS nuances.
 */
export async function getClientLimsProjects(
  clientId: string,
): Promise<LimsProjectOption[]> {
  try {
    const admin = createServiceRoleClient();

    const [{ data: client }, { data: aliasRows }, { data: clientQuotes }] =
      await Promise.all([
        admin.from("clients").select("org_name").eq("id", clientId).maybeSingle(),
        admin.from("client_aliases").select("alias_text").eq("client_id", clientId),
        admin.from("quotes").select("id").eq("client_id", clientId),
      ]);

    // Normalized name keys for this client (org name + every alias) so that
    // LIMS spelling variants (e.g. "Y-Trap" vs "Y-Trap.") still match.
    const nameKeys = new Set<string>();
    const addKey = (v: string | null | undefined) => {
      const k = normalizeClientName(v);
      if (k) nameKeys.add(k);
    };
    addKey(client?.org_name as string | undefined);
    for (const a of aliasRows ?? []) addKey(a.alias_text as string | undefined);

    const quoteIds = new Set((clientQuotes ?? []).map((q) => q.id as string));

    const projectSelect =
      "id, project_reference, source_quote_id, project_title, procedures, details, status, client_org_name";

    // Pull all LIMS projects once and match by normalized name OR quote link.
    const { data: allProjects } = await admin
      .from("lims_projects")
      .select(projectSelect);

    const projects = (allProjects ?? []).filter((p) => {
      const byQuote =
        p.source_quote_id && quoteIds.has(p.source_quote_id as string);
      const key = normalizeClientName(p.client_org_name as string | null);
      const byName = key !== null && nameKeys.has(key);
      return byQuote || byName;
    });
    if (!projects.length) return [];

    // Resolve quote references for the projects' source quotes.
    const sourceQuoteIds = Array.from(
      new Set(
        projects
          .map((p) => p.source_quote_id as string | null)
          .filter((v): v is string => Boolean(v)),
      ),
    );
    const quoteRefById = new Map<string, string | null>();
    if (sourceQuoteIds.length) {
      const { data: quotes } = await admin
        .from("quotes")
        .select("id, quote_reference")
        .in("id", sourceQuoteIds);
      for (const q of quotes ?? []) {
        quoteRefById.set(q.id as string, (q.quote_reference as string) ?? null);
      }
    }

    return projects
      .map((p) => ({
        id: p.id as string,
        projectReference: (p.project_reference as string) ?? "",
        quoteReference: p.source_quote_id
          ? quoteRefById.get(p.source_quote_id as string) ?? null
          : null,
        projectTitle: (p.project_title as string | null) ?? null,
        procedures: (p.procedures as string | null) ?? null,
        details: (p.details as string | null) ?? null,
        status: (p.status as string | null) ?? null,
      }))
      .sort((a, b) => a.projectReference.localeCompare(b.projectReference));
  } catch (e) {
    console.error("getClientLimsProjects failed", e);
    return [];
  }
}

/** Map a LIMS project status to a tracker status_tag. */
export function limsStatusToTag(status: string | null): string | null {
  switch (status) {
    case "completed":
      return "completed";
    case "started":
    case "shipped":
      return "in_progress";
    case "blocked":
      return "paused";
    case "cancelled":
      return "halted";
    default:
      return null;
  }
}
