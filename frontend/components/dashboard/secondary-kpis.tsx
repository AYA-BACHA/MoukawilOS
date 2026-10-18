"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardClock, FileText, Printer, X } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { formatAmount, formatLongDate } from "@/lib/format";
import type { Deadline, TurnoverStats } from "@/types/models";

const cardClass = "flex flex-1 flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300";
const labelClass = "text-xs font-bold uppercase tracking-wider text-muted";
const linkClass = "inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-surface-low px-3 py-1.5 text-xs font-semibold text-primary transition-all duration-150 hover:border-slate-300 hover:bg-surface active:scale-95 shadow-2xs hover:shadow-xs";

export function SecondaryKpis({ deadline, stats }: { deadline: Deadline; stats: TurnoverStats }) {
  const [showDeclaration, setShowDeclaration] = useState(false);

  const ifuTax = stats.collected * 0.005;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <article id="tour-statutory-deadline" className={cardClass}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={labelClass}>Next Statutory Deadline</h3>
              <span className="grid size-9 place-items-center rounded-xl bg-mint/70 text-primary shadow-xs">
                <CalendarCheck className="size-4" />
              </span>
            </div>
            <div>
              <p className="font-num text-2xl font-bold tracking-tight text-ink">
                {formatLongDate(deadline.dueDate)}
              </p>
              <p className="mt-1 text-xs text-body leading-relaxed">
                Annual G50-A filing (0.5% flat IFU tax obligation) • No unexpected audits.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-3">
            <button
              type="button"
              onClick={() => setShowDeclaration(true)}
              className={linkClass}
            >
              View declaration preview
              <ArrowRight className="size-3" />
            </button>
            <Pill className="border border-slate-200/70 bg-surface-low px-2 py-0.5 font-num text-[11px] text-muted">
              DGI Tax Portal Sync
            </Pill>
          </div>
        </article>

        <article id="tour-pending-inflow" className={cardClass}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={labelClass}>Pending Inflow</h3>
              <span className="grid size-9 place-items-center rounded-xl bg-surface text-primary shadow-xs">
                <ClipboardClock className="size-4" />
              </span>
            </div>
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="font-num text-2xl font-bold tracking-tight text-ink">
                  {formatAmount(stats.pending)}
                </span>
                <span className="font-num text-sm font-medium text-muted">DZD</span>
              </p>
              <div className="mt-2">
                <Pill dot="bg-teal" className="bg-surface-low px-2.5 py-1 text-xs text-body">
                  {stats.counts.pending} invoices awaiting clearance • 0 DZD taxed until money clears
                </Pill>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-3">
            <Link href="/invoices" className={linkClass}>
              Track receivables
              <ArrowRight className="size-3" />
            </Link>
            <Pill className="border border-slate-200/70 bg-surface-low px-2 py-0.5 text-[11px] text-body">
              Exempt from ceiling until cashed
            </Pill>
          </div>
        </article>
      </div>

      {/* Statutory Form G50-A Preview Modal */}
      {showDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-ink">
                  Official Algerian Tax Slip
                </span>
                <h3 className="mt-1 text-lg font-bold text-ink">Formulaire G50-A (Déclaration IFU)</h3>
                <p className="text-xs text-muted">Direction Générale des Impôts • Régime Auto-Entrepreneur</p>
              </div>
              <button
                onClick={() => setShowDeclaration(false)}
                className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4 font-mono text-xs">
              <div className="border-b border-slate-200 pb-2 text-center font-sans">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE</p>
                <p className="text-[10px] text-slate-500">MINISTÈRE DES FINANCES — DGI</p>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-600">Exercice Fiscal:</span>
                <span className="font-bold text-slate-900">2026</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Date Limite de Dépôt:</span>
                <span className="font-bold text-amber-700">30 Juin 2026</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Chiffre d&apos;Affaires Réalisé (Encaissé):</span>
                <span className="font-bold text-slate-900">{formatAmount(stats.collected)} DZD</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Taux IFU Forfaitaire (Art. 6):</span>
                <span className="font-bold text-emerald-700">0.5 %</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                <span className="text-slate-900">Impôt Forfaitaire Unique Dû:</span>
                <span className="text-sm text-primary">{formatAmount(ifuTax)} DZD</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
              >
                <Printer className="size-3.5" />
                Imprimer Déclaration
              </button>
              <button
                type="button"
                onClick={() => setShowDeclaration(false)}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-ink"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
