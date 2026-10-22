"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, CalendarCheck, ClipboardClock, FileText, Printer, ShieldCheck, X } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { printElementById } from "@/lib/print";

import type { Deadline, TurnoverStats } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const cardClass = "flex flex-1 flex-col justify-between rounded-xl border border-slate-200/80 bg-card p-4 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300";
const labelClass = "text-xs font-bold uppercase tracking-wider text-muted";
const linkClass = "inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200/80 bg-surface-low px-3 py-2 text-xs font-semibold text-accent transition-all duration-150 hover:border-slate-300 hover:bg-surface active:scale-95 shadow-2xs hover:shadow-xs";

export function SecondaryKpis({ deadline, stats }: { deadline: Deadline; stats: TurnoverStats }) {
  const { t, formatAmount, formatLongDate } = useI18n();
  const [showDeclaration, setShowDeclaration] = useState(false);

  // Algerian Law 22-23: Flat 0.5% IFU with statutory minimum floor of 10,000 DZD (CIDTA Art. 282 quater)
  const rawIfu = stats.collected * 0.005;
  const ifuTax = Math.max(10000, rawIfu);
  const isFloorApplied = stats.collected > 0 && rawIfu < 10000;
  const casnosBase = 24000;
  const totalStateObligations = ifuTax + casnosBase;

  const isExtended = "formCode" in deadline;
  const extended = deadline as unknown as { formCode: string; label: string; daysRemaining: number };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Primary Statutory Tax Due Card */}
        <article id="tour-tax-payable" className={cardClass}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={labelClass}>{t("Tax Payable (IFU)")}</h3>
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800 shadow-xs">
                <Calculator className="size-4 text-emerald-700" />
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-num text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  {formatAmount(ifuTax)}
                </span>
                <span className="font-num text-sm font-medium text-muted">{t("DZD")}</span>
                <Pill className="ms-auto border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-num text-[11px] font-bold text-emerald-800">
                  {t("0.5% Flat Rate")}
                </Pill>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-xs text-body leading-relaxed">
                  {isFloorApplied
                    ? t("Statutory floor applied (10,000 DZD min. under CIDTA Art. 282 quater).")
                    : stats.collected === 0
                    ? t("Minimum annual floor of 10,000 DZD due by statutory deadline.")
                    : t("Calculated on {amount} DZD cash turnover. 0% VAT strictly exempt.", {
                        amount: formatAmount(stats.collected),
                      })}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-muted">
                  <span className="rounded bg-surface-low px-1.5 py-0.5 font-medium text-slate-700">
                    {t("CASNOS: 24,000 DZD")}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-teal">
                    {t("Retained: {pct}%", {
                      pct: stats.collected > 0
                        ? ((1 - ifuTax / stats.collected) * 100).toFixed(1)
                        : "99.5",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 mt-3">
            <button
              type="button"
              onClick={() => setShowDeclaration(true)}
              className={linkClass}
            >
              {t("View declaration preview")}
              <ArrowRight className="rtl:-scale-x-100 size-3" />
            </button>
            <Pill className="border border-slate-200/70 bg-surface-low px-2 py-0.5 text-[11px] text-body">
              {t("Law 22-23 Certified")}
            </Pill>
          </div>
        </article>

        {/* Statutory Filing Deadline Card */}
        <article id="tour-statutory-deadline" className={cardClass}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={labelClass}>{t("Next Statutory Deadline")}</h3>
              <span className="grid size-9 place-items-center rounded-xl bg-mint/70 text-accent shadow-xs">
                <CalendarCheck className="size-4" />
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <p className="font-num text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  {formatLongDate(deadline.dueDate)}
                </p>
                {isExtended && (
                  <Pill className="border border-mint bg-mint/60 px-2 py-0.5 font-num text-[11px] font-semibold text-mint-ink">
                    {t("{days} days remaining", { days: extended.daysRemaining })}
                  </Pill>
                )}
              </div>
              <p className="mt-1 text-xs text-body leading-relaxed">
                {isExtended
                  ? `${t(extended.label)} • ${t(deadline.description)}`
                  : t("Annual G12 bis regularisation (0.5% flat IFU tax obligation) • Due January 20, 2027.")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 mt-3">
            <button
              type="button"
              onClick={() => setShowDeclaration(true)}
              className={linkClass}
            >
              {t("Prepare G12 bis filing")}
              <ArrowRight className="rtl:-scale-x-100 size-3" />
            </button>
            <Pill className="border border-slate-200/70 bg-surface-low px-2 py-0.5 font-num text-[11px] text-muted">
              {t("Annual declaration")}
            </Pill>
          </div>
        </article>

        {/* Cash-Basis Inflow Protection Card */}
        <article id="tour-pending-inflow" className={cardClass}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={labelClass}>{t("Pending Inflow")}</h3>
              <span className="grid size-9 place-items-center rounded-xl bg-surface text-accent shadow-xs">
                <ClipboardClock className="size-4" />
              </span>
            </div>
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="font-num text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  {formatAmount(stats.pending)}
                </span>
                <span className="font-num text-sm font-medium text-muted">{t("DZD")}</span>
              </p>
              <div className="mt-2">
                <Pill dot="bg-teal" className="bg-surface-low px-2.5 py-1 text-xs text-body">
                  {t("{pending} invoices awaiting clearance • 0 DZD taxed until money clears", { pending: stats.counts.pending })}
                </Pill>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 mt-3">
            <Link href="/invoices" className={linkClass}>
              {t("Track receivables")}
              <ArrowRight className="rtl:-scale-x-100 size-3" />
            </Link>
            <Pill className="border border-slate-200/70 bg-surface-low px-2 py-0.5 text-[11px] text-body">
              {t("Exempt from ceiling until cashed")}
            </Pill>
          </div>
        </article>
      </div>

      {/* Statutory Form G12 bis Preview Modal */}
      {showDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-card p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-ink">
                  {t("Statutory Tax Template (Specimen)")}
                </span>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-ink">
                  {isExtended && extended.formCode === "G12"
                    ? t("Formulaire G12 (Déclaration provisionnelle)")
                    : t("Formulaire G12 bis (Déclaration définitive & régularisation IFU)")}
                </h3>
                <p className="text-xs text-muted">{t("Modèle indicatif préparé selon les règles DGI • Régime Auto-Entrepreneur")}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeclaration(false)}
                aria-label={t("Close Preview")}
                className="no-print flex size-11 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink active:scale-95"
              >
                <X className="size-5" />
              </button>
            </div>

            <div
              id="declaration-preview-sheet"
              className="mt-4 flex flex-1 flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4 font-mono text-xs overflow-y-auto"
            >
              <div className="border-b border-slate-200 pb-2 text-center font-sans">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{t("RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE")}</p>
                <p className="text-[10px] text-slate-500">{t("MINISTÈRE DES FINANCES — DGI (SPÉCIMEN)")}</p>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">{t("Exercice Fiscal:")}</span>
                <span className="font-bold text-slate-900">2026</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">{t("Date Limite de Dépôt:")}</span>
                <span className="font-bold text-amber-700">{formatLongDate(deadline.dueDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">{t("Chiffre d'Affaires Réalisé (Encaissé):")}</span>
                <span className="font-bold text-slate-900">{t("{v1} DZD", { v1: formatAmount(stats.collected) })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">{t("Taux IFU Forfaitaire (Art. 6):")}</span>
                <span className="font-bold text-emerald-700">0.5 %</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">{t("Minimum Légal Garanti (Art. 282 quater):")}</span>
                <span className="font-bold text-slate-700">10 000 DZD</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">{t("Cotisation CASNOS Annuelle:")}</span>
                <span className="font-bold text-teal">24 000 DZD</span>
              </div>
              <div className="flex justify-between border-t-2 border-slate-300 pt-2 font-bold text-sm">
                <span className="text-slate-900">{t("Impôt Forfaitaire Unique (IFU) Dû:")}</span>
                <span className="text-accent">{t("{v1} DZD", { v1: formatAmount(ifuTax) })}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 font-semibold text-xs">
                <span>{t("Total Charges Fiscales & Sociales:")}</span>
                <span className="text-slate-900">{t("{v1} DZD", { v1: formatAmount(totalStateObligations) })}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-[10px] text-emerald-800 font-sans">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                <span>{t("TVA non-assujetti (Art. 282 bis CIDTA). Régime Auto-Entrepreneur Loi 22-23.")}</span>
              </div>
            </div>

            <div className="no-print mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => printElementById("declaration-preview-sheet", "Declaration-Fiscale-G12bis")}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-card px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Printer className="size-3.5 text-accent" />
                {t("Imprimer Déclaration")}
              </button>
              <button
                type="button"
                onClick={() => setShowDeclaration(false)}
                className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-ink active:scale-95 transition-all"
              >
                {t("Fermer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
