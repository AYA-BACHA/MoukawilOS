import Link from "next/link";
import { ArrowRight, Download, MoreHorizontal } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { formatAmount, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { InvoiceStatus, InvoiceWithClient } from "@/types/models";

const statusStyles: Record<InvoiceStatus, { label: string; pill: string; dot: string }> = {
  pending: { label: "Pending / Issued", pill: "bg-surface text-ink", dot: "bg-teal" },
  paid: { label: "Paid", pill: "bg-mint font-semibold text-primary", dot: "bg-primary" },
  draft: { label: "Draft", pill: "bg-surface text-body", dot: "bg-muted" },
};

const rowAction: Record<InvoiceStatus, { label: string; className: string; icon?: boolean }> = {
  pending: { label: "Mark as Paid", className: "bg-surface font-semibold" },
  paid: { label: "Download PDF", className: "bg-surface-low", icon: true },
  draft: { label: "Resume Edit", className: "bg-surface-low" },
};

const headClass = "px-4 py-3.5 text-xs font-medium uppercase tracking-[0.05em] text-body";

export function RecentInvoices({ invoices }: { invoices: InvoiceWithClient[] }) {
  const subtotalPending = invoices.filter((invoice) => invoice.status === "pending").reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold leading-7 tracking-[-0.015em] text-ink">Recent Invoices</h2>
          <Pill className="bg-surface-low px-2.5 py-0.5 text-ink">{invoices.length} Total</Pill>
        </div>
        <Link href="/invoices" className="inline-flex items-center gap-1 rounded-xl px-3 py-1 text-sm font-medium text-primary-ink">
          View all in ledger
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-low">
            <tr>
              <th className={headClass}>Invoice Number</th>
              <th className={headClass}>Client</th>
              <th className={headClass}>Date</th>
              <th className={cn(headClass, "text-right")}>Amount (DZD)</th>
              <th className={headClass}>Status</th>
              <th className={cn(headClass, "text-right")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const status = statusStyles[invoice.status];
              const action = rowAction[invoice.status];
              return (
                <tr key={invoice.id} className="border-t border-surface first:border-t-0">
                  <td className="px-4 py-[18px] font-num text-sm font-bold text-primary-ink">{invoice.number}</td>
                  <td className="py-[18px] pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{invoice.client.name}</span>
                      <span
                        className={cn(
                          "rounded-xl px-2 py-0.5 text-xs font-semibold",
                          invoice.client.type === "B2B" ? "bg-surface text-teal" : "bg-surface-low text-body",
                        )}
                      >
                        {invoice.client.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 pl-8 pr-4 text-xs tracking-[0.01em] text-body">{formatDate(invoice.issueDate)}</td>
                  <td className="px-4 py-[18px] text-right font-num text-sm font-bold text-ink">{formatAmount(invoice.amount)}</td>
                  <td className="p-4">
                    <Pill dot={status.dot} className={cn("px-3 py-1", status.pill)}>
                      {status.label}
                    </Pill>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className={cn("inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium tracking-[0.02em] text-ink", action.className)}>
                        {action.icon && <Download className="size-3" />}
                        {action.label}
                      </button>
                      <button aria-label="Invoice options" className="rounded-xl p-1.5 text-body">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between bg-surface-low px-4 py-2">
        <p className="text-xs font-medium tracking-[0.02em] text-body">Displaying latest transactions compliant with Executive Decree 23-197.</p>
        <span className="rounded-xl bg-white px-2.5 py-1 font-num text-xs text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          Subtotal Pending: {formatAmount(subtotalPending)} DZD
        </span>
      </div>
    </section>
  );
}
