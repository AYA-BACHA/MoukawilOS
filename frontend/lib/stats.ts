import type { InvoiceWithClient, TurnoverStats, User } from "@/types/models";

const sum = (invoices: InvoiceWithClient[], status?: InvoiceWithClient["status"]) =>
  invoices.filter((invoice) => !status || invoice.status === status).reduce((total, invoice) => total + invoice.amount, 0);

export function computeStats(user: User, invoices: InvoiceWithClient[]): TurnoverStats {
  const collected = sum(invoices, "paid");
  return {
    ceiling: user.ceiling,
    collected,
    pending: sum(invoices, "pending"),
    remaining: user.ceiling - collected,
    utilization: collected / user.ceiling,
    totalInvoiced: sum(invoices),
    counts: {
      all: invoices.length,
      paid: invoices.filter((invoice) => invoice.status === "paid").length,
      pending: invoices.filter((invoice) => invoice.status === "pending").length,
      draft: invoices.filter((invoice) => invoice.status === "draft").length,
    },
  };
}
