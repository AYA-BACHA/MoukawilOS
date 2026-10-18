"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Download, Plus, X } from "lucide-react";
import { Filters, type ClientFilter, type StatusFilter } from "@/components/invoices/filters";
import { LedgerTable } from "@/components/invoices/ledger-table";
import { PaymentModal } from "@/components/invoices/payment-modal";
import { SummaryStrip } from "@/components/invoices/summary-strip";
import { downloadLedgerCsv } from "@/lib/csv";
import { formatAmount } from "@/lib/format";
import { computeStats } from "@/lib/stats";
import type { InvoiceWithClient, PaymentConfirmation, User } from "@/types/models";

const PAGE_SIZE = 6;

interface InvoicesLedgerProps {
  user: User;
  invoices: InvoiceWithClient[];
  initialQuery?: string;
}

export function InvoicesLedger({ user, invoices: initialInvoices, initialQuery = "" }: InvoicesLedgerProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [clientType, setClientType] = useState<ClientFilter>("all");
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [payingId, setPayingId] = useState<string | null>(null);

  const stats = useMemo(() => computeStats(user, invoices), [user, invoices]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return invoices.filter(
      (invoice) =>
        (status === "all" || invoice.status === status) &&
        (clientType === "all" || invoice.client.type === clientType) &&
        (!needle || invoice.client.name.toLowerCase().includes(needle) || invoice.number.includes(needle)),
    );
  }, [invoices, status, clientType, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const [settledToast, setSettledToast] = useState<{ number: string; amount: number } | null>(null);
  const payingInvoice = invoices.find((invoice) => invoice.id === payingId) ?? null;

  const confirmPayment = ({ invoiceId, settlementDate, rail }: PaymentConfirmation) => {
    const target = invoices.find((inv) => inv.id === invoiceId);
    setInvoices((current) =>
      current.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status: "paid", paidAt: settlementDate, paymentRail: rail } : invoice)),
    );
    if (target) {
      setSettledToast({ number: target.number, amount: target.amount });
    }
    setPayingId(null);
  };

  const deleteDraft = (invoiceId: string) => setInvoices((current) => current.filter((invoice) => invoice.id !== invoiceId));

  const changeFilter =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.05em] text-muted">Fiscal Ledger</span>
            <span className="size-1.5 rounded-full bg-hairline" />
            <span className="font-num text-xs text-teal">Decree 23-197 Compliant</span>
          </div>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.025em] text-ink">Invoices & Revenue</h1>
          <p className="max-w-2xl text-sm text-body">
            Manage commercial invoices, record client payments, and track statutory cash-basis turnover under Law 22-23.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => downloadLedgerCsv(filtered)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-surface-low hover:bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-xs transition-all hover:border-slate-300 active:scale-[0.98]"
          >
            <Download className="size-3.5 text-primary" />
            Export Ledger (CSV)
          </button>
          <Link
            href="/invoices/new"
            className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-ink px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="size-3.5" />
            New Invoice
          </Link>
        </div>
      </div>

      <SummaryStrip stats={stats} />

      <Filters
        status={status}
        onStatusChange={changeFilter(setStatus)}
        counts={stats.counts}
        query={query}
        onQueryChange={changeFilter(setQuery)}
        clientType={clientType}
        onClientTypeChange={changeFilter(setClientType)}
      />

      <section className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <LedgerTable invoices={visible} activeId={payingId} onMarkPaid={setPayingId} onDeleteDraft={deleteDraft} />
        <div className="flex items-center justify-between bg-surface-low px-3 py-2 text-xs tracking-[0.02em]">
          <p className="flex items-center gap-2 font-medium text-body">
            Showing {visible.length} of {filtered.length} commercial records
            <span className="size-1 rounded-full bg-hairline" />
            <span className="font-num font-normal">Legal Turnover Archive: FY 2026</span>
          </p>
          <div className="flex items-center gap-1 font-medium">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="rounded-sm bg-white px-2.5 py-1 text-body disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={number === currentPage ? "px-2 py-1 font-semibold text-primary-ink" : "px-2 py-1 text-body"}
              >
                {number}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="rounded-sm bg-white px-2.5 py-1 text-ink disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {payingInvoice && <PaymentModal invoice={payingInvoice} stats={stats} onClose={() => setPayingId(null)} onConfirm={confirmPayment} />}
      {settledToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">🎉 Payment Recorded for {settledToast.number}!</p>
            <p className="text-[11px] text-body">
              <strong className="font-num text-ink">{formatAmount(settledToast.amount)} DZD</strong> cleared &amp; realized under FY 2026 cash-basis turnover.
            </p>
          </div>
          <button
            onClick={() => setSettledToast(null)}
            className="ml-2 rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
