"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Download, ExternalLink, MoreHorizontal, Printer, X } from "lucide-react";
import { Pill } from "@/components/ui/pill";

import { cn } from "@/lib/cn";
import type { InvoiceStatus, InvoiceWithClient } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const statusStyles: Record<InvoiceStatus, { label: string; pill: string; dot: string }> = {
  pending: { label: "Pending / Issued", pill: "bg-surface text-ink", dot: "bg-teal" },
  paid: { label: "Paid", pill: "bg-mint font-semibold text-accent", dot: "bg-primary" },
  draft: { label: "Draft", pill: "bg-surface text-body", dot: "bg-muted" },
};

const headClass = "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted";

export function RecentInvoices({ invoices: initialInvoices }: { invoices: InvoiceWithClient[] }) {
  const { t, formatAmount, formatDate } = useI18n();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [settledInvoice, setSettledInvoice] = useState<InvoiceWithClient | null>(null);

  const subtotalPending = invoices
    .filter((invoice) => invoice.status === "pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const handleAction = (invoice: InvoiceWithClient) => {
    if (invoice.status === "pending") {
      // Mark as paid
      setInvoices((prev) =>
        prev.map((item) =>
          item.id === invoice.id ? { ...item, status: "paid", paidAt: new Date().toISOString() } : item,
        ),
      );
      setSettledInvoice({ ...invoice, status: "paid" });
    } else if (invoice.status === "paid") {
      // Trigger receipt print
      window.print();
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-100 bg-card shadow-sm transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-ink">{t("Recent Invoices")}</h2>
            <Pill className="border border-slate-200/80 bg-surface-low px-2.5 py-0.5 text-ink font-semibold">
              {t("{length} Total", { length: invoices.length })}
            </Pill>
          </div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-surface-low px-3 py-1.5 text-xs font-semibold text-accent transition-all hover:border-slate-300 hover:bg-surface"
          >
            {t("View all in ledger")}
            <ArrowRight className="rtl:-scale-x-100 size-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
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
              {invoices.map((invoice) => {
                const status = statusStyles[invoice.status];
                return (
                  <tr key={invoice.id} className="transition-colors hover:bg-slate-50/70">
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
                            onClick={() => handleAction(invoice)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-surface px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:bg-slate-200"
                          >
                            {t("Mark as Paid")}
                          </button>
                        )}
                        {invoice.status === "paid" && (
                          <button
                            type="button"
                            onClick={() => handleAction(invoice)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-surface-low px-2.5 py-1 text-xs font-medium text-body transition-colors hover:bg-surface hover:text-ink"
                          >
                            <Download className="size-3 text-accent" />
                            {t("PDF Receipt")}
                          </button>
                        )}
                        {invoice.status === "draft" && (
                          <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-surface-low px-2.5 py-1 text-xs font-medium text-body transition-colors hover:bg-surface hover:text-ink"
                          >
                            {t("Resume Edit")}
                          </Link>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            aria-label={t("Invoice options")}
                            onClick={() => setActiveMenuId(activeMenuId === invoice.id ? null : invoice.id)}
                            className="rounded-lg p-1.5 text-body transition-colors hover:bg-surface hover:text-ink"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>

                          {activeMenuId === invoice.id && (
                            <div className="absolute end-0 z-50 mt-1 w-40 ltr:origin-top-right rtl:origin-top-left rounded-xl border border-slate-200 bg-card p-1 shadow-lg shadow-black/8 animate-in fade-in zoom-in-95">
                              <Link
                                href="/invoices"
                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-body hover:bg-surface-low hover:text-ink"
                              >
                                <ExternalLink className="size-3 text-muted" />
                                {t("View in Ledger")}
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  window.print();
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-body hover:bg-surface-low hover:text-ink"
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

      {/* Payment Confirmation Toast */}
      {settledInvoice && (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-card px-4 py-3 shadow-xl animate-in slide-in-from-bottom-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="size-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">{t("Invoice {number} Marked as Paid", { number: settledInvoice.number })}</p>
            <p className="text-[11px] text-body">{t("Recorded under cash-basis accounting in FY 2026.")}</p>
          </div>
          <button
            onClick={() => setSettledInvoice(null)}
            className="ms-2 rounded-lg p-1 text-muted hover:bg-slate-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
