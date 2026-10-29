"use client";

import { useState } from "react";
import { BadgeCheck, CalendarDays, ChevronDown, Landmark, ShieldCheck, X } from "lucide-react";

import type { InvoiceWithClient, PaymentConfirmation, TurnoverStats } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";
import { ActionFeedbackBanner, MoukawilSpinner, ShimmerProgressBar } from "@/components/ui/action-loading";

const RAIL_OPTIONS = [
  { value: "bank_transfer", label: "Bank Transfer (BNA / CPA / CCP)" },
  { value: "cheque", label: "Cheque" },
  { value: "cash", label: "Cash (Espèces)" },
  { value: "ccp", label: "CCP Transfer" },
  { value: "card", label: "EDAHABIA / CIB Card" },
];

const fieldClass =
  "relative flex h-10 items-center rounded-xl border border-slate-300 bg-slate-50/70 hover:border-slate-400 focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all";
const labelClass = "text-xs font-semibold text-ink";

interface PaymentModalProps {
  invoice: InvoiceWithClient;
  stats: TurnoverStats;
  onClose: () => void;
  onConfirm: (confirmation: PaymentConfirmation) => Promise<{ success: boolean; error?: string } | void> | void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function PaymentModal({ invoice, stats, onClose, onConfirm }: PaymentModalProps) {
  const { t, tx, formatAmount } = useI18n();
  const [settlementDate, setSettlementDate] = useState(today);
  const [rail, setRail] = useState(RAIL_OPTIONS[0].value);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { collected, ceiling } = stats;
  const after = collected + invoice.amount;
  const percent = (value: number) => Math.round((value / ceiling) * 100);

  const handleConfirm = async () => {
    if (status === "loading" || status === "success") return;
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await onConfirm({ invoiceId: invoice.id, settlementDate, rail });
      if (res && !res.success) {
        setStatus("error");
        setErrorMessage(res.error || t("Impossible d'enregistrer le règlement."));
        return;
      }
      setStatus("success");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: unknown) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : t("Erreur réseau lors de l'enregistrement du règlement.");
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in" onClick={status === "loading" ? undefined : onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
      >
        <ShimmerProgressBar active={status === "loading"} />

        <div className="flex items-start gap-3 bg-surface-low p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-mint text-accent shrink-0">
            <BadgeCheck className="size-[22px]" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 id="payment-modal-title" className="text-base sm:text-lg font-semibold leading-7 tracking-[-0.025em] text-ink truncate">
                {t("Confirm Payment Receipt")}
              </h2>
              <button
                type="button"
                aria-label={t("Close")}
                disabled={status === "loading"}
                onClick={onClose}
                className="flex size-11 items-center justify-center rounded-lg text-body hover:bg-slate-100 active:scale-95 disabled:opacity-40"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="pt-0.5 text-xs font-medium tracking-[0.02em] text-body">{t("Statutory Law 22-23 Cash-Basis Realization")}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
          <ActionFeedbackBanner
            status={status}
            loadingText={t("Validation statutaire du règlement...")}
            successText={t("Paiement enregistré et certifié (Loi 22-23)")}
            errorText={errorMessage}
          />

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
              <span className="text-ink truncate max-w-[200px]">
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
                  disabled={status === "loading"}
                  onChange={(event) => setSettlementDate(event.target.value)}
                  className="h-full w-full bg-transparent ps-9 pe-3 text-base sm:text-sm font-medium text-ink outline-none disabled:opacity-60"
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
                  disabled={status === "loading"}
                  onChange={(event) => setRail(event.target.value)}
                  className="h-full w-full appearance-none bg-transparent ps-9 pe-8 text-base sm:text-sm font-medium text-ink outline-none disabled:opacity-60"
                >
                  {RAIL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{t(option.label)}</option>
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
            disabled={status === "loading"}
            onClick={onClose}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-card px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            disabled={status === "loading" || status === "success"}
            onClick={handleConfirm}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-ink active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <MoukawilSpinner size="sm" className="text-white" />
                <span>{t("Recording Payment...")}</span>
              </>
            ) : status === "success" ? (
              <>
                <BadgeCheck className="size-4" />
                <span>{t("Payment Recorded!")}</span>
              </>
            ) : (
              <>
                <BadgeCheck className="size-4" />
                <span>{t("Confirm & Record Payment")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
