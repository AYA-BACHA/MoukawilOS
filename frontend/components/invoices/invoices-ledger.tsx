"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Download, Plus, RotateCcw, X } from "lucide-react";
import { Filters, type ClientFilter, type StatusFilter } from "@/components/invoices/filters";
import { LedgerTable } from "@/components/invoices/ledger-table";
import { PaymentModal } from "@/components/invoices/payment-modal";
import { SummaryStrip } from "@/components/invoices/summary-strip";
import { downloadLedgerCsv } from "@/lib/csv";

import { computeStats } from "@/lib/stats";
import { getInvoices, payInvoiceApi, type DemoScenario } from "@/lib/api";
import type { CreditNoteDetail, InvoiceWithClient, PaymentConfirmation, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const PAGE_SIZE = 6;

interface InvoicesLedgerProps {
  user: User;
  invoices: InvoiceWithClient[];
  initialFiscalYear?: string;
  initialQuery?: string;
}

export function InvoicesLedger({
  user,
  invoices: initialInvoices,
  initialFiscalYear = "2026",
  initialQuery = "",
}: InvoicesLedgerProps) {
  const { t, formatAmount } = useI18n();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [fiscalYear, setFiscalYear] = useState<string>(initialFiscalYear);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [clientType, setClientType] = useState<ClientFilter>("all");
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFy = localStorage.getItem("moukawil_fiscal_year");
      if (storedFy) setFiscalYear(storedFy);
      try {
        const stored = localStorage.getItem("moukawil_paid_invoices");
        if (stored) {
          const paymentsMap = JSON.parse(stored);
          setInvoices((prev) =>
            prev.map((inv) =>
              paymentsMap[inv.id]
                ? {
                    ...inv,
                    status: "paid" as const,
                    paidAt: paymentsMap[inv.id].paidAt,
                    paymentRail: paymentsMap[inv.id].paymentRail,
                  }
                : inv,
            ),
          );
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Listen to scenario, fiscal year, payment, or credit note events across components
  useEffect(() => {
    const handleScenarioChange = (e: Event) => {
      const customEvent = e as CustomEvent<DemoScenario>;
      getInvoices(customEvent.detail).then((updated) => setInvoices(updated));
    };

    const handleFyChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) setFiscalYear(customEvent.detail);
    };

    const handlePaidEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ invoiceId: string; settlementDate: string; rail: string }>;
      if (customEvent.detail) {
        const { invoiceId, settlementDate, rail } = customEvent.detail;
        setInvoices((prev) =>
          prev.map((item) =>
            item.id === invoiceId
              ? { ...item, status: "paid", paidAt: settlementDate, paymentRail: rail }
              : item,
          ),
        );
      }
    };

    const handleCreditedEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ invoiceId: string; creditNote: CreditNoteDetail }>;
      if (customEvent.detail) {
        const { invoiceId, creditNote } = customEvent.detail;
        setInvoices((prev) =>
          prev.map((item) => {
            if (item.id === invoiceId) {
              const existing = item.creditNotes || [];
              const updatedCns = existing.some((c) => c.credit_note_number === creditNote.credit_note_number)
                ? existing
                : [...existing, creditNote];
              const totalCredited = updatedCns.reduce((a, b) => a + Number(b.amount || 0), 0);
              return {
                ...item,
                status: totalCredited >= item.amount ? ("credited" as const) : item.status,
                creditNoteNumber: creditNote.credit_note_number,
                creditedAmount: totalCredited,
                creditNotes: updatedCns,
              };
            }
            return item;
          })
        );
        setSettledToast({
          number: creditNote.credit_note_number,
          amount: Number(creditNote.amount || 0),
          isCreditNote: true,
        });
      }
    };

    window.addEventListener("moukawil_scenario_change", handleScenarioChange);
    window.addEventListener("moukawil_fy_change", handleFyChange);
    window.addEventListener("moukawil_invoice_paid", handlePaidEvent);
    window.addEventListener("moukawil_invoice_credited", handleCreditedEvent);

    return () => {
      window.removeEventListener("moukawil_scenario_change", handleScenarioChange);
      window.removeEventListener("moukawil_fy_change", handleFyChange);
      window.removeEventListener("moukawil_invoice_paid", handlePaidEvent);
      window.removeEventListener("moukawil_invoice_credited", handleCreditedEvent);
    };
  }, []);

  // Filter or synthesize invoices based on selected fiscal year
  const activeInvoices = useMemo(() => {
    if (fiscalYear === "2025") {
      return [
        {
          id: "inv_2025_1",
          userId: user.id,
          clientId: "cli_1",
          number: "FAC-2025-001",
          issueDate: "2025-11-10",
          dueDate: "2025-12-05",
          amount: 1100000,
          status: "paid" as const,
          statutoryClause: "TVA non applicable - Art. 13 LFR 2023",
          paidAt: "2025-12-05",
          paymentRail: "bank_transfer",
          client: {
            id: "cli_1",
            userId: user.id,
            name: "Sonatrach Digital SPA",
            type: "B2B" as const,
            nif: "000216001234567",
            nis: "000216010123456",
            rc: "16/00-1234567B20",
            address: "Hydra, Alger",
            location: "Hydra, Alger",
            description: null,
            email: "achats@sonatrach-digital.dz",
            phone: "021000001",
            anaeVerified: true,
          },
        },
        {
          id: "inv_2025_2",
          userId: user.id,
          clientId: "cli_2",
          number: "FAC-2025-002",
          issueDate: "2025-12-01",
          dueDate: "2025-12-20",
          amount: 750000,
          status: "paid" as const,
          statutoryClause: "TVA non applicable - Art. 13 LFR 2023",
          paidAt: "2025-12-20",
          paymentRail: "cheque",
          client: {
            id: "cli_2",
            userId: user.id,
            name: "Yacine Mansouri",
            type: "B2C" as const,
            nif: null,
            nis: null,
            rc: null,
            address: "Oran",
            location: "Oran",
            description: null,
            email: "yacine@example.dz",
            phone: "0550000003",
            anaeVerified: false,
          },
        },
      ];
    } else if (fiscalYear === "2024") {
      return [
        {
          id: "inv_2024_1",
          userId: user.id,
          clientId: "cli_1",
          number: "FAC-2024-001",
          issueDate: "2024-09-10",
          dueDate: "2024-10-10",
          amount: 950000,
          status: "paid" as const,
          statutoryClause: "TVA non applicable - Art. 13 LFR 2023",
          paidAt: "2024-10-05",
          paymentRail: "bank_transfer",
          client: {
            id: "cli_1",
            userId: user.id,
            name: "Sonatrach Digital SPA",
            type: "B2B" as const,
            nif: "000216001234567",
            nis: "000216010123456",
            rc: "16/00-1234567B20",
            address: "Hydra, Alger",
            location: "Hydra, Alger",
            description: null,
            email: "achats@sonatrach-digital.dz",
            phone: "021000001",
            anaeVerified: true,
          },
        },
      ];
    }
    return invoices.filter((inv) => !inv.issueDate || inv.issueDate.startsWith(fiscalYear));
  }, [invoices, fiscalYear, user.id]);

  const stats = useMemo(() => computeStats(user, activeInvoices), [user, activeInvoices]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return activeInvoices.filter((invoice) => {
      const isCredited =
        invoice.status === "credited" ||
        Boolean(invoice.creditNoteNumber || (invoice.creditNotes && invoice.creditNotes.length > 0));

      const matchesStatus =
        status === "all" ||
        (status === "credited" ? isCredited : invoice.status === status);

      const matchesClient =
        clientType === "all" || invoice.client.type === clientType;

      const matchesQuery =
        !needle ||
        invoice.client.name.toLowerCase().includes(needle) ||
        invoice.number.toLowerCase().includes(needle) ||
        (invoice.creditNoteNumber && invoice.creditNoteNumber.toLowerCase().includes(needle));

      return matchesStatus && matchesClient && matchesQuery;
    });
  }, [activeInvoices, status, clientType, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const [settledToast, setSettledToast] = useState<{
    number: string;
    amount: number;
    isCreditNote?: boolean;
  } | null>(null);
  const payingInvoice = activeInvoices.find((invoice) => invoice.id === payingId) ?? null;

  const confirmPayment = ({ invoiceId, settlementDate, rail }: PaymentConfirmation) => {
    payInvoiceApi(invoiceId, settlementDate, rail).catch(console.error);
    const target = activeInvoices.find((inv) => inv.id === invoiceId);
    setInvoices((current) =>
      current.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status: "paid", paidAt: settlementDate, paymentRail: rail } : invoice)),
    );
    if (target) {
      setSettledToast({ number: target.number, amount: target.amount, isCreditNote: false });
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
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{t("Fiscal Ledger")}</span>
            <span className="size-1.5 rounded-full bg-hairline" />
            <span className="font-num text-xs text-teal">{t("Decree 23-197 Compliant")}</span>
          </div>
          <h1 className="text-2xl sm:text-[32px] font-semibold leading-tight sm:leading-10 tracking-[-0.025em] text-ink">{t("Invoices & Revenue")}</h1>
          <p className="max-w-2xl text-xs sm:text-sm text-body">
            {t("Manage commercial invoices, record client payments, issue credit notes, and track statutory cash-basis turnover under Law 22-23.")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => downloadLedgerCsv(filtered)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200/80 bg-surface-low hover:bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-xs transition-all hover:border-slate-300 active:scale-[0.98]"
          >
            <Download className="size-3.5 text-accent" />
            {t("Export Ledger (CSV)")}
          </button>
          <Link
            href="/invoices/new"
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-ink px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="size-3.5" />
            {t("New Invoice")}
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

      <section className="overflow-hidden rounded-lg bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <LedgerTable invoices={visible} activeId={payingId} onMarkPaid={setPayingId} onDeleteDraft={deleteDraft} />
        <div className="flex items-center justify-between bg-surface-low px-3 py-2 text-xs tracking-[0.02em]">
          <p className="flex items-center gap-2 font-medium text-body">
            {t("Showing {length} of {length2} commercial records", { length: visible.length, length2: filtered.length })}
            <span className="size-1 rounded-full bg-hairline" />
            <span className="font-num font-normal">{t("Legal Turnover Archive: FY 2026")}</span>
          </p>
          <div className="flex items-center gap-1 font-medium">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="rounded-sm bg-card px-2.5 py-1 text-body disabled:opacity-50"
            >
              {t("Previous")}
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
              className="rounded-sm bg-card px-2.5 py-1 text-ink disabled:opacity-50"
            >
              {t("Next")}
            </button>
          </div>
        </div>
      </section>

      {payingInvoice && <PaymentModal invoice={payingInvoice} stats={stats} onClose={() => setPayingId(null)} onConfirm={confirmPayment} />}
      {settledToast && (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-card p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
          <span
            className={`flex size-8 items-center justify-center rounded-full ${
              settledToast.isCreditNote ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {settledToast.isCreditNote ? (
              <RotateCcw className="size-4" strokeWidth={2.5} />
            ) : (
              <Check className="size-4" strokeWidth={2.5} />
            )}
          </span>
          <div>
            <p className="text-xs font-bold text-ink">
              {settledToast.isCreditNote
                ? t("Credit Note Issued: {number}", { number: settledToast.number })
                : t("Payment Recorded for {number}", { number: settledToast.number })}
            </p>
            <p className="text-[11px] text-body">
              <strong className="font-num text-ink">{t("{v1} DZD", { v1: formatAmount(settledToast.amount) })}</strong>{" "}
              {settledToast.isCreditNote
                ? t("officially deducted from FY 2026 cash-basis legal turnover.")
                : t("cleared & realized under FY 2026 cash-basis turnover.")}
            </p>
          </div>
          <button
            onClick={() => setSettledToast(null)}
            className="ms-2 rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
