"use server";

import { revalidatePath } from "next/cache";

import { findOrCreateClient } from "@/lib/clients/upsert-client";
import { notifyTrackerChange } from "@/lib/email/tracker-notify";
import { getViewerContext } from "@/lib/trackers/access";
import {
  getClientLimsProjects,
  limsStatusToTag,
  type LimsProjectOption,
} from "@/lib/trackers/lims-link";
import {
  STATUS_TAG_OPTIONS,
  TRACKER_COLUMNS,
  type TrackerStatusTag,
} from "@/lib/trackers/types";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

const EDITABLE_TEXT_FIELDS = new Set<string>([
  ...TRACKER_COLUMNS.map((c) => c.key),
  "group_label",
]);
const STATUS_TAGS = new Set<string>(STATUS_TAG_OPTIONS.map((o) => o.value));

function isStatusTag(v: unknown): v is TrackerStatusTag {
  return typeof v === "string" && STATUS_TAGS.has(v);
}

/** Map a quote's lifecycle status to the tracker "Quote Sent?" column. */
function quoteSentFromStatus(status: string | null): string | null {
  switch (status) {
    case "sent":
    case "approved": // approved implies it was sent to and accepted by the client
      return "Yes";
    case "created":
      return "No";
    default:
      return null; // discarded / unknown -> leave blank
  }
}

// ---------------------------------------------------------------------------
// Tracker create / delete (staff only)
// ---------------------------------------------------------------------------
export async function createTrackerAction(input: {
  clientName: string;
  title?: string;
}): Promise<{ ok: true; trackerId: string } | { ok: false; error: string }> {
  const viewer = await getViewerContext();
  if (!viewer) return { ok: false, error: "You must be signed in." };
  if (viewer.role !== "staff") {
    return { ok: false, error: "Only PathX staff can create trackers." };
  }
  const clientName = input.clientName.trim();
  if (!clientName) return { ok: false, error: "Client name is required." };

  const admin = createServiceRoleClient();
  const clientId = await findOrCreateClient(admin, {
    org_name: clientName,
    created_by: viewer.userId,
  });
  if (!clientId) return { ok: false, error: "Could not resolve client." };

  const supabase = await createClient();
  const { data: tracker, error } = await supabase
    .from("trackers")
    .insert({
      client_id: clientId,
      title: input.title?.trim() || "IHC Project Tracker",
      created_by: viewer.userId,
    })
    .select("id")
    .single();

  if (error || !tracker) {
    console.error("createTrackerAction", error?.message);
    return { ok: false, error: "Could not create tracker." };
  }

  // Creator gets staff access (so they are notified + retain access).
  await supabase.from("tracker_access").insert({
    tracker_id: tracker.id,
    email: viewer.email,
    role: "staff",
    added_by: viewer.userId,
  });

  // Prefill client access from the client's primary contact email, if any.
  const { data: clientRow } = await admin
    .from("clients")
    .select("primary_contact_email")
    .eq("id", clientId)
    .maybeSingle();
  const clientEmail = (clientRow?.primary_contact_email as string | null)
    ?.trim()
    .toLowerCase();
  if (clientEmail) {
    await addAccessInternal(tracker.id as string, clientEmail, "client", viewer.userId);
  }

  revalidatePath("/pathx/trackers");
  return { ok: true, trackerId: tracker.id as string };
}

export async function deleteTrackerAction(input: {
  trackerId: string;
}): Promise<ActionResult> {
  const viewer = await getViewerContext();
  if (!viewer || viewer.role !== "staff") {
    return { ok: false, error: "Only PathX staff can delete trackers." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("trackers")
    .delete()
    .eq("id", input.trackerId);
  if (error) {
    console.error("deleteTrackerAction", error.message);
    return { ok: false, error: "Could not delete tracker." };
  }
  revalidatePath("/pathx/trackers");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Rows (staff + clients can edit)
// ---------------------------------------------------------------------------
export async function addTrackerRowAction(input: {
  trackerId: string;
  rowType: "data" | "group";
}): Promise<ActionResult> {
  const viewer = await getViewerContext();
  if (!viewer) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("tracker_rows")
    .select("sort_order")
    .eq("tracker_id", input.trackerId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSort = (last?.sort_order ?? 0) + 10;

  const { error } = await supabase.from("tracker_rows").insert({
    tracker_id: input.trackerId,
    row_type: input.rowType,
    sort_order: nextSort,
    updated_by: viewer.userId,
    updated_by_email: viewer.email,
  });
  if (error) {
    console.error("addTrackerRowAction", error.message);
    return { ok: false, error: "Could not add row." };
  }
  await touchTracker(input.trackerId);
  revalidatePath(`/pathx/trackers/${input.trackerId}`);
  await notifyTrackerChange({
    trackerId: input.trackerId,
    actorEmail: viewer.email,
    summary:
      input.rowType === "group"
        ? "A new section header was added."
        : "A new row was added.",
  });
  return { ok: true };
}

/** Fresh LIMS projects for a tracker's client (used when opening the picker). */
export async function listTrackerLimsProjectsAction(
  trackerId: string,
): Promise<
  { ok: true; projects: LimsProjectOption[] } | { ok: false; error: string }
> {
  const viewer = await getViewerContext();
  if (!viewer || viewer.role !== "staff") {
    return { ok: false, error: "Only PathX staff can view LIMS projects." };
  }
  const admin = createServiceRoleClient();
  const { data: tracker } = await admin
    .from("trackers")
    .select("client_id")
    .eq("id", trackerId)
    .maybeSingle();
  if (!tracker?.client_id) return { ok: false, error: "Tracker not found." };
  const projects = await getClientLimsProjects(tracker.client_id as string);
  return { ok: true, projects };
}

/** Distinct emails previously used to share any tracker (for autocomplete). */
export async function listSharedTrackerEmailsAction(): Promise<string[]> {
  const viewer = await getViewerContext();
  if (!viewer || viewer.role !== "staff") return [];
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("tracker_access")
    .select("email")
    .order("email", { ascending: true });
  if (error || !data) {
    if (error) console.error("listSharedTrackerEmailsAction", error.message);
    return [];
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of data) {
    const e = (r.email as string | null)?.trim().toLowerCase();
    if (e && !seen.has(e)) {
      seen.add(e);
      out.push(e);
    }
  }
  return out;
}

export async function addTrackerRowFromLimsAction(input: {
  trackerId: string;
  limsProjectId: string;
}): Promise<ActionResult> {
  const viewer = await getViewerContext();
  if (!viewer || viewer.role !== "staff") {
    return { ok: false, error: "Only PathX staff can add from LIMS." };
  }

  const admin = createServiceRoleClient();
  const { data: project } = await admin
    .from("lims_projects")
    .select(
      "id, project_reference, source_quote_id, project_title, procedures, details, status",
    )
    .eq("id", input.limsProjectId)
    .maybeSingle();
  if (!project) return { ok: false, error: "LIMS project not found." };

  let quoteReference: string | null = null;
  let quoteSent: string | null = null;
  if (project.source_quote_id) {
    const { data: quote } = await admin
      .from("quotes")
      .select("quote_reference, status")
      .eq("id", project.source_quote_id)
      .maybeSingle();
    quoteReference = (quote?.quote_reference as string) ?? null;
    quoteSent = quoteSentFromStatus(quote?.status as string | null);
  }

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("tracker_rows")
    .select("sort_order")
    .eq("tracker_id", input.trackerId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSort = (last?.sort_order ?? 0) + 10;

  const notesParts = [project.project_title, project.details].filter(Boolean);

  const { error } = await supabase.from("tracker_rows").insert({
    tracker_id: input.trackerId,
    row_type: "data",
    sort_order: nextSort,
    project_id: (project.project_reference as string) || null,
    quote: quoteReference,
    quote_sent: quoteSent,
    application: (project.project_title as string | null) || null,
    target: (project.procedures as string | null) || null,
    notes: notesParts.length ? notesParts.join(" — ") : null,
    status: project.status ? String(project.status) : null,
    status_tag: limsStatusToTag(project.status as string | null),
    updated_by: viewer.userId,
    updated_by_email: viewer.email,
  });
  if (error) {
    console.error("addTrackerRowFromLimsAction", error.message);
    return { ok: false, error: "Could not add row from LIMS." };
  }

  await touchTracker(input.trackerId);
  revalidatePath(`/pathx/trackers/${input.trackerId}`);
  await notifyTrackerChange({
    trackerId: input.trackerId,
    actorEmail: viewer.email,
    summary: `A row was added from LIMS project ${project.project_reference}.`,
  });
  return { ok: true };
}

export async function updateTrackerRowAction(input: {
  trackerId: string;
  rowId: string;
  patch: Record<string, string | null>;
}): Promise<ActionResult> {
  const viewer = await getViewerContext();
  if (!viewer) return { ok: false, error: "You must be signed in." };

  const patch: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(input.patch)) {
    if (key === "status_tag") {
      patch.status_tag = value === null || isStatusTag(value) ? value : null;
    } else if (EDITABLE_TEXT_FIELDS.has(key)) {
      patch[key] = value === "" ? null : value;
    }
  }
  if (!Object.keys(patch).length) return { ok: true };

  patch.updated_by = viewer.userId;
  patch.updated_by_email = viewer.email;
  patch.updated_at = new Date().toISOString();

  const supabase = await createClient();
  const { error } = await supabase
    .from("tracker_rows")
    .update(patch)
    .eq("id", input.rowId)
    .eq("tracker_id", input.trackerId);
  if (error) {
    console.error("updateTrackerRowAction", error.message);
    return { ok: false, error: "Could not save change." };
  }
  await touchTracker(input.trackerId);
  revalidatePath(`/pathx/trackers/${input.trackerId}`);
  await notifyTrackerChange({
    trackerId: input.trackerId,
    actorEmail: viewer.email,
    summary: "A row was updated.",
  });
  return { ok: true };
}

export async function deleteTrackerRowAction(input: {
  trackerId: string;
  rowId: string;
}): Promise<ActionResult> {
  const viewer = await getViewerContext();
  if (!viewer) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("tracker_rows")
    .delete()
    .eq("id", input.rowId)
    .eq("tracker_id", input.trackerId);
  if (error) {
    console.error("deleteTrackerRowAction", error.message);
    return { ok: false, error: "Could not delete row." };
  }
  await touchTracker(input.trackerId);
  revalidatePath(`/pathx/trackers/${input.trackerId}`);
  await notifyTrackerChange({
    trackerId: input.trackerId,
    actorEmail: viewer.email,
    summary: "A row was removed.",
  });
  return { ok: true };
}

export async function moveTrackerRowAction(input: {
  trackerId: string;
  rowId: string;
  direction: "up" | "down";
}): Promise<ActionResult> {
  const viewer = await getViewerContext();
  if (!viewer) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("tracker_rows")
    .select("id, sort_order")
    .eq("tracker_id", input.trackerId)
    .order("sort_order", { ascending: true });
  if (!rows) return { ok: false, error: "Could not reorder." };

  const idx = rows.findIndex((r) => r.id === input.rowId);
  if (idx === -1) return { ok: false, error: "Row not found." };
  const swapIdx = input.direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return { ok: true };

  const a = rows[idx];
  const b = rows[swapIdx];
  await supabase
    .from("tracker_rows")
    .update({ sort_order: b.sort_order })
    .eq("id", a.id)
    .eq("tracker_id", input.trackerId);
  await supabase
    .from("tracker_rows")
    .update({ sort_order: a.sort_order })
    .eq("id", b.id)
    .eq("tracker_id", input.trackerId);

  revalidatePath(`/pathx/trackers/${input.trackerId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Access management (staff only)
// ---------------------------------------------------------------------------
export async function addTrackerAccessAction(input: {
  trackerId: string;
  email: string;
  role: "client" | "staff";
}): Promise<ActionResult> {
  const viewer = await getViewerContext();
  if (!viewer || viewer.role !== "staff") {
    return { ok: false, error: "Only PathX staff can manage access." };
  }
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email." };
  }

  if (input.role === "client") {
    await inviteClientUser(email);
  }
  const res = await addAccessInternal(
    input.trackerId,
    email,
    input.role,
    viewer.userId,
  );
  if (!res.ok) return res;

  revalidatePath(`/pathx/trackers/${input.trackerId}`);
  return { ok: true };
}

export async function removeTrackerAccessAction(input: {
  trackerId: string;
  accessId: string;
}): Promise<ActionResult> {
  const viewer = await getViewerContext();
  if (!viewer || viewer.role !== "staff") {
    return { ok: false, error: "Only PathX staff can manage access." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("tracker_access")
    .delete()
    .eq("id", input.accessId)
    .eq("tracker_id", input.trackerId);
  if (error) {
    console.error("removeTrackerAccessAction", error.message);
    return { ok: false, error: "Could not remove access." };
  }
  revalidatePath(`/pathx/trackers/${input.trackerId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
async function addAccessInternal(
  trackerId: string,
  email: string,
  role: "client" | "staff",
  addedBy: string,
): Promise<ActionResult> {
  const admin = createServiceRoleClient();
  const normEmail = email.trim().toLowerCase();

  // Emails are stored lowercased and the DB uniqueness is on
  // (tracker_id, lower(email)) — an expression index that PostgREST upsert
  // can't target via ON CONFLICT — so check-then-insert instead.
  const { data: existing } = await admin
    .from("tracker_access")
    .select("id")
    .eq("tracker_id", trackerId)
    .eq("email", normEmail)
    .maybeSingle();
  if (existing) return { ok: true };

  const { error } = await admin.from("tracker_access").insert({
    tracker_id: trackerId,
    email: normEmail,
    role,
    added_by: addedBy,
  });
  if (error) {
    if (error.code === "23505") return { ok: true }; // duplicate race
    console.error("addAccessInternal", error.message);
    return { ok: false, error: "Could not add access." };
  }
  return { ok: true };
}

async function touchTracker(trackerId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("trackers")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", trackerId);
}

const INVITE_CODE = "CLIENT-INVITE-AUTO";

/** Pre-create a passwordless account so the client can later magic-link in. */
async function inviteClientUser(email: string): Promise<void> {
  try {
    const admin = createServiceRoleClient();

    // Ensure a signup allowance exists so the enforce_signup_allowance trigger
    // permits creating the auth user (no access code needed for clients).
    let { data: code } = await admin
      .from("access_codes")
      .select("id")
      .eq("code", INVITE_CODE)
      .maybeSingle();
    if (!code?.id) {
      const { data: created } = await admin
        .from("access_codes")
        .insert({
          code: INVITE_CODE,
          expires_at: "2099-01-01T00:00:00Z",
          max_uses: 1000000,
        })
        .select("id")
        .single();
      code = created ?? null;
    }
    if (code?.id) {
      await admin
        .from("signup_allowances")
        .delete()
        .eq("email", email)
        .is("consumed_at", null);
      await admin.from("signup_allowances").insert({
        email,
        access_code_id: code.id,
        expires_at: "2099-01-01T00:00:00Z",
      });
    }

    const { error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { role: "client" },
      user_metadata: { role: "client" },
    });
    if (error && !/already/i.test(error.message)) {
      console.error("inviteClientUser createUser", error.message);
    }
  } catch (e) {
    console.error("inviteClientUser failed", e);
  }
}
