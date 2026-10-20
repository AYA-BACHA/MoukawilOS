"use client";

import { useState } from "react";
import { BadgeCheck, CalendarDays, ChevronDown, Landmark, ShieldCheck, X } from "lucide-react";

import type { InvoiceWithClient, PaymentConfirmation, TurnoverStats } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const rails = ["Bank Transfer (BNA / CPA / CCP)", "Cheque"];

const fieldClass =
  "relative flex h-10 items-center rounded-xl border border-slate-300 bg-slate-50/70 hover:border-slate-400 focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all";
const labelClass = "text-xs font-semibold text-ink";

interface PaymentModalProps {
  invoice: InvoiceWithClient;
  stats: TurnoverStats;
  onClose: () => void;
  onConfirm: (confirmation: PaymentConfirmation) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function PaymentModal({ invoice, stats, onClose, onConfirm }: PaymentModalProps) {
  const { t, tx, formatAmount } = useI18n();
  const [settlementDate, setSettlementDate] = useState(today);
  const [rail, setRail] = useState(rails[0]);

  const { collected, ceiling } = stats;
  const after = collected + invoice.amount;
  const percent = (value: number) => Math.round((value / ceiling) * 100);

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-xs" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-3 bg-surface-low p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-mint text-accent">
            <BadgeCheck className="size-[22px]" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 id="payment-modal-title" className="text-xl font-semibold leading-7 tracking-[-0.025em] text-ink">
                {t("Confirm Payment Receipt")}
              </h2>
              <button aria-label={t("Close")} onClick={onClose} className="rounded p-1 text-body">
                <X className="size-3.5" />
              </button>
            </div>
            <p className="pt-0.5 text-xs font-medium tracking-[0.02em] text-body">{t("Statutory Law 22-23 Cash-Basis Realization")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1 rounded bg-surface-low p-3 text-xs font-medium tracking-[0.02em] text-body">
            <p className="flex items-baseline justify-between">
              {t("Incoming Amount:")}
              <span className="font-num text-xl font-bold leading-7 tracking-[-0.01em] text-primary-ink">{t("{v1} DZD", { v1: formatAmount(invoice.amount) })}</span>
            </p>
            <p className="flex items-center justify-between">
              {t("Invoice Reference:")}
              <span className="font-num font-bold text-ink">{invoice.number}</span>
            </p>
            <p className="flex items-center justify-between">
              {t("Debtor:")}
              <span className="text-ink">
                {invoice.client.name} ({invoice.client.type})
              </span>
            </p>
            <div className="mt-2 flex flex-col gap-1 rounded bg-card/70 p-2 font-normal tracking-[0.01em]">
              <p className="flex items-center gap-1 font-semibold tracking-[0.02em] text-ink">
                <ShieldCheck className="size-3.5" />
                {t("Ceiling Realization Impact:")}
              </p>
              <p>
                {tx("Confirming this transaction transitions collected turnover from {from} to {to} of your {ceiling}M DZD annual ceiling.", {
                  from: (
                    <strong className="font-bold text-ink">
                      {t("{v1} DZD ({v2}%)", { v1: formatAmount(collected), v2: percent(collected) })}
                    </strong>
                  ),
                  to: (
                    <span className="text-primary-ink">
                      {t("{v1} DZD ({v2}%)", { v1: formatAmount(after), v2: percent(after) })}
                    </span>
                  ),
                  ceiling: ceiling / 1_000_000,
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className={labelClass}>{t("Payment Settlement Date")}</span>
              <span className={fieldClass}>
                <CalendarDays className="pointer-events-none absolute start-3 size-[14px] text-body" />
                <input
                  type="date"
                  value={settlementDate}
                  max={today()}
                  onChange={(event) => setSettlementDate(event.target.value)}
                  className="h-full w-full bg-transparent ps-9 pe-3 text-sm font-medium text-ink outline-none"
                />
              </span>
              <span className="text-xs tracking-[0.01em] text-muted">{t("Date bank transfer or CCP check was credited.")}</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>{t("Settlement Rail")}</span>
              <span className={fieldClass}>
                <Landmark className="pointer-events-none absolute start-3 size-[15px] text-body" />
                <select
                  value={rail}
                  onChange={(event) => setRail(event.target.value)}
                  className="h-full w-full appearance-none bg-transparent ps-9 pe-8 text-sm font-medium text-ink outline-none"
                >
                  {rails.map((option) => (
                    <option key={option} value={option}>{t(option)}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 size-3 text-body" />
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 bg-surface-low/80 p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-card px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95"
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ invoiceId: invoice.id, settlementDate, rail })}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-ink active:scale-95"
          >
            <BadgeCheck className="size-4" />
            {t("Confirm & Record Payment")}
          </button>
        </div>
      </div>
    </div>
  );
}
