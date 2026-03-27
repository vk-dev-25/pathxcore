import type { Metadata } from "next";

import { InvoiceEditorClient } from "@/components/pathx/invoice-editor-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoiceDetailAction } from "@/lib/invoices/get-invoice-detail-action";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Invoice | PathX",
  description: "Edit invoice details, status, due date, and line items.",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoiceRes, supabase] = await Promise.all([
    getInvoiceDetailAction(id),
    createClient(),
  ]);

  if (!invoiceRes.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Card className="border-destructive/30 bg-destructive/10 shadow-none">
          <CardHeader>
            <CardTitle>Invoice unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {invoiceRes.error}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: catalogRows } = await supabase
    .from("quote_catalog_services")
    .select("id, name, default_unit_price, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  const catalog = (catalogRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    default_unit_price: Number(row.default_unit_price),
  }));

  return <InvoiceEditorClient invoice={invoiceRes.data} catalog={catalog} />;
}
