"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, RotateCcw, ShieldCheck, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { issueCreditNoteApi } from "@/lib/api";
import type { CreditNoteDetail, InvoiceWithClient } from "@/types/models";

interface CreditNoteModalProps {
  invoice: InvoiceWithClient;
  onClose: () => void;
  onSuccess: (creditNote: CreditNoteDetail) => void;
}

const REASON_PRESETS: Record<string, string[]> = {
  en: [
    "Post-delivery commercial discount or volume rebate",
    "Partial credit for adjusted service deliverable",
    "Billing clerical error on initial invoice amount",
    "Mutual agreement cancellation of contracted service",
  ],
  fr: [
    "Remise commerciale exceptionnelle accordée a posteriori",
    "Avoir partiel pour ajustement de prestation livrée",
    "Erreur matérielle de facturation sur le montant initial",
    "Annulation d'un commun accord de la prestation contractuelle",
  ],
  ar: [
    "خصم تجاري استثنائي ممنوح لاحقاً",
    "فاتورة تسوية جزئية لتعديل الخدمة المقدمة",
    "خطأ مادي في مبلغ الفاتورة الأصلية",
    "إلغاء الخدمة التعاقدية بالتراضي",
  ],
};

export function CreditNoteModal({ invoice, onClose, onSuccess }: CreditNoteModalProps) {
  const { t, formatAmount, lang } = useI18n();
  const currentPresets = REASON_PRESETS[lang] || REASON_PRESETS.en;

  const totalAmount = invoice.amount;
  const alreadyCredited = invoice.creditedAmount || 0;
  const maxCreditAllowed = Math.max(0, totalAmount - alreadyCredited);

  const [creditAmount, setCreditAmount] = useState<number>(maxCreditAllowed);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isFullRefund = creditAmount >= maxCreditAllowed;
  const isValidAmount = creditAmount > 0 && creditAmount <= maxCreditAllowed;
  const isValidReason = reason.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) {
      setError(t("Credit amount must be greater than 0 and cannot exceed the remaining balance ({max} DZD).", {
        max: formatAmount(maxCreditAllowed),
      }));
      return;
    }
    if (!isValidReason) {
      setError(t("Statutory reason must contain at least 10 characters for audit compliance."));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await issueCreditNoteApi(invoice.id, {
        reason: reason.trim(),
        credit_amount: creditAmount,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        setError(res.error || t("Failed to issue credit note. Please verify the amount and retry."));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("Network error during credit note creation.");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-note-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[94dvh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-card p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                <RotateCcw className="size-3" />
                {t("Facture d'Avoir")}
              </span>
              <span className="font-num text-xs font-semibold text-muted">
                {t("Ref: #{num}", { num: invoice.number })}
              </span>
            </div>
            <h2 id="credit-note-modal-title" className="text-lg font-bold text-ink">
              {t("Issue Credit Note (Avoir)")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close")}
            className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink active:scale-95"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Invoice Summary Card */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-surface-low p-3.5 text-xs text-body">
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-muted">{t("Client:")}</span>
            <span className="font-bold text-ink">{invoice.client.name}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-muted">{t("Original Invoice Total:")}</span>
            <span className="font-num font-semibold text-ink">{formatAmount(totalAmount)} DZD</span>
          </div>
          {alreadyCredited > 0 && (
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-amber-700 dark:text-amber-400 font-medium">{t("Previously Credited:")}</span>
              <span className="font-num font-semibold text-amber-700 dark:text-amber-400">-{formatAmount(alreadyCredited)} DZD</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1 pt-1.5 font-bold">
            <span className="text-ink">{t("Max Eligible Credit Balance:")}</span>
            <span className="font-num text-accent">{formatAmount(maxCreditAllowed)} DZD</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input & Presets */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="credit-amount-input" className="text-xs font-semibold text-ink">
                {t("Credit Amount (DZD):")}
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCreditAmount(maxCreditAllowed)}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    isFullRefund
                      ? "bg-primary text-white"
                      : "bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {t("Full (100%)")}
                </button>
                <button
                  type="button"
                  onClick={() => setCreditAmount(Math.round(maxCreditAllowed * 0.5))}
                  className="rounded bg-surface px-2 py-0.5 text-[11px] font-medium text-muted hover:text-ink"
                >
                  {t("50%")}
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                id="credit-amount-input"
                type="number"
                step="any"
                min="1"
                max={maxCreditAllowed}
                value={creditAmount || ""}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                placeholder={t("e.g. 50000")}
                required
                className="h-10 w-full rounded-lg border border-slate-200/80 bg-surface-low px-3 pe-12 font-num text-sm text-ink placeholder:text-muted transition-all focus:border-primary/40 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                DZD
              </span>
            </div>
          </div>

          {/* Reason Input & Presets */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="credit-reason-input" className="text-xs font-semibold text-ink">
              {t("Mandatory Statutory Reason (Motif légal):")}
            </label>
            <textarea
              id="credit-reason-input"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("State the business or accounting reason for this credit note (min 10 characters)...")}
              required
              className="w-full rounded-lg border border-slate-200/80 bg-surface-low p-2.5 text-xs text-ink placeholder:text-muted transition-all focus:border-primary/40 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>{t("Minimum 10 characters required")}</span>
              <span className={reason.trim().length >= 10 ? "text-emerald-600 font-medium" : "text-amber-600"}>
                {reason.trim().length}/10
              </span>
            </div>

            {/* Quick Reason Suggestions */}
            <div className="flex flex-wrap gap-1 pt-1">
              {currentPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="rounded-md border border-slate-200/70 bg-surface px-2 py-1 text-[10px] text-muted hover:border-slate-300 hover:text-ink active:scale-95 transition-all text-start"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Statutory Compliance Notice */}
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3 text-[11px] text-slate-700 dark:text-slate-300">
            <ShieldCheck className="size-4 shrink-0 text-accent mt-0.5" />
            <p className="leading-relaxed">
              {t(
                "In compliance with CIDTA Art. 282 and Executive Decree 05-468 Art. 11, this action generates an official, sequential credit note (AV-YYYY-NNN). It legally deducts the credited sum from your cash-basis annual turnover."
              )}
            </p>
          </div>

          {/* Modal Actions */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-surface-low px-4 py-2 text-xs font-semibold text-ink shadow-2xs hover:bg-surface active:scale-95 transition-all"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValidAmount || !isValidReason}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{t("Issuing Avoir...")}</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>{t("Issue Credit Note")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

