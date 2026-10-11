export type QuoteStatus =
  | "created"
  | "sent"
  | "approved"
  | "cancelled"
  | "discarded";

export function isQuoteStatus(value: string): value is QuoteStatus {
  return (
    value === "created" ||
    value === "sent" ||
    value === "approved" ||
    value === "cancelled" ||
    value === "discarded"
  );
}
