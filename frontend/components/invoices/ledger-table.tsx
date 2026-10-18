import { FileDown, Trash2 } from "lucide-react";
import { clientDetail, formatAmount, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { InvoiceStatus, InvoiceWithClient } from "@/types/models";

const statusStyles: Record<InvoiceStatus, { label: string; pill: string; dot: string }> = {
  pending: { label: "Pending / Issued", pill: "bg-surface-high text-body", dot: "bg-teal" },
  paid: { label: "Paid", pill: "bg-mint text-mint-ink", dot: "bg-primary" },
  draft: { label: "Draft", pill: "bg-surface text-muted", dot: "bg-muted" },
};

const headClass = "px-3 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-body";
const cellClass = "px-3 py-3";

interface LedgerTableProps {
  invoices: InvoiceWithClient[];
  activeId: string | null;
  onMarkPaid: (id: string) => void;
  onDeleteDraft: (id: string) => void;
}

export function LedgerTable({ invoices, activeId, onMarkPaid, onDeleteDraft }: LedgerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-low">
          <tr>
            <th className={headClass}>Invoice Ref</th>
            <th className={headClass}>Client Name & Legal Type</th>
            <th className={headClass}>Issue Date</th>
            <th className={headClass}>Due Date</th>
            <th className={cn(headClass, "text-right")}>Amount (DZD)</th>
            <th className={headClass}>Statutory Clause</th>
            <th className={cn(headClass, "text-center")}>Status</th>
            <th className={cn(headClass, "text-right")}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const status = statusStyles[invoice.status];
            const isDraft = invoice.status === "draft";
            const isActive = invoice.id === activeId;
            return (
              <tr key={invoice.id} className={cn(isActive && "bg-surface-high/20", isDraft && "opacity-80")}>
                <td className={cn(cellClass, "py-[22px] font-num text-sm font-bold whitespace-nowrap", isActive ? "text-primary-ink" : isDraft ? "text-muted" : "text-ink")}>
                  {invoice.number}
                </td>
                <td className={cellClass}>
                  <div className="flex items-center gap-1">
                    <span className="whitespace-nowrap text-sm font-semibold text-ink">{invoice.client.name}</span>
                    <span className="rounded-sm bg-surface px-1.5 text-[10px] font-bold leading-5 text-body">{invoice.client.type}</span>
                  </div>
                  <p className="font-num text-xs text-muted">{clientDetail(invoice.client)}</p>
                </td>
                <td className={cn(cellClass, "whitespace-nowrap text-sm font-medium text-body")}>{formatDate(invoice.issueDate)}</td>
                <td className={cn(cellClass, "whitespace-nowrap text-sm font-medium text-body")}>{formatDate(invoice.dueDate)}</td>
                <td className={cn(cellClass, "text-right font-num text-sm font-bold", isDraft ? "text-muted" : "text-ink")}>{formatAmount(invoice.amount)}</td>
                <td className={cellClass}>
                  <span className="inline-block whitespace-nowrap rounded-sm bg-surface px-2 py-1 text-xs font-medium tracking-[0.02em] text-body">
                    {invoice.statutoryClause}
                  </span>
                </td>
                <td className={cn(cellClass, "text-center")}>
                  <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-xl px-2.5 py-0.5 text-xs font-medium tracking-[0.02em]", status.pill)}>
                    <span className={cn("size-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </td>
                <td className={cellClass}>
                  <div className="flex items-center justify-end gap-1">
                    {invoice.status === "pending" && (
                      <button
                        onClick={() => onMarkPaid(invoice.id)}
                        className={cn(
                          "whitespace-nowrap rounded px-3 py-1.5 text-xs tracking-[0.02em]",
                          isActive ? "bg-primary font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : "bg-surface font-medium text-ink",
                        )}
                      >
                        Mark as Paid
                      </button>
                    )}
                    {invoice.status === "paid" && (
                      <button className="whitespace-nowrap rounded bg-surface px-2 py-1.5 text-xs font-medium tracking-[0.02em] text-ink">Receipt</button>
                    )}
                    {isDraft && (
                      <button className="whitespace-nowrap rounded bg-surface px-2 py-1.5 text-xs font-medium tracking-[0.02em] text-ink">Resume</button>
                    )}
                    {isDraft ? (
                      <button aria-label="Delete draft" onClick={() => onDeleteDraft(invoice.id)} className="rounded p-1.5 text-danger">
                        <Trash2 className="size-[15px]" />
                      </button>
                    ) : (
                      <button aria-label="Download PDF" className="rounded p-1.5 text-body">
                        <FileDown className="size-[15px]" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
