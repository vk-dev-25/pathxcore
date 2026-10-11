"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addStaffMemberAction,
  removeStaffMemberAction,
  setStaffActiveAction,
  type StaffMember,
} from "@/lib/staff/actions";
import { cn } from "@/lib/utils";

export function StaffAdminClient({
  initialStaff,
  ready = true,
  currentEmail,
}: {
  initialStaff: StaffMember[];
  ready?: boolean;
  currentEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add() {
    setError(null);
    if (!email.trim()) {
      setError("Enter an email.");
      return;
    }
    startTransition(async () => {
      const res = await addStaffMemberAction({ email, fullName });
      if (res.ok) {
        setEmail("");
        setFullName("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function toggleActive(m: StaffMember) {
    startTransition(async () => {
      const res = await setStaffActiveAction({ id: m.id, isActive: !m.is_active });
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  function remove(m: StaffMember) {
    startTransition(async () => {
      const res = await removeStaffMemberAction({ id: m.id });
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          PathX staff
        </h1>
        <p className="mt-1 text-muted-foreground">
          Only emails on this list can create an employee account and access the
          full workspace. Client accounts are managed per-tracker and are not
          affected.
        </p>
      </div>

      {!ready ? (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <p className="font-semibold">Staff list not set up yet</p>
          <p className="mt-0.5">
            Apply the{" "}
            <code className="rounded bg-amber-500/20 px-1">
              20260720120000_staff_allowlist
            </code>{" "}
            migration in Supabase (SQL editor), then reload. It also seeds your
            existing employees automatically.
          </p>
        </div>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Add employee</CardTitle>
          <CardDescription>
            Add someone before they sign up. They still need the sign-up access
            code, but sign-up is refused unless their email is listed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Work email</Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pathxdx.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">Name (optional)</Label>
              <Input
                id="staff-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button onClick={add} disabled={pending}>
            {pending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-1.5 h-4 w-4" />
            )}
            Add to staff list
          </Button>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-left">
              <th className="px-4 py-2 font-semibold">Email</th>
              <th className="px-4 py-2 font-semibold">Name</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialStaff.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No staff members yet.
                </td>
              </tr>
            ) : (
              initialStaff.map((m) => {
                const isSelf = m.email === currentEmail;
                return (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      {m.email}
                      {isSelf ? (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          you
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {m.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs font-medium",
                          m.is_active
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-500/15 text-zinc-500",
                        )}
                      >
                        {m.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(m)}
                          disabled={pending || isSelf}
                          title={
                            isSelf
                              ? "You cannot disable your own access"
                              : undefined
                          }
                        >
                          {m.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(m)}
                          disabled={pending || isSelf}
                          className="text-muted-foreground hover:text-destructive"
                          title={
                            isSelf ? "You cannot remove yourself" : undefined
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Disabling or removing an email prevents new sign-ups and revokes staff
        data access on next request. It does not delete an already-created login;
        for that, also delete the user in Supabase Auth.
      </p>
    </div>
  );
}
