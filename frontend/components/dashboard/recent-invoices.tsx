"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Download, ExternalLink, FileDown, MoreHorizontal, Printer, X } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { PaymentModal } from "@/components/invoices/payment-modal";
import { PrintInvoiceModal } from "@/components/invoices/print-invoice-modal";

import { cn } from "@/lib/cn";
import { payInvoiceApi } from "@/lib/api";
import { printElementById } from "@/lib/print";
import type { InvoiceStatus, InvoiceWithClient, PaymentConfirmation, TurnoverStats } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const statusStyles: Record<InvoiceStatus, { label: string; pill: string; dot: string }> = {
  pending: { label: "Pending / Issued", pill: "bg-surface text-ink", dot: "bg-teal" },
  paid: { label: "Paid", pill: "bg-mint font-semibold text-accent", dot: "bg-primary" },
  draft: { label: "Draft", pill: "bg-surface text-body", dot: "bg-muted" },
  credited: { label: "Credited", pill: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold", dot: "bg-amber-500" },
  cancelled: { label: "Cancelled", pill: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300", dot: "bg-rose-500" },
};

const headClass = "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted";

export function RecentInvoices({
  invoices: initialInvoices,
  stats,
  onPaymentConfirmed,
}: {
  invoices: InvoiceWithClient[];
  stats?: TurnoverStats;
  onPaymentConfirmed?: (payment: PaymentConfirmation) => void;
}) {
  const { t, formatAmount, formatDate } = useI18n();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceWithClient | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<InvoiceWithClient | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<InvoiceWithClient | null>(null);
  const [settledInvoice, setSettledInvoice] = useState<InvoiceWithClient | null>(null);

  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

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
    counts: { all: invoices.length, paid: 1, pending: 1, draft: 1, credited: 0, cancelled: 0 },
  };

  const confirmPayment = ({ invoiceId, settlementDate, rail }: PaymentConfirmation) => {
    payInvoiceApi(invoiceId, settlementDate, rail).catch(console.error);
    onPaymentConfirmed?.({ invoiceId, settlementDate, rail });
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
      <section id="tour-recent-invoices" className="overflow-hidden rounded-xl border border-slate-200/80 bg-card shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-ink">{t("Recent Invoices")}</h2>
            <Pill className="border border-slate-200/80 bg-surface-low px-2.5 py-0.5 text-ink font-semibold">
              {t("{length} Total", { length: stats?.counts.all ?? invoices.length })}
            </Pill>
          </div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-surface-low px-3 py-1.5 text-xs font-semibold text-accent transition-all duration-150 hover:border-slate-300 hover:bg-surface active:scale-95 shadow-2xs hover:shadow-xs"
          >
            {t("View all in ledger")}
            <ArrowRight className="rtl:-scale-x-100 size-3" />
          </Link>
        </div>

        {/* Mobile Stacked Card View (< md) */}
        <div className="flex flex-col divide-y divide-slate-100 md:hidden">
          {invoices.map((invoice) => {
            const status = statusStyles[invoice.status];
            return (
              <div key={invoice.id} className="p-4 flex flex-col gap-2.5 transition-colors hover:bg-slate-50/70">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-num text-sm font-bold text-primary-ink">{invoice.number}</span>
                  <Pill dot={status.dot} className={cn("px-2.5 py-0.5 text-xs", status.pill)}>
                    {t(status.label)}
                  </Pill>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{invoice.client.name}</p>
                    <div className="flex items-center gap-2 pt-0.5 text-xs text-muted">
                      <span>{formatDate(invoice.issueDate)}</span>
                      <span>•</span>
                      <span className="font-medium text-teal">{invoice.client.type}</span>
                    </div>
                  </div>
                  <p className="font-num text-base font-bold text-ink shrink-0 text-end">
                    {formatAmount(invoice.amount)} <span className="text-xs font-medium text-muted">{t("DZD")}</span>
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100/80">
                  {invoice.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => setPayingInvoice(invoice)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-600 hover:text-white active:scale-95"
                    >
                      <Check className="size-3.5 text-emerald-600" strokeWidth={2.5} />
                      <span>{t("Mark as Paid")}</span>
                    </button>
                  )}
                  {invoice.status === "paid" && (
                    <button
                      type="button"
                      onClick={() => setViewingReceipt(invoice)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-primary hover:text-white active:scale-95"
                    >
                      <FileDown className="size-3.5 text-accent" />
                      <span>{t("PDF Receipt")}</span>
                    </button>
                  )}
                  {invoice.status === "draft" && (
                    <Link
                      href="/invoices/new"
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-slate-200 bg-surface-low px-3.5 py-2 text-xs font-semibold text-body transition-all hover:bg-surface hover:text-ink active:scale-95"
                    >
                      {t("Resume Edit")}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-start">
            <thead className="bg-surface-low/80">
              <tr>
                <th className={headClass}>{t("Invoice Ref")}</th>
                <th className={headClass}>{t("Client")}</th>
                <th className={headClass}>{t("Date")}</th>
                <th className={cn(headClass, "text-end")}>{t("Amount (DZD)")}</th>
                <th className={cn(headClass, "text-center")}>{t("Status")}</th>
                <th className={cn(headClass, "text-end")}>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice, idx) => {
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
                    <td className="px-4 py-3.5 text-end font-num text-sm font-bold text-ink">
                      {formatAmount(invoice.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Pill dot={status.dot} className={cn("px-2.5 py-0.5 text-xs", status.pill)}>
                        {t(status.label)}
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
                            <span>{t("Mark as Paid")}</span>
                          </button>
                        )}
                        {invoice.status === "paid" && (
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(invoice)}
                            className="group/receipt inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-all duration-150 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xs active:scale-95 shadow-2xs"
                          >
                            <FileDown className="size-3 text-accent transition-all duration-150 group-hover/receipt:text-white group-hover/receipt:-translate-y-0.5" />
                            <span>{t("PDF Receipt")}</span>
                          </button>
                        )}
                        {invoice.status === "draft" && (
                          <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-surface-low px-2.5 py-1 text-xs font-semibold text-body transition-all duration-150 hover:bg-surface hover:text-ink active:scale-95"
                          >
                            {t("Resume Edit")}
                          </Link>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            aria-label={t("Invoice options")}
                            onClick={() => setActiveMenuId(activeMenuId === invoice.id ? null : invoice.id)}
                            className="rounded-lg p-1.5 text-body transition-all hover:bg-surface hover:text-ink active:scale-90"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>

                          {activeMenuId === invoice.id && (
                            <div
                              className={cn(
                                "absolute end-0 z-50 w-40 rounded-xl border border-slate-200 bg-card p-1 shadow-lg shadow-black/8 animate-in fade-in zoom-in-95",
                                idx >= 1
                                  ? "bottom-full mb-1 ltr:origin-bottom-right rtl:origin-bottom-left"
                                  : "top-full mt-1 ltr:origin-top-right rtl:origin-top-left",
                              )}
                            >
                              <Link
                                href="/invoices"
                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-body hover:bg-surface-low hover:text-ink transition-colors"
                              >
                                <ExternalLink className="size-3 text-muted" />
                                {t("View in Ledger")}
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  setPrintingInvoice(invoice);
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-body hover:bg-surface-low hover:text-ink transition-colors"
                              >
                                <Printer className="size-3 text-muted" />
                                {t("Print Invoice")}
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
            {t("Displaying latest transactions compliant with Executive Decree 23-197.")}
          </p>
          <span className="rounded-lg border border-slate-200/70 bg-card px-2.5 py-1 font-num text-xs font-semibold text-ink shadow-xs">
            {t("Subtotal Pending: {v1} DZD", { v1: formatAmount(subtotalPending) })}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div
            id="receipt-voucher-sheet"
            className="relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-ink">
                  {t("Executive Decree 23-197 Certified")}
                </span>
                <h3 className="mt-1 text-base font-bold text-ink">{t("Official Settlement Receipt")}</h3>
                <p className="text-xs text-muted">{t("Invoice Ref: #{number}", { number: viewingReceipt.number })}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                aria-label={t("Close Receipt")}
                className="no-print flex size-11 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink active:scale-95"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-1 flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-xs overflow-y-auto">
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">{t("Client:")}</span>
                <span className="font-bold text-slate-900">{viewingReceipt.client.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">{t("Payment Rail:")}</span>
                <span className="font-bold text-teal">{viewingReceipt.paymentRail ?? t("Official Bank Transfer")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600">{t("Settlement Date:")}</span>
                <span className="font-bold text-slate-900">{viewingReceipt.paidAt ? formatDate(viewingReceipt.paidAt) : "2026-10-18"}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-sm">
                <span className="text-slate-900">{t("Total Settled:")}</span>
                <span className="text-primary">{t("{v1} DZD", { v1: formatAmount(viewingReceipt.amount) })}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
              <Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
              <span>{t("Recognized in Statutory Turnover under cash-basis rules (Law 22-23). 0% VAT strictly applied.")}</span>
            </div>

            <div className="no-print mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
              >
                {t("Close")}
              </button>
              <button
                type="button"
                onClick={() => printElementById("receipt-voucher-sheet", `Recu-${viewingReceipt.number}`)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-ink active:scale-95 transition-all"
              >
                <Printer className="size-3.5" />
                {t("Print Voucher")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print & PDF Modal */}
      {printingInvoice && (
        <PrintInvoiceModal
          invoice={printingInvoice}
          onClose={() => setPrintingInvoice(null)}
          autoPrint={true}
        />
      )}

      {/* Payment Confirmation Toast */}
      {settledInvoice && (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-card p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">{t("Payment Recorded for {number}", { number: settledInvoice.number })}</p>
            <p className="text-[11px] text-body">
              <strong className="font-num text-ink">{t("{v1} DZD", { v1: formatAmount(settledInvoice.amount) })}</strong> {t("realized under cash-basis turnover.")}
            </p>
          </div>
          <button
            onClick={() => setSettledInvoice(null)}
            className="ms-2 rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
