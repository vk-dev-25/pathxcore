"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  createAntibodyAction,
  deleteAntibodyAction,
  updateAntibodyAction,
} from "@/lib/antibodies/antibody-actions";
import {
  serializeAntibodyQuery,
  type AntibodyParsedSearchParams,
} from "@/lib/antibodies/search-params";
import type { AntibodyRow, AntibodySortKey } from "@/lib/antibodies/types";
import { pathxFieldClass as fieldClass } from "@/components/pathx/workspace-field-classes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AntibodyFilterOptions } from "@/lib/antibodies/types";
import { cn } from "@/lib/utils";

const selectClass = cn(
  fieldClass,
  "h-10 w-full cursor-pointer rounded-md px-3 py-2 text-sm",
);

function SortLink({
  label,
  col,
  current,
  basePath,
}: {
  label: string;
  col: AntibodySortKey;
  current: AntibodyParsedSearchParams;
  basePath: string;
}) {
  const nextDir =
    current.sort === col && current.sortDir === "asc" ? "desc" : "asc";
  const href = serializeAntibodyQuery({
    ...current,
    sort: col,
    sortDir: nextDir,
    page: 1,
    basePath,
  });
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-sm text-foreground/95 hover:text-foreground hover:underline decoration-foreground/25 underline-offset-2"
    >
      <span>{label}</span>
      <span className="tabular-nums text-[11px] font-normal text-muted-foreground">
        {current.sort === col ? (current.sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </Link>
  );
}

function formatLocaleDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso.includes("T") ? iso : `${iso.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10) || "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10) || "—";
  }
}

/** Same calendar style as date provided; adds time on second line visually via · */
function formatUpdatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const datePart = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart} · ${timePart}`;
  } catch {
    return iso;
  }
}

type FormState = {
  antibody_name: string;
  vendor_name: string;
  catalog: string;
  lot_number: string;
  ig_species: string;
  working_concentration: string;
  antigen_retrieval: string;
  detection_method: string;
  provided_by: string;
  date_provided: string;
};

function emptyForm(): FormState {
  return {
    antibody_name: "",
    vendor_name: "",
    catalog: "",
    lot_number: "",
    ig_species: "",
    working_concentration: "",
    antigen_retrieval: "",
    detection_method: "",
    provided_by: "",
    date_provided: "",
  };
}

function rowToForm(row: AntibodyRow): FormState {
  return {
    antibody_name: row.antibody_name,
    vendor_name: row.vendor_name,
    catalog: row.catalog,
    lot_number: row.lot_number,
    ig_species: row.ig_species,
    working_concentration: row.working_concentration,
    antigen_retrieval: row.antigen_retrieval,
    detection_method: row.detection_method,
    provided_by: row.provided_by,
    date_provided: row.date_provided ?? "",
  };
}

function AntibodyFormFields({
  form,
  setForm,
  disabled,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  disabled: boolean;
}) {
  const on =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="ab-name">Antibody name *</Label>
        <Input
          id="ab-name"
          name="antibody_name"
          value={form.antibody_name}
          onChange={on("antibody_name")}
          className={fieldClass}
          disabled={disabled}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ab-vendor">Vendor name</Label>
        <Input
          id="ab-vendor"
          value={form.vendor_name}
          onChange={on("vendor_name")}
          className={fieldClass}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ab-catalog">Catalog</Label>
        <Input
          id="ab-catalog"
          value={form.catalog}
          onChange={on("catalog")}
          className={fieldClass}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ab-lot">Lot number</Label>
        <Input
          id="ab-lot"
          value={form.lot_number}
          onChange={on("lot_number")}
          className={fieldClass}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ab-ig">Ig species</Label>
        <Input
          id="ab-ig"
          value={form.ig_species}
          onChange={on("ig_species")}
          className={fieldClass}
          disabled={disabled}
          placeholder="e.g. rabbit, mouse"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ab-wc">Working concentration</Label>
        <Input
          id="ab-wc"
          value={form.working_concentration}
          onChange={on("working_concentration")}
          className={fieldClass}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="ab-ar">Antigen retrieval</Label>
        <Input
          id="ab-ar"
          value={form.antigen_retrieval}
          onChange={on("antigen_retrieval")}
          className={fieldClass}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="ab-dm">Detection method</Label>
        <Input
          id="ab-dm"
          value={form.detection_method}
          onChange={on("detection_method")}
          className={fieldClass}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ab-pb">Provided by</Label>
        <Input
          id="ab-pb"
          value={form.provided_by}
          onChange={on("provided_by")}
          className={fieldClass}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ab-dp">Date provided</Label>
        <Input
          id="ab-dp"
          type="date"
          value={form.date_provided}
          onChange={on("date_provided")}
          className={fieldClass}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function AntibodyRegistryClient({
  rows,
  parsed,
  basePath,
  total,
  loadError,
  filterOptions,
}: {
  rows: AntibodyRow[];
  parsed: AntibodyParsedSearchParams;
  basePath: string;
  total: number;
  loadError: string | null;
  filterOptions: AntibodyFilterOptions;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const f = parsed.filters;

  function openCreate() {
    setDialogMode("create");
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(row: AntibodyRow) {
    setDialogMode("edit");
    setEditingId(row.id);
    setForm(rowToForm(row));
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const payload = {
        antibody_name: form.antibody_name,
        vendor_name: form.vendor_name,
        catalog: form.catalog,
        lot_number: form.lot_number,
        ig_species: form.ig_species,
        working_concentration: form.working_concentration,
        antigen_retrieval: form.antigen_retrieval,
        detection_method: form.detection_method,
        provided_by: form.provided_by,
        date_provided: form.date_provided.trim() || null,
      };

      const res =
        dialogMode === "create"
          ? await createAntibodyAction(payload)
          : editingId
            ? await updateAntibodyAction({ id: editingId, ...payload })
            : { ok: false as const, error: "Missing row id." };

      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setDialogOpen(false);
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this antibody record?")) return;
    startTransition(async () => {
      const res = await deleteAntibodyAction({ id });
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  const computedTotalPages = Math.max(1, Math.ceil(total / parsed.pageSize));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            PathX module
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Antibody registry
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Track antibodies with vendor, lot, species, concentrations, and
            detection. Use the search panel to find records, then sort columns
            in the table.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 gap-2"
          disabled={!!loadError}
        >
          <Plus className="h-4 w-4" />
          Add antibody
        </Button>
      </div>

      {loadError ? (
        <p className="mt-8 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      <Card className="mt-10 border-border/80 shadow-none">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Search registry</CardTitle>
          <CardDescription>
            Search text across every column, or narrow results with the
            dropdowns and date range. Nothing changes until you run the search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            action={basePath}
            className="space-y-6"
            id="antibody-filters"
          >
            <input type="hidden" name="sort" value={parsed.sort} />
            <input type="hidden" name="dir" value={parsed.sortDir} />
            <input type="hidden" name="pageSize" value={String(parsed.pageSize)} />
            <input type="hidden" name="page" value="1" />

            <div className="space-y-2">
              <Label htmlFor="ab-search-all">Search</Label>
              <Input
                id="ab-search-all"
                name="search"
                defaultValue={f.search ?? ""}
                placeholder="Matches any field…"
                className={fieldClass}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Finds partial matches in antibody name, vendor, catalog, lot,
                species, concentrations, detection, and other text fields.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ab-sel-vendor">Vendor</Label>
                <select
                  id="ab-sel-vendor"
                  name="vendor"
                  className={selectClass}
                  defaultValue={f.vendor ?? ""}
                >
                  <option value="">All vendors</option>
                  {f.vendor &&
                  !filterOptions.vendors.includes(f.vendor) ? (
                    <option value={f.vendor}>{f.vendor}</option>
                  ) : null}
                  {filterOptions.vendors.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ab-sel-ig">Ig species</Label>
                <select
                  id="ab-sel-ig"
                  name="igSpecies"
                  className={selectClass}
                  defaultValue={f.igSpecies ?? ""}
                >
                  <option value="">All species</option>
                  {f.igSpecies &&
                  !filterOptions.igSpecies.includes(f.igSpecies) ? (
                    <option value={f.igSpecies}>{f.igSpecies}</option>
                  ) : null}
                  {filterOptions.igSpecies.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ab-sel-det">Detection method</Label>
                <select
                  id="ab-sel-det"
                  name="detection"
                  className={selectClass}
                  defaultValue={f.detection ?? ""}
                >
                  <option value="">All methods</option>
                  {f.detection &&
                  !filterOptions.detectionMethods.includes(f.detection) ? (
                    <option value={f.detection}>{f.detection}</option>
                  ) : null}
                  {filterOptions.detectionMethods.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ab-date-from">Date provided from</Label>
                <Input
                  id="ab-date-from"
                  type="date"
                  name="dateFrom"
                  defaultValue={f.dateFrom ?? ""}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ab-date-to">Date provided to</Label>
                <Input
                  id="ab-date-to"
                  type="date"
                  name="dateTo"
                  defaultValue={f.dateTo ?? ""}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
              <Button type="submit" className="font-medium">
                Apply search
              </Button>
              <Button asChild variant="ghost" type="button">
                <Link href={basePath}>Clear search</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-collapse text-[13px] leading-snug">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-[12px] font-medium tracking-normal text-muted-foreground">
                <th className="min-w-[11rem] px-3 py-3">
                <SortLink
                  label="Antibody"
                  col="antibody_name"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Vendor"
                  col="vendor_name"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Catalog"
                  col="catalog"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Lot"
                  col="lot_number"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Ig species"
                  col="ig_species"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Working conc."
                  col="working_concentration"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Antigen retrieval"
                  col="antigen_retrieval"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Detection"
                  col="detection_method"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Last updated by"
                  col="last_updated_by"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Provided by"
                  col="provided_by"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Date provided"
                  col="date_provided"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="px-3 py-3">
                <SortLink
                  label="Updated"
                  col="updated_at"
                  current={parsed}
                  basePath={basePath}
                />
              </th>
              <th className="w-[7rem] min-w-[7rem] px-3 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loadError ? (
              <tr>
                <td
                  colSpan={13}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No antibodies match this search. Add a record or adjust your
                  search.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    i % 2 === 0 ? "bg-card" : "bg-muted/[0.35]",
                    "hover:bg-muted/60",
                  )}
                >
                  <td className="max-w-[14rem] break-words px-3 py-3.5 align-top font-semibold text-foreground">
                    {row.antibody_name || "—"}
                  </td>
                  <td className="max-w-[11rem] break-words px-3 py-3.5 align-top">
                    {row.vendor_name || "—"}
                  </td>
                  <td className="max-w-[9rem] break-words px-3 py-3.5 align-top tabular-nums">
                    {row.catalog || "—"}
                  </td>
                  <td className="max-w-[8rem] break-words px-3 py-3.5 align-top tabular-nums">
                    {row.lot_number || "—"}
                  </td>
                  <td className="max-w-[8rem] break-words px-3 py-3.5 align-top">
                    {row.ig_species || "—"}
                  </td>
                  <td className="max-w-[10rem] break-words px-3 py-3.5 align-top">
                    {row.working_concentration || "—"}
                  </td>
                  <td className="max-w-[12rem] break-words px-3 py-3.5 align-top">
                    {row.antigen_retrieval || "—"}
                  </td>
                  <td className="max-w-[11rem] break-words px-3 py-3.5 align-top">
                    {row.detection_method || "—"}
                  </td>
                  <td className="max-w-[12rem] break-all px-3 py-3.5 align-top text-[12px] leading-relaxed text-muted-foreground">
                    {row.last_updated_by || "—"}
                  </td>
                  <td className="max-w-[12rem] break-words px-3 py-3.5 align-top">
                    {row.provided_by || "—"}
                  </td>
                  <td className="min-w-[9.5rem] whitespace-nowrap px-3 py-3.5 align-top tabular-nums text-muted-foreground">
                    {formatLocaleDate(row.date_provided)}
                  </td>
                  <td className="min-w-[11rem] max-w-[13rem] px-3 py-3.5 align-top tabular-nums text-[12px] leading-relaxed text-muted-foreground">
                    {formatUpdatedAt(row.updated_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-middle text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2"
                      onClick={() => openEdit(row)}
                      disabled={pending}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(row.id)}
                      disabled={pending}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
        <span className="mr-auto">
          {total === 0
            ? "0"
            : `${(parsed.page - 1) * parsed.pageSize + 1}–${Math.min(
                parsed.page * parsed.pageSize,
                total,
              )}`}{" "}
          of {total.toLocaleString()}
        </span>
        <span className="text-xs">Rows per page:</span>
        {[20, 40, 80].map((ps) => (
          <Link
            key={ps}
            href={serializeAntibodyQuery({
              ...parsed,
              page: 1,
              pageSize: ps,
              basePath,
            })}
            className={cn(
              "rounded-md px-1.5 py-0.5 text-xs hover:bg-muted",
              parsed.pageSize === ps && "font-semibold text-foreground",
            )}
          >
            {ps}
          </Link>
        ))}
        <Link
          className={cn(
            "rounded-md px-2 py-1 hover:bg-muted",
            parsed.page <= 1 && "pointer-events-none opacity-40",
          )}
          href={serializeAntibodyQuery({
            ...parsed,
            page: parsed.page - 1,
            basePath,
          })}
        >
          ← Prev
        </Link>
        <span className="px-2">
          Page {parsed.page} / {computedTotalPages}
        </span>
        <Link
          className={cn(
            "rounded-md px-2 py-1 hover:bg-muted",
            parsed.page >= computedTotalPages && "pointer-events-none opacity-40",
          )}
          href={serializeAntibodyQuery({
            ...parsed,
            page: parsed.page + 1,
            basePath,
          })}
        >
          Next →
        </Link>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add antibody" : "Edit antibody"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AntibodyFormFields
              form={form}
              setForm={setForm}
              disabled={pending}
            />
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : dialogMode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
