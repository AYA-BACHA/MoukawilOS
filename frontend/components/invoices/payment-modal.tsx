"use client";

import { useState } from "react";
import { BadgeCheck, CalendarDays, ChevronDown, Landmark, ShieldCheck, X } from "lucide-react";
import { formatAmount } from "@/lib/format";
import type { InvoiceWithClient, PaymentConfirmation, TurnoverStats } from "@/types/models";

const rails = ["Bank Transfer (BNA / CPA / CCP)", "Cheque"];

const fieldClass = "relative flex h-10 items-center rounded bg-surface-low shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]";
const labelClass = "text-sm font-semibold text-ink";

interface PaymentModalProps {
  invoice: InvoiceWithClient;
  stats: TurnoverStats;
  onClose: () => void;
  onConfirm: (confirmation: PaymentConfirmation) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function PaymentModal({ invoice, stats, onClose, onConfirm }: PaymentModalProps) {
  const [settlementDate, setSettlementDate] = useState(today);
  const [rail, setRail] = useState(rails[0]);

  const { collected, ceiling } = stats;
  const after = collected + invoice.amount;
  const percent = (value: number) => Math.round((value / ceiling) * 100);

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-ink/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-start gap-3 bg-surface-low p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-mint text-primary">
            <BadgeCheck className="size-[22px]" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 id="payment-modal-title" className="text-xl font-semibold leading-7 tracking-[-0.025em] text-ink">
                Confirm Payment Receipt
              </h2>
              <button aria-label="Close" onClick={onClose} className="rounded p-1 text-body">
                <X className="size-3.5" />
              </button>
            </div>
            <p className="pt-0.5 text-xs font-medium tracking-[0.02em] text-body">Statutory Law 22-23 Cash-Basis Realization</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1 rounded bg-surface-low p-3 text-xs font-medium tracking-[0.02em] text-body">
            <p className="flex items-baseline justify-between">
              Incoming Amount:
              <span className="font-num text-xl font-bold leading-7 tracking-[-0.01em] text-primary-ink">{formatAmount(invoice.amount)} DZD</span>
            </p>
            <p className="flex items-center justify-between">
              Invoice Reference:
              <span className="font-num font-bold text-ink">{invoice.number}</span>
            </p>
            <p className="flex items-center justify-between">
              Debtor:
              <span className="text-ink">
                {invoice.client.name} ({invoice.client.type})
              </span>
            </p>
            <div className="mt-2 flex flex-col gap-1 rounded bg-white/70 p-2 font-normal tracking-[0.01em]">
              <p className="flex items-center gap-1 font-semibold tracking-[0.02em] text-ink">
                <ShieldCheck className="size-3.5" />
                Ceiling Realization Impact:
              </p>
              <p>
                Confirming this transaction transitions collected turnover from{" "}
                <strong className="font-bold text-ink">
                  {formatAmount(collected)} DZD ({percent(collected)}%)
                </strong>{" "}
                to{" "}
                <span className="text-primary-ink">
                  {formatAmount(after)} DZD ({percent(after)}%)
                </span>{" "}
                of your {ceiling / 1_000_000}M DZD annual ceiling.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Payment Settlement Date</span>
              <span className={fieldClass}>
                <CalendarDays className="pointer-events-none absolute left-3 size-[14px] text-body" />
                <input
                  type="date"
                  value={settlementDate}
                  max={today()}
                  onChange={(event) => setSettlementDate(event.target.value)}
                  className="h-full w-full bg-transparent pl-9 pr-3 text-sm font-medium text-ink outline-none"
                />
              </span>
              <span className="text-xs tracking-[0.01em] text-muted">Date bank transfer or CCP check was credited.</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Settlement Rail</span>
              <span className={fieldClass}>
                <Landmark className="pointer-events-none absolute left-3 size-[15px] text-body" />
                <select
                  value={rail}
                  onChange={(event) => setRail(event.target.value)}
                  className="h-full w-full appearance-none bg-transparent pl-9 pr-8 text-sm font-medium text-ink outline-none"
                >
                  {rails.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 size-3 text-body" />
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 bg-surface-low p-4">
          <button onClick={onClose} className="rounded bg-white px-3 py-2 text-sm font-medium text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ invoiceId: invoice.id, settlementDate, rail })}
            className="flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
          >
            <BadgeCheck className="size-[15px]" />
            Confirm & Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}
