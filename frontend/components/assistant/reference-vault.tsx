"use client";

import { useState } from "react";
import { FileText, Gauge, Scale, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

import type { Statute, TurnoverStats, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

interface ReferenceVaultProps {
  statutes: Statute[];
  cited: string[];
  user: User;
  stats: TurnoverStats;
  onInspectStatute?: (statute: Statute) => void;
}

export function ReferenceVault({ statutes, cited, user, stats, onInspectStatute }: ReferenceVaultProps) {
  const { t, formatAmount, formatWhole } = useI18n();
  const [search, setSearch] = useState("");

  const filteredStatutes = statutes.filter((s) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return s.code.toLowerCase().includes(query) || s.title.toLowerCase().includes(query) || s.summary.toLowerCase().includes(query);
  });

  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
      {/* Real-time Ceiling & Tax Monitor Card */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-mint text-accent">
              <Gauge className="size-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">{t("Fiscal Monitor")}</h2>
          </div>
          <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-ink">
            {t("{v1}% Utilized", { v1: Math.round(stats.utilization * 100) })}
          </span>
        </div>

        <div>
          <div className="flex items-baseline justify-between font-num">
            <span className="text-xl font-bold tracking-tight text-ink">
              {formatWhole(stats.collected)}{" "}
              <span className="text-xs font-normal text-muted">{t("DZD")}</span>
            </span>
            <span className="text-xs text-muted">{t("/ 5,000,000 DZD")}</span>
          </div>

          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, stats.utilization * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
            <span className="text-[10px] text-muted block mb-0.5 font-medium">{t("Remaining")}</span>
            <span className="font-num font-bold text-ink block truncate">{t("{v1} DZD", { v1: formatWhole(stats.remaining) })}</span>
          </div>
          <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
            <span className="text-[10px] text-muted block mb-0.5 font-medium">{t("0.5% IFU Tax")}</span>
            <span className="font-num font-bold text-teal block truncate">
              {t("{v1} DZD", { v1: formatAmount(stats.collected * user.ifuRate) })}
            </span>
          </div>
        </div>
      </section>

      {/* Statutory Reference Vault Card */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-mint text-accent">
              <Scale className="size-3.5" />
            </span>
            <h2 className="text-sm font-bold tracking-tight text-ink">{t("Legal Vault")}</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-surface-low px-2 py-0.5 text-[10px] font-semibold text-muted">
            {t("{length} Texts", { length: statutes.length })}
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute start-2.5 top-3.5 sm:top-2.5 size-3.5 sm:size-3 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search Law 22-23, decrees...")}
            className="w-full min-h-[44px] sm:min-h-0 rounded-lg border border-slate-200 bg-slate-50/70 py-2 sm:py-1.5 ps-8 pe-3 text-base sm:text-xs text-ink placeholder:text-muted/70 outline-none transition-all focus:border-primary focus:bg-card"
          />
        </div>

        {/* Statutes List */}
        <ul className="flex max-h-[400px] flex-col gap-2.5 overflow-y-auto px-1 py-0.5 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.200)_transparent]">
          {filteredStatutes.map((statute) => {
            const isCited = cited.includes(statute.id);
            return (
              <li
                key={statute.id}
                onClick={() => onInspectStatute?.(statute)}
                className={cn(
                  "cursor-pointer rounded-xl p-3 border transition-all duration-200 hover:shadow-xs hover:border-teal/40 group/statute",
                  isCited
                    ? "border-primary/40 bg-mint/40 shadow-xs ring-1 ring-primary/20"
                    : "border-slate-200/60 bg-white hover:bg-slate-50/90 hover:border-slate-300",
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">{statute.code}</span>
                  <div className="flex items-center gap-1.5">
                    {isCited && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                        {t("Cited")}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 group-hover/statute:text-slate-700 font-medium transition-colors flex items-center gap-0.5">
                      <span>{t("View text")}</span>
                      <span className="rtl:rotate-180 inline-block">→</span>
                    </span>
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 leading-tight group-hover/statute:text-emerald-700 transition-colors dark:text-slate-100">
                  {t(statute.title)}
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                  {t(statute.summary)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
