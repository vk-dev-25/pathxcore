export type InvoiceStatus = "created" | "sent" | "paid" | "cancelled";

export type InvoiceLineInput = {
  id?: string;
  catalog_service_id: string | null;
  label: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceHeaderInput = {
  client_org_name: string;
  client_address: string;
  contact_name: string;
  project_title: string;
  invoice_reference: string;
  po_reference: string;
  notes: string;
  status: InvoiceStatus;
  due_date: string;
};

export function isInvoiceStatus(value: string): value is InvoiceStatus {
  return (
    value === "created" ||
    value === "sent" ||
    value === "paid" ||
    value === "cancelled"
  );
}

export function isInvoiceOverdue(input: {
  status: InvoiceStatus;
  due_date: string | null;
  now?: Date;
}): boolean {
  if (input.status === "paid" || input.status === "cancelled") return false;
  if (!input.due_date) return false;
  const d = new Date(`${input.due_date}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return false;
  const now = input.now ?? new Date();
  return now.getTime() > d.getTime();
}
