"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Download, ExternalLink, FileDown, MoreHorizontal, Printer, X } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { PaymentModal } from "@/components/invoices/payment-modal";
import { formatAmount, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { InvoiceStatus, InvoiceWithClient, PaymentConfirmation, TurnoverStats } from "@/types/models";

const statusStyles: Record<InvoiceStatus, { label: string; pill: string; dot: string }> = {
  pending: { label: "Pending / Issued", pill: "bg-surface text-ink", dot: "bg-teal" },
  paid: { label: "Paid", pill: "bg-mint font-semibold text-primary", dot: "bg-primary" },
  draft: { label: "Draft", pill: "bg-surface text-body", dot: "bg-muted" },
};

const headClass = "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted";

export function RecentInvoices({
  invoices: initialInvoices,
  stats,
}: {
  invoices: InvoiceWithClient[];
  stats?: TurnoverStats;
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceWithClient | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<InvoiceWithClient | null>(null);
  const [settledInvoice, setSettledInvoice] = useState<InvoiceWithClient | null>(null);

  const subtotalPending = invoices
    .filter((invoice) => invoice.status === "pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const activeStats: TurnoverStats = stats ?? {
    ceiling: 5000000,
    collected: 2000000,
    remaining: 3000000,
    utilization: 0.4,
    pending: subtotalPending,
    totalInvoiced: 2000000 + subtotalPending,
    counts: { all: invoices.length, paid: 1, pending: 2, draft: 0 },
  };

  const confirmPayment = ({ invoiceId, settlementDate, rail }: PaymentConfirmation) => {
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === invoiceId ? { ...item, status: "paid", paidAt: settlementDate, paymentRail: rail } : item,
      ),
    );
    const target = invoices.find((inv) => inv.id === invoiceId);
    if (target) {
      setSettledInvoice({ ...target, status: "paid", paidAt: settlementDate, paymentRail: rail });
    }
    setPayingInvoice(null);
  };

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-ink">Recent Invoices</h2>
            <Pill className="border border-slate-200/80 bg-surface-low px-2.5 py-0.5 text-ink font-semibold">
              {invoices.length} Total
            </Pill>
          </div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-surface-low px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:border-slate-300 hover:bg-surface active:scale-95"
          >
            View all in ledger
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-low/80">
              <tr>
                <th className={headClass}>Invoice Ref</th>
                <th className={headClass}>Client</th>
                <th className={headClass}>Date</th>
                <th className={cn(headClass, "text-right")}>Amount (DZD)</th>
                <th className={cn(headClass, "text-center")}>Status</th>
                <th className={cn(headClass, "text-right")}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => {
                const status = statusStyles[invoice.status];
                return (
                  <tr key={invoice.id} className="transition-all duration-150 hover:bg-slate-50/90 hover:shadow-[inset_3px_0_0_0_#0D9488]">
                    <td className="px-4 py-3.5 font-num text-sm font-bold text-primary-ink">
                      {invoice.number}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">{invoice.client.name}</span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-bold",
                            invoice.client.type === "B2B" ? "bg-surface text-teal" : "bg-surface-low text-body",
                          )}
                        >
                          {invoice.client.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-body">{formatDate(invoice.issueDate)}</td>
                    <td className="px-4 py-3.5 text-right font-num text-sm font-bold text-ink">
                      {formatAmount(invoice.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Pill dot={status.dot} className={cn("px-2.5 py-0.5 text-xs", status.pill)}>
                        {status.label}
                      </Pill>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {invoice.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => setPayingInvoice(invoice)}
                            className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50/70 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition-all duration-150 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-xs active:scale-95 shadow-2xs"
                          >
                            <Check className="size-3 text-emerald-600 transition-all duration-150 group-hover/btn:scale-110 group-hover/btn:text-white" strokeWidth={2.5} />
                            <span>Mark as Paid</span>
                          </button>
                        )}
                        {invoice.status === "paid" && (
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(invoice)}
                            className="group/receipt inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-all duration-150 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xs active:scale-95 shadow-2xs"
                          >
                            <FileDown className="size-3 text-primary transition-all duration-150 group-hover/receipt:text-white group-hover/receipt:-translate-y-0.5" />
                            <span>PDF Receipt</span>
                          </button>
                        )}
                        {invoice.status === "draft" && (
                          <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-surface-low px-2.5 py-1 text-xs font-semibold text-body transition-all duration-150 hover:bg-surface hover:text-ink active:scale-95"
                          >
                            Resume Edit
                          </Link>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Invoice options"
                            onClick={() => setActiveMenuId(activeMenuId === invoice.id ? null : invoice.id)}
                            className="rounded-lg p-1.5 text-body transition-all hover:bg-surface hover:text-ink active:scale-90"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>

                          {activeMenuId === invoice.id && (
                            <div className="absolute right-0 z-50 mt-1 w-40 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-black/8 animate-in fade-in zoom-in-95">
                              <Link
                                href="/invoices"
                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-body hover:bg-surface-low hover:text-ink transition-colors"
                              >
                                <ExternalLink className="size-3 text-muted" />
                                View in Ledger
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  window.print();
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-body hover:bg-surface-low hover:text-ink transition-colors"
                              >
                                <Printer className="size-3 text-muted" />
                                Print Invoice
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-surface-low/80 px-4 py-2.5">
          <p className="text-xs text-body">
            Displaying latest transactions compliant with Executive Decree 23-197.
          </p>
          <span className="rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 font-num text-xs font-semibold text-ink shadow-xs">
            Subtotal Pending: {formatAmount(subtotalPending)} DZD
          </span>
        </div>
      </section>

      {/* Payment Verification Modal */}
      {payingInvoice && (
        <PaymentModal
          invoice={payingInvoice}
          stats={activeStats}
          onClose={() => setPayingInvoice(null)}
          onConfirm={confirmPayment}
        />
      )}

      {/* Official Receipt Voucher Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-ink">
                  Executive Decree 23-197 Certified
                </span>
                <h3 className="mt-1 text-base font-bold text-ink">Official Settlement Receipt</h3>
                <p className="text-xs text-muted">Invoice Ref: #{viewingReceipt.number}</p>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">Client:</span>
                <span className="font-bold text-slate-900">{viewingReceipt.client.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">Payment Rail:</span>
                <span className="font-bold text-teal">{viewingReceipt.paymentRail ?? "Official Bank Transfer"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">Settlement Date:</span>
                <span className="font-bold text-slate-900">{viewingReceipt.paidAt ? formatDate(viewingReceipt.paidAt) : "2026-10-18"}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-sm">
                <span className="text-slate-900">Total Settled:</span>
                <span className="text-primary">{formatAmount(viewingReceipt.amount)} DZD</span>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-[11px] text-emerald-800">
              ✓ Recognized in Statutory Turnover under cash-basis rules (Law 22-23). 0% VAT strictly applied.
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-ink active:scale-95 transition-all"
              >
                <Printer className="size-3.5" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Payment Confirmation Toast */}
      {settledInvoice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">🎉 Payment Recorded for {settledInvoice.number}!</p>
            <p className="text-[11px] text-body">
              <strong className="font-num text-ink">{formatAmount(settledInvoice.amount)} DZD</strong> realized under cash-basis turnover.
            </p>
          </div>
          <button
            onClick={() => setSettledInvoice(null)}
            className="ml-2 rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
