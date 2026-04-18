import type { Metadata } from "next";

import {
  InvoiceFinderClient,
  type InvoiceListRow,
} from "@/components/pathx/invoice-finder-client";
import { isInvoiceStatus } from "@/lib/invoices/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Invoice finder | PathX",
  description: "Search and sort invoices from your PathX workspace.",
};

export default async function InvoiceFinderPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, client_org_name, contact_name, project_title, invoice_reference, total_amount, status, due_date, created_at, updated_at, last_updated_by_email",
    )
    .order("created_at", { ascending: false });

  const invoices: InvoiceListRow[] = (data ?? []).map((row) => ({
    id: row.id,
    client_org_name: row.client_org_name,
    contact_name: row.contact_name,
    project_title: row.project_title,
    invoice_reference: row.invoice_reference,
    total_amount: Number(row.total_amount),
    status: isInvoiceStatus(row.status) ? row.status : "created",
    due_date: row.due_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_updated_by_email: row.last_updated_by_email ?? null,
  }));

  if (error) {
    console.error(error);
  }

  return <InvoiceFinderClient invoices={invoices} />;
}
