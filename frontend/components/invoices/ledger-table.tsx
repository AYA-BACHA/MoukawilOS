"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Download, FileDown, FileText, Plus, Printer, Trash2, X } from "lucide-react";
import { clientDetail } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { InvoiceStatus, InvoiceWithClient } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const statusStyles: Record<InvoiceStatus, { label: string; pill: string; dot: string }> = {
  pending: { label: "Pending", pill: "bg-surface-high text-body", dot: "bg-teal" },
  paid: { label: "Paid", pill: "bg-mint font-semibold text-accent", dot: "bg-primary" },
  draft: { label: "Draft", pill: "bg-surface text-muted", dot: "bg-muted" },
};

const headClass = "px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-muted";
const cellClass = "px-3 py-3.5";

interface LedgerTableProps {
  invoices: InvoiceWithClient[];
  activeId: string | null;
  onMarkPaid: (id: string) => void;
  onDeleteDraft: (id: string) => void;
}

export function LedgerTable({ invoices, activeId, onMarkPaid, onDeleteDraft }: LedgerTableProps) {
  const { t, formatAmount, formatDate } = useI18n();
  const [viewingReceipt, setViewingReceipt] = useState<InvoiceWithClient | null>(null);

  return (
    <>
      {/* Mobile Stacked Card View (< md) */}
      <div className="flex flex-col gap-3 md:hidden">
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-card p-8 text-center shadow-xs">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-mint text-accent">
              <FileText className="size-5" />
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{t("No commercial records found")}</p>
            <p className="mt-1 text-xs text-muted">
              {t("No invoices match the current filter. Create your first compliant 0% VAT invoice.")}
            </p>
            <Link
              href="/invoices/new"
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs"
            >
              <Plus className="size-3.5" />
              {t("Create New Invoice")}
            </Link>
          </div>
        ) : (
          invoices.map((invoice) => {
            const status = statusStyles[invoice.status];
            const isDraft = invoice.status === "draft";
            return (
              <div
                key={invoice.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-card p-4 shadow-xs transition-all",
                  isDraft && "opacity-90",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-num text-sm font-bold text-ink">{invoice.number}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      status.pill,
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", status.dot)} />
                    {t(status.label)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink truncate">{invoice.client.name}</p>
                    <div className="flex items-center gap-2 pt-0.5 text-xs text-muted">
                      <span className="rounded bg-surface-low px-1.5 py-0.2 font-semibold text-[10px] text-teal">
                        {invoice.client.type}
                      </span>
                      <span className="truncate">{clientDetail(invoice.client)}</span>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="font-num text-base font-bold text-ink">
                      {formatAmount(invoice.amount)} <span className="text-xs font-normal text-muted">{t("DZD")}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-muted">
                  <span>{t("Issued: {d}", { d: formatDate(invoice.issueDate) })}</span>
                  <span>{t("Due: {d}", { d: formatDate(invoice.dueDate) })}</span>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2">
                  {invoice.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => onMarkPaid(invoice.id)}
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs active:scale-95"
                    >
                      <Check className="size-3.5" />
                      {t("Mark Paid")}
                    </button>
                  )}
                  {invoice.status === "paid" && (
                    <button
                      type="button"
                      onClick={() => setViewingReceipt(invoice)}
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-slate-200 bg-surface-low px-3.5 py-2 text-xs font-medium text-body active:scale-95"
                    >
                      <FileDown className="size-3.5 text-accent" />
                      {t("Receipt")}
                    </button>
                  )}
                  {isDraft && (
                    <>
                      <Link
                        href={`/invoices/new?client=${invoice.client.id}`}
                        className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-200 bg-surface-low px-3.5 py-2 text-xs font-medium text-body active:scale-95"
                      >
                        {t("Edit Draft")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeleteDraft(invoice.id)}
                        className="inline-flex min-h-[44px] items-center rounded-lg p-2.5 text-red-600 hover:bg-red-50 active:scale-95"
                        aria-label={t("Delete Draft")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-start">
          <thead className="border-b border-slate-100 bg-surface-low/80">
            <tr>
              <th className={headClass}>{t("Invoice Ref")}</th>
              <th className={headClass}>{t("Client & ID")}</th>
              <th className={headClass}>{t("Issue / Due Date")}</th>
              <th className={cn(headClass, "text-end")}>{t("Amount (DZD)")}</th>
              <th className={headClass}>{t("Legal Clause")}</th>
              <th className={cn(headClass, "text-center")}>{t("Status")}</th>
              <th className={cn(headClass, "text-end")}>{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-mint text-accent">
                      <FileText className="size-5" />
                    </div>
                    <p className="text-sm font-semibold text-ink">{t("No commercial records found")}</p>
                    <p className="max-w-xs text-xs text-muted">
                      {t("No invoices match the current filter. Create your first compliant 0% VAT invoice.")}
                    </p>
                    <Link
                      href="/invoices/new"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-ink transition-colors"
                    >
                      <Plus className="size-3.5" />
                      {t("Create New Invoice")}
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
              const status = statusStyles[invoice.status];
              const isDraft = invoice.status === "draft";
              const isActive = invoice.id === activeId;

              return (
                <tr
                  key={invoice.id}
                  className={cn(
                    "transition-colors hover:bg-slate-50/70",
                    isActive && "bg-surface-high/30",
                    isDraft && "opacity-80",
                  )}
                >
                  {/* Invoice Ref */}
                  <td className={cn(cellClass, "font-num text-xs font-bold text-ink whitespace-nowrap")}>
                    {invoice.number}
                  </td>

                  {/* Client & Legal Type */}
                  <td className={cellClass}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-ink">{invoice.client.name}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.2 text-[10px] font-bold",
                          invoice.client.type === "B2B" ? "bg-surface text-teal" : "bg-surface-low text-body",
                        )}
                      >
                        {invoice.client.type}
                      </span>
                    </div>
                    <p className="font-num text-[11px] text-muted truncate max-w-[200px]">
                      {clientDetail(invoice.client)}
                    </p>
                  </td>

                  {/* Dates */}
                  <td className={cellClass}>
                    <div className="text-xs font-medium text-ink">{formatDate(invoice.issueDate)}</div>
                    <div className="text-[11px] text-muted">{t("Due {v1}", { v1: formatDate(invoice.dueDate) })}</div>
                  </td>

                  {/* Amount */}
                  <td className={cn(cellClass, "text-end font-num text-xs font-bold", isDraft ? "text-muted" : "text-ink")}>
                    {formatAmount(invoice.amount)}
                  </td>

                  {/* Statutory Clause */}
                  <td className={cellClass}>
                    <span className="inline-block rounded-md border border-slate-200/60 bg-surface px-2 py-0.5 text-[10px] font-medium text-body">
                      {invoice.statutoryClause}
                    </span>
                  </td>

                  {/* Status Pill */}
                  <td className={cn(cellClass, "text-center whitespace-nowrap")}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        status.pill,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", status.dot)} />
                      {t(status.label)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className={cellClass}>
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      {invoice.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => onMarkPaid(invoice.id)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                            isActive
                              ? "bg-primary text-white shadow-xs"
                              : "border border-slate-200/80 bg-surface text-ink hover:bg-slate-200",
                          )}
                        >
                          {t("Mark Paid")}
                        </button>
                      )}

                      {invoice.status === "paid" && (
                        <button
                          type="button"
                          onClick={() => setViewingReceipt(invoice)}
                          className="rounded-lg border border-slate-200/80 bg-surface-low px-2.5 py-1 text-xs font-medium text-body transition-colors hover:bg-surface hover:text-ink"
                        >
                          {t("Receipt")}
                        </button>
                      )}

                      {isDraft && (
                        <Link
                          href="/invoices/new"
                          className="rounded-lg border border-slate-200/80 bg-surface-low px-2.5 py-1 text-xs font-medium text-body transition-colors hover:bg-surface hover:text-ink"
                        >
                          {t("Resume")}
                        </Link>
                      )}

                      {isDraft ? (
                        <button
                          type="button"
                          aria-label={t("Delete draft")}
                          onClick={() => onDeleteDraft(invoice.id)}
                          className="rounded-lg p-1.5 text-danger transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label={t("Download PDF")}
                          onClick={() => {
                            if (invoice.status === "paid") setViewingReceipt(invoice);
                            else window.print();
                          }}
                          className="rounded-lg p-1.5 text-body transition-colors hover:bg-surface hover:text-ink"
                        >
                          <FileDown className="size-3.5 text-accent" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Official Receipt Voucher Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-card p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden">
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
                className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink active:scale-95"
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
                <span className="text-accent">{t("{v1} DZD", { v1: formatAmount(viewingReceipt.amount) })}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
              <Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
              <span>{t("Recognized in Statutory Turnover under cash-basis rules (Law 22-23). 0% VAT strictly applied.")}</span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-surface-low px-4 py-2 text-xs font-semibold text-ink shadow-2xs hover:bg-surface active:scale-95"
              >
                {t("Close")}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-ink active:scale-95 transition-all"
              >
                <Printer className="size-3.5" />
                {t("Print Voucher")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
