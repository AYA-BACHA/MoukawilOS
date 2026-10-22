"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, Banknote, Calculator, CheckCircle, Info, ShieldCheck, X } from "lucide-react";
import { Pill } from "@/components/ui/pill";

import type { TurnoverStats } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const milestones = [
  { label: "0 DZD", ratio: 0 },
  { label: "25% (1.25M)", ratio: 0.25 },
  { label: "50% (2.50M)", ratio: 0.5 },
  { label: "75% (3.75M)", ratio: 0.75 },
];

export function CeilingCard({ stats }: { stats: TurnoverStats }) {
  const { t, tx, formatAmount } = useI18n();
  const [showDetails, setShowDetails] = useState(false);
  const { utilization, remaining, ceiling, collected, pending } = stats;
  const percent = Math.round(utilization * 100);

  // Algerian Law 22-23 statutory tax rules
  const rawIfu = collected * 0.005;
  const ifuTax = Math.max(10000, rawIfu);
  const casnos = 24000;
  const totalStateObligations = ifuTax + casnos;

  return (
    <>
      <section id="tour-ceiling-card" className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-card p-4 sm:p-7 shadow-xs transition-all">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">{t("Collected Turnover")}</h2>
              <Pill className="bg-mint/50 px-2.5 py-1 text-teal">
                <Banknote className="size-3 shrink-0" />
                <span className="truncate">{t("Cash-Basis Accounting (Law 22-23)")}</span>
              </Pill>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 shadow-2xs">
                <Calculator className="size-3 text-emerald-600 shrink-0" />
                <span>{t("Tax Payable (IFU):")} <strong className="font-num font-bold text-emerald-950">{formatAmount(ifuTax)} DZD</strong></span>
              </Pill>
              <Pill className="border border-slate-200/80 bg-surface-low px-2.5 py-1 text-body">
                {t("Statutory Cap:")} <span className="font-num text-sm font-bold text-ink">{t("{v1} DZD", { v1: formatAmount(ceiling) })}</span>
              </Pill>
            </div>
          </div>

          <div className="relative flex flex-wrap items-start justify-between gap-2">
            <p className="flex items-baseline gap-2 pt-1">
              <span className="font-num text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                {formatAmount(collected)}
              </span>
              <span className="font-num text-lg sm:text-xl font-medium text-muted">{t("DZD")}</span>
            </p>
            <Pill className="bg-surface-low px-3 py-1.5 font-normal text-body border border-slate-200/60 text-xs">
              <BadgeCheck className="size-3.5 text-teal shrink-0" />
              <span className="truncate">{t("Calculated from your recorded payments")}</span>
            </Pill>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <div className="relative h-3.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-teal to-primary transition-all duration-500"
                style={{ width: `${Math.min(100, utilization * 100)}%` }}
              />
              <div className="absolute inset-y-0 start-1/4 w-px bg-card/70" />
              <div className="absolute inset-y-0 start-2/4 w-px bg-card/70" />
              <div className="absolute inset-y-0 start-3/4 w-px bg-card/70" />
            </div>
            {/* Desktop Milestones */}
            <div className="hidden sm:flex justify-between px-1 pt-1 font-num text-xs">
              {milestones.map(({ label, ratio }) => (
                <span key={label} className={ratio === 0.5 ? "font-semibold text-body" : "text-muted"}>
                  {t(label)}
                </span>
              ))}
              <span className="font-bold text-primary-ink">{t("100% ({v1} DZD Ceiling)", { v1: formatAmount(ceiling) })}</span>
            </div>
            {/* Mobile Milestones */}
            <div className="flex sm:hidden justify-between px-1 pt-1 font-num text-[11px]">
              <span className="text-muted">0 DZD</span>
              <span className="font-semibold text-body">50% (2.5M)</span>
              <span className="font-bold text-primary-ink">100% (5M DZD)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {percent >= 90 ? (
                <Pill
                  dot="size-2 bg-amber-500 animate-pulse"
                  className="bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-300 shadow-xs"
                >
                  {t("{percent}% utilized • WARNING: Approaching Cap", { percent })}
                </Pill>
              ) : percent >= 80 ? (
                <Pill
                  dot="size-2 bg-amber-400"
                  className="bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200 shadow-xs"
                >
                  {t("{percent}% utilized • 80% Threshold Reached", { percent })}
                </Pill>
              ) : (
                <Pill
                  dot="size-2 bg-primary"
                  className="bg-mint px-3 py-1.5 text-xs font-bold text-accent shadow-xs ring-1 ring-emerald-600/10"
                >
                  {t("{percent}% utilized • Safe & In Compliance", { percent })}
                </Pill>
              )}
              <p className="text-xs text-body">
                <span className="font-num font-bold text-ink">{t("{v1} DZD", { v1: formatAmount(remaining) })}</span> {t("remaining under your 5M DZD statutory limit")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200/80 bg-surface-low px-3 py-2 text-xs font-semibold text-accent transition-all duration-150 hover:border-slate-300 hover:bg-surface active:scale-95 shadow-2xs hover:shadow-xs"
            >
              {t("View calculation details")}
              <ArrowRight className="rtl:-scale-x-100 size-3" />
            </button>
          </div>

          {percent >= 80 && (
            <div className="mt-1 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-amber-900 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="size-4.5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="font-bold text-amber-950">{t("Statutory Ceiling Sentinel (Law 22-23, Art. 13):")}</strong>{" "}
                {t("You have utilized {percent}% of your annual ceiling. Under Executive Decree 23-197, exceeding 5,000,000 DZD for 3 consecutive fiscal years requires mandatory radiation or transition to the standard commercial register (CNRC).", { percent })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Calculation Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-card p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-mint px-1.5 py-0.5 text-[10px] font-bold text-mint-ink">
                  {t("Statutory Audit Breakdown")}
                </span>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-ink">{t("Turnover Calculation Details")}</h3>
                <p className="text-xs text-muted">{t("Algerian Law 22-23 (December 18, 2022)")}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                aria-label={t("Close Details")}
                className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink active:scale-95"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-1 flex-col gap-3 text-xs overflow-y-auto pe-1">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-body font-medium">{t("Statutory Annual Ceiling:")}</span>
                <span className="font-num text-sm font-bold text-ink">{t("{v1} DZD", { v1: formatAmount(ceiling) })}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-50/60 p-3">
                <div>
                  <p className="text-body font-medium">{t("Collected Cash Receipts:")}</p>
                  <p className="text-[10px] text-muted">{t("Official settlements (Cash-basis)")}</p>
                </div>
                <span className="font-num text-sm font-bold text-emerald-800">{t("{v1} DZD ({percent}%)", { v1: formatAmount(collected), percent })}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-50/60 p-3">
                <div>
                  <p className="text-body font-medium">{t("Pending Uncollected Invoices:")}</p>
                  <p className="text-[10px] text-muted">{t("Excluded from ceiling until clearance")}</p>
                </div>
                <span className="font-num text-sm font-bold text-amber-800">{t("{v1} DZD", { v1: formatAmount(pending) })}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-low p-3">
                <span className="text-body font-medium">{t("Available Headroom:")}</span>
                <span className="font-num text-sm font-bold text-accent">{t("{v1} DZD ({v2}%)", { v1: formatAmount(remaining), v2: 100 - percent })}</span>
              </div>

              {/* Fiscal & Social Breakdown */}
              <div className="flex items-center justify-between rounded-lg bg-emerald-100/60 p-3">
                <div>
                  <p className="text-body font-medium">{t("Estimated Single Tax (IFU 0.5%):")}</p>
                  <p className="text-[10px] text-muted">
                    {rawIfu < 10000 && collected > 0
                      ? t("Statutory floor applied (10,000 DZD min.)")
                      : t("Flat 0.5% tax rate under Law 22-23")}
                  </p>
                </div>
                <span className="font-num text-sm font-bold text-emerald-900">{t("{v1} DZD", { v1: formatAmount(ifuTax) })}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-teal/10 p-3">
                <div>
                  <p className="text-body font-medium">{t("CASNOS Social Contribution:")}</p>
                  <p className="text-[10px] text-muted">{t("Mandatory annual healthcare & retirement")}</p>
                </div>
                <span className="font-num text-sm font-bold text-teal">{t("{v1} DZD", { v1: formatAmount(casnos) })}</span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="flex items-center gap-1.5 text-ink font-semibold">
                  <Info className="size-3.5 text-accent" />
                  {t("Legal Recognition Principle")}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-body">
                  {tx("Under Article 13 of Law 22-23 and Executive Decree 23-197, an auto-entrepreneur's turnover is strictly evaluated on a {basis}. Commercial invoices issued but not yet settled by the client do not consume your 5,000,000 DZD threshold.", { basis: <strong>{t("cash-basis (encaissement)")}</strong> })}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-ink active:scale-95"
              >
                {t("Close Details")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
