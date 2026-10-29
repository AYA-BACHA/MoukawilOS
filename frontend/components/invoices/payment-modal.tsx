"use client";

import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  FileCheck,
  Landmark,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";

import type { InvoiceWithClient, PaymentConfirmation, TurnoverStats } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";
import { ActionFeedbackBanner, MoukawilSpinner, ShimmerProgressBar } from "@/components/ui/action-loading";

interface RailOption {
  value: string;
  label: string;
  sublabel: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const RAIL_OPTIONS: RailOption[] = [
  {
    value: "bank_transfer",
    label: "Bank Transfer (BNA / CPA / BEA)",
    sublabel: "Banques commerciales algériennes (BNA, CPA, BEA...)",
    badge: "Interbancaire",
    icon: Landmark,
  },
  {
    value: "ccp",
    label: "CCP Transfer (Algérie Poste)",
    sublabel: "Virement postal compte à compte / RIP",
    badge: "Algérie Poste",
    icon: Mail,
  },
  {
    value: "cheque",
    label: "Cheque (Bank / Certified)",
    sublabel: "Chèque bancaire ou chèque certifié",
    badge: "Compensé",
    icon: FileCheck,
  },
  {
    value: "card",
    label: "EDAHABIA / CIB Card",
    sublabel: "Paiement électronique GIE Monétique",
    badge: "CIB / Edahabia",
    icon: CreditCard,
  },
  {
    value: "cash",
    label: "Cash (Espèces)",
    sublabel: "Règlement en liquide sous le seuil légal",
    badge: "Seuil légal",
    icon: Banknote,
  },
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
  const [railDropdownOpen, setRailDropdownOpen] = useState(false);
  const railDropdownRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (railDropdownRef.current && !railDropdownRef.current.contains(event.target as Node)) {
        setRailDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setRailDropdownOpen(false);
    }
    if (railDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [railDropdownOpen]);

  const selectedRail = RAIL_OPTIONS.find((opt) => opt.value === rail) ?? RAIL_OPTIONS[0];
  const SelectedRailIcon = selectedRail.icon;

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
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
      >
        <ShimmerProgressBar active={status === "loading"} />

        <div className="flex shrink-0 items-start gap-3 bg-surface-low p-4 border-b border-slate-100">
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

        <div className="flex flex-1 min-h-0 flex-col gap-3.5 p-4 overflow-y-auto">
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

            <div className="flex flex-col gap-1 relative" ref={railDropdownRef}>
              <span className={labelClass}>{t("Settlement Rail")}</span>
              <button
                type="button"
                disabled={status === "loading"}
                onClick={() => setRailDropdownOpen(!railDropdownOpen)}
                className={cn(
                  "flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-50/80 px-3 text-start transition-all hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60",
                  railDropdownOpen && "border-primary ring-2 ring-primary/20 bg-card shadow-sm"
                )}
                aria-haspopup="listbox"
                aria-expanded={railDropdownOpen}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-7 place-items-center rounded-lg bg-mint text-accent shrink-0">
                    <SelectedRailIcon className="size-4" />
                  </span>
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs sm:text-sm font-semibold text-ink truncate">
                      {t(selectedRail.label)}
                    </span>
                    <span className="hidden sm:inline-flex rounded bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-mint-ink shrink-0">
                      {t(selectedRail.badge)}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-body transition-transform duration-200 shrink-0 ms-2",
                    railDropdownOpen && "rotate-180 text-accent"
                  )}
                />
              </button>

              {railDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute start-0 end-0 bottom-full mb-1.5 z-50 flex flex-col gap-1 rounded-2xl border border-slate-200 bg-card p-1.5 shadow-2xl shadow-teal-950/20 backdrop-blur-md animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto"
                >
                  {RAIL_OPTIONS.map((option) => {
                    const isSelected = option.value === rail;
                    const OptionIcon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setRail(option.value);
                          setRailDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-start transition-all",
                          isSelected
                            ? "bg-mint/40 border border-primary/20 shadow-2xs"
                            : "hover:bg-slate-50 border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              "grid size-7 place-items-center rounded-lg shrink-0 transition-colors",
                              isSelected ? "bg-mint text-accent" : "bg-slate-100 text-body"
                            )}
                          >
                            <OptionIcon className="size-3.5" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span
                              className={cn(
                                "text-xs font-medium tracking-tight truncate",
                                isSelected ? "font-semibold text-primary-ink" : "text-ink"
                              )}
                            >
                              {t(option.label)}
                            </span>
                            <span className="text-[10px] text-muted truncate">
                              {t(option.sublabel)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                              isSelected
                                ? "bg-primary/10 text-primary-ink"
                                : "bg-slate-100 text-body"
                            )}
                          >
                            {t(option.badge)}
                          </span>
                          {isSelected && <Check className="size-3.5 text-accent shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 bg-surface-low/80 p-3.5 sm:p-4 border-t border-slate-100">
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
