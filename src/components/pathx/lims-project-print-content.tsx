"use client";

import type { ReactNode } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LimsProjectDetailPayload } from "@/lib/lims/get-lims-project-detail-action";
import {
  formatLimsProjectStatusLabel,
  formatLimsSpeciesLabel,
} from "@/lib/lims/types";
import { printWithDataQuoteIsolation } from "@/lib/print-data-quote";

function formatMediumDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function dash(s: string | null | undefined): string {
  const t = (s ?? "").trim();
  return t || "—";
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground print:text-neutral-600">
      {children}
    </p>
  );
}

export function LimsProjectPrintContent({ data }: { data: LimsProjectDetailPayload }) {
  const printedAt = formatDateTime(new Date().toISOString());

  return (
    <div className="quote-print-body space-y-8 p-4 text-sm text-foreground print:p-6 print:text-black sm:p-6">
      <div className="border-b border-white/[0.06] pb-4 text-center print:border-neutral-300">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground print:text-neutral-600">
          PathX · LIMS
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight print:text-black">
          Project record
        </p>
        <p className="mt-1 font-mono text-lg print:text-black">{data.project_reference}</p>
      </div>

      <div className="grid gap-6 border-b border-white/[0.06] pb-6 sm:grid-cols-2 print:border-neutral-300">
        <div>
          <SectionTitle>Client &amp; project</SectionTitle>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Organization</dt>
              <dd className="font-medium print:text-black">{dash(data.client_org_name)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Contact</dt>
              <dd className="print:text-black">{dash(data.contact_name)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Project title</dt>
              <dd className="print:text-black">{dash(data.project_title)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Address</dt>
              <dd className="whitespace-pre-wrap print:text-black">{dash(data.client_address)}</dd>
            </div>
          </dl>
        </div>
        <div>
          <SectionTitle>Identifiers &amp; status</SectionTitle>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Internal ID (UUID)</dt>
              <dd className="break-all font-mono text-xs print:text-black">{data.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Status</dt>
              <dd className="capitalize print:text-black">
                {formatLimsProjectStatusLabel(data.status)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Source quote</dt>
              <dd className="print:text-black">
                {data.source_quote_reference
                  ? data.source_quote_reference
                  : data.source_quote_id
                    ? data.source_quote_id
                    : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Created</dt>
              <dd className="print:text-black">{formatDateTime(data.created_at)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground print:text-neutral-600">Updated</dt>
              <dd className="print:text-black">{formatDateTime(data.updated_at)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="space-y-3 border-b border-white/[0.06] pb-6 print:border-neutral-300">
        <SectionTitle>Project details</SectionTitle>
        <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground print:text-neutral-800">
          {dash(data.procedures)}
        </p>
      </div>

      <div className="space-y-6">
        <SectionTitle>Samples &amp; slides</SectionTitle>
        {data.samples.length === 0 ? (
          <p className="text-muted-foreground print:text-neutral-700">No samples on this project.</p>
        ) : (
          <div className="space-y-10">
            {data.samples.map((sample, sIdx) => (
              <div
                key={sample.id}
                className="rounded-lg border border-white/[0.08] print:border-neutral-300"
              >
                <div className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-3 print:border-neutral-300 print:bg-neutral-100">
                  <p className="font-mono text-base font-semibold print:text-black">
                    Sample {sIdx + 1}: {sample.sample_reference}
                  </p>
                  <p className="mt-0.5 text-muted-foreground print:text-neutral-700">
                    {sample.name}
                    {sample.client_sample_id ? ` · Client ID: ${sample.client_sample_id}` : ""}
                  </p>
                </div>
                <div className="space-y-5 px-4 py-4">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground print:text-neutral-600">
                        Species
                      </dt>
                      <dd className="print:text-black">
                        {formatLimsSpeciesLabel(sample.species_kind)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground print:text-neutral-600">
                        Tissue type
                      </dt>
                      <dd className="print:text-black">{dash(sample.tissue_type)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground print:text-neutral-600">
                        Organ abbrev.
                      </dt>
                      <dd className="print:text-black">{dash(sample.organ_abbrev)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground print:text-neutral-600">
                        Diagnostic
                      </dt>
                      <dd className="whitespace-pre-wrap print:text-black">
                        {dash(sample.diagnostic)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground print:text-neutral-600">
                        Date received
                      </dt>
                      <dd className="print:text-black">{formatMediumDate(sample.date_received)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground print:text-neutral-600">
                        Date of dissection
                      </dt>
                      <dd className="print:text-black">
                        {formatMediumDate(sample.date_of_dissection)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground print:text-neutral-600">DOB</dt>
                      <dd className="print:text-black">{formatMediumDate(sample.dob)}</dd>
                    </div>
                  </dl>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground print:text-neutral-600">
                      Special care
                    </p>
                    <p className="mt-1 whitespace-pre-wrap print:text-black">
                      {dash(sample.special_care_instructions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground print:text-neutral-600">
                      Services notes
                    </p>
                    <p className="mt-1 whitespace-pre-wrap print:text-black">
                      {dash(sample.services_notes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground print:text-neutral-600">
                      Instructions
                    </p>
                    <p className="mt-1 whitespace-pre-wrap print:text-black">
                      {dash(sample.instructions_notes)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground print:text-neutral-600">
                      Services (catalog lines)
                    </p>
                    {sample.service_lines.length === 0 ? (
                      <p className="text-muted-foreground print:text-neutral-700">—</p>
                    ) : (
                      <div className="overflow-hidden rounded-md border border-white/[0.06] print:border-neutral-300">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.03] print:border-neutral-300 print:bg-neutral-50">
                              <th className="px-3 py-2 font-semibold print:text-neutral-700">
                                Service
                              </th>
                              <th className="px-3 py-2 text-right font-semibold print:text-neutral-700">
                                Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sample.service_lines.map((line) => (
                              <tr
                                key={line.id}
                                className="border-b border-white/[0.05] last:border-0 print:border-neutral-200"
                              >
                                <td className="px-3 py-2 print:text-black">{line.label}</td>
                                <td className="px-3 py-2 text-right tabular-nums print:text-black">
                                  {line.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground print:text-neutral-600">
                      Custom metadata
                    </p>
                    {sample.metadata.length === 0 ? (
                      <p className="text-muted-foreground print:text-neutral-700">—</p>
                    ) : (
                      <ul className="space-y-1">
                        {sample.metadata.map((m) => (
                          <li key={m.id} className="print:text-black">
                            <span className="font-medium">{m.key}:</span>{" "}
                            <span className="whitespace-pre-wrap">{m.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground print:text-neutral-600">
                      Slides
                    </p>
                    {sample.slides.length === 0 ? (
                      <p className="text-muted-foreground print:text-neutral-700">No slides.</p>
                    ) : (
                      <div className="space-y-6">
                        {sample.slides.map((slide, slIdx) => (
                          <div
                            key={slide.id}
                            className="rounded-md border border-white/[0.06] print:border-neutral-200"
                          >
                            <div className="border-b border-white/[0.05] px-3 py-2 print:border-neutral-200 print:bg-neutral-50">
                              <p className="font-mono text-sm font-semibold print:text-black">
                                Slide {slIdx + 1}: {slide.slide_reference}
                              </p>
                              <p className="text-xs text-muted-foreground print:text-neutral-600">
                                Created {formatDateTime(slide.created_at)}
                              </p>
                            </div>
                            <div className="space-y-3 px-3 py-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground print:text-neutral-600">
                                  Notes
                                </p>
                                <p className="mt-1 whitespace-pre-wrap print:text-black">
                                  {dash(slide.notes)}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground print:text-neutral-600">
                                  Slide metadata
                                </p>
                                {slide.metadata.length === 0 ? (
                                  <p className="text-muted-foreground print:text-neutral-700">—</p>
                                ) : (
                                  <ul className="space-y-1 text-sm">
                                    {slide.metadata.map((m) => (
                                      <li key={m.id} className="print:text-black">
                                        <span className="font-medium">{m.key}:</span>{" "}
                                        <span className="whitespace-pre-wrap">{m.value}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground print:text-neutral-600">
                                  Slide workflow steps
                                </p>
                                {slide.steps.length === 0 ? (
                                  <p className="text-muted-foreground print:text-neutral-700">—</p>
                                ) : (
                                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                                    {slide.steps.map((st) => (
                                      <li key={st.id} className="print:text-black">
                                        <span
                                          className={st.completed_at ? "line-through opacity-80" : ""}
                                        >
                                          {st.content}
                                        </span>
                                        {st.completed_at ? (
                                          <span className="ml-1 text-xs text-muted-foreground print:text-neutral-600">
                                            (done {formatMediumDate(st.completed_at)})
                                          </span>
                                        ) : null}
                                      </li>
                                    ))}
                                  </ol>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="border-t border-white/[0.06] pt-4 text-center text-xs text-muted-foreground print:border-neutral-300 print:text-neutral-600">
        Printed {printedAt}. Sample and slide fields reflect data last loaded from the server; save
        pending edits before printing if you need them included.
      </p>

      <div className="flex flex-col gap-2 print:hidden">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => printWithDataQuoteIsolation()}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>
    </div>
  );
}
