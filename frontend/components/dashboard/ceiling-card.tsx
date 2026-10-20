"use client";

import { useState } from "react";
import { ArrowRight, BadgeCheck, Banknote, CheckCircle, Info, X } from "lucide-react";
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

  return (
    <>
      <section id="tour-ceiling-card" className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-card p-7 shadow-xs transition-all">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">{t("Collected Turnover")}</h2>
              <Pill className="bg-mint/50 px-2.5 py-1 text-teal">
                <Banknote className="size-3" />
                {t("Cash-Basis Accounting (Law 22-23)")}
              </Pill>
            </div>
            <Pill className="border border-slate-200/80 bg-surface-low px-2.5 py-1 text-body">
              {t("Statutory Cap:")} <span className="font-num text-sm font-bold text-ink">{t("{v1} DZD", { v1: formatAmount(ceiling) })}</span>
            </Pill>
          </div>

          <div className="relative flex flex-wrap items-start justify-between gap-2">
            <p className="flex items-baseline gap-2 pt-1">
              <span className="font-num text-3xl font-extrabold tracking-tight text-ink">
                {formatAmount(collected)}
              </span>
              <span className="font-num text-xl font-medium text-muted">{t("DZD")}</span>
            </p>
            <Pill className="bg-surface-low px-3 py-1.5 font-normal text-body border border-slate-200/60">
              <BadgeCheck className="size-3.5 text-teal" />
              {t("Audited Against Official Treasury Receipts")}
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
            <div className="flex justify-between px-1 pt-1 font-num text-xs">
              {milestones.map(({ label, ratio }) => (
                <span key={label} className={ratio === 0.5 ? "font-semibold text-body" : "text-muted"}>
                  {t(label)}
                </span>
              ))}
              <span className="font-bold text-primary-ink">{t("100% ({v1} DZD Ceiling)", { v1: formatAmount(ceiling) })}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <Pill
                dot="size-2 bg-primary"
                className="bg-mint px-3 py-1.5 text-xs font-bold text-accent shadow-xs ring-1 ring-emerald-600/10"
              >
                {t("{percent}% utilized • Safe & In Compliance", { percent })}
              </Pill>
              <p className="text-xs text-body">
                <span className="font-num font-bold text-ink">{t("{v1} DZD", { v1: formatAmount(remaining) })}</span> {t("remaining under your 5M DZD statutory limit")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-surface-low px-3 py-1.5 text-xs font-semibold text-accent transition-all duration-150 hover:border-slate-300 hover:bg-surface active:scale-95 shadow-2xs hover:shadow-xs"
            >
              {t("View calculation details")}
              <ArrowRight className="rtl:-scale-x-100 size-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Calculation Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-mint px-1.5 py-0.5 text-[10px] font-bold text-mint-ink">
                  {t("Statutory Audit Breakdown")}
                </span>
                <h3 className="mt-1 text-lg font-bold text-ink">{t("Turnover Calculation Details")}</h3>
                <p className="text-xs text-muted">{t("Algerian Law 22-23 (December 18, 2022)")}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-xs">
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

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-ink"
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
