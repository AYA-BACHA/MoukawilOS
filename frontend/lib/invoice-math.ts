import type { InvoiceItem } from "@/types/models";

export const lineTotal = (item: InvoiceItem) => item.quantity * item.unitPrice;

export const subtotal = (items: InvoiceItem[]) => items.reduce((total, item) => total + lineTotal(item), 0);

export function addDays(iso: string, days: number) {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const paymentTerms = [
  { days: 0, label: "Due on receipt" },
  { days: 15, label: "15 Days Net" },
  { days: 30, label: "30 Days Net" },
  { days: 45, label: "45 Days Net" },
  { days: 60, label: "60 Days Net" },
];
