"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type StaffMember = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
};

type ActionResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIGRATION_MISSING =
  "The staff list table isn't set up yet. Apply the 20260720120000_staff_allowlist migration in Supabase, then reload this page.";

/** PostgREST/Postgres error for a missing table (not yet migrated). */
function isTableMissing(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return (
    err.code === "PGRST205" ||
    err.code === "42P01" ||
    (err.message ?? "").includes("Could not find the table") ||
    (err.message ?? "").includes("does not exist")
  );
}

export type StaffListResult = { members: StaffMember[]; ready: boolean };

/** List allowlisted staff. RLS restricts reads to allowlisted staff. */
export async function listStaffMembers(): Promise<StaffListResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_members")
    .select("id, email, full_name, is_active, created_at")
    .order("email", { ascending: true });
  if (error) {
    if (isTableMissing(error)) return { members: [], ready: false };
    console.error("listStaffMembers:", error.message);
    return { members: [], ready: true };
  }
  return { members: (data ?? []) as StaffMember[], ready: true };
}

export async function addStaffMemberAction(input: {
  email: string;
  fullName?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email." };
  }

  const { error } = await supabase.from("staff_members").insert({
    email,
    full_name: input.fullName?.trim() || null,
    added_by: user.id,
  });
  if (error) {
    if (isTableMissing(error)) return { ok: false, error: MIGRATION_MISSING };
    if (error.code === "23505") {
      return { ok: false, error: "That email is already on the staff list." };
    }
    if (error.code === "42501") {
      return { ok: false, error: "Only PathX staff can manage the staff list." };
    }
    console.error("addStaffMemberAction:", error.message);
    return { ok: false, error: "Could not add staff member." };
  }
  revalidatePath("/pathx/admin/staff");
  return { ok: true };
}

export async function setStaffActiveAction(input: {
  id: string;
  isActive: boolean;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_members")
    .update({ is_active: input.isActive })
    .eq("id", input.id);
  if (error) {
    console.error("setStaffActiveAction:", error.message);
    return { ok: false, error: "Could not update staff member." };
  }
  revalidatePath("/pathx/admin/staff");
  return { ok: true };
}

export async function removeStaffMemberAction(input: {
  id: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_members")
    .delete()
    .eq("id", input.id);
  if (error) {
    console.error("removeStaffMemberAction:", error.message);
    return { ok: false, error: "Could not remove staff member." };
  }
  revalidatePath("/pathx/admin/staff");
  return { ok: true };
}
