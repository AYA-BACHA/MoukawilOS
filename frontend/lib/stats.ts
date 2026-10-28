import type { InvoiceWithClient, TurnoverStats, User } from "@/types/models";

const sum = (invoices: InvoiceWithClient[], status?: InvoiceWithClient["status"]) =>
  invoices.filter((invoice) => !status || invoice.status === status).reduce((total, invoice) => total + invoice.amount, 0);

export function computeStats(user: User, invoices: InvoiceWithClient[]): TurnoverStats {
  const collected = sum(invoices, "paid");
  const creditedInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "credited" ||
      Boolean(invoice.creditNoteNumber || (invoice.creditNotes && invoice.creditNotes.length > 0))
  );
  const totalCredited = creditedInvoices.reduce((sum, inv) => sum + (inv.creditedAmount || 0), 0);
  const netTurnover = Math.max(0, collected - totalCredited);

  return {
    ceiling: user.ceiling,
    collected,
    pending: sum(invoices, "pending"),
    remaining: Math.max(0, user.ceiling - netTurnover),
    utilization: collected / user.ceiling,
    totalInvoiced: sum(invoices),
    counts: {
      all: invoices.length,
      paid: invoices.filter((invoice) => invoice.status === "paid").length,
      pending: invoices.filter((invoice) => invoice.status === "pending").length,
      draft: invoices.filter((invoice) => invoice.status === "draft").length,
      credited: creditedInvoices.length,
      cancelled: invoices.filter((invoice) => invoice.status === "cancelled").length,
    },
  };
}
