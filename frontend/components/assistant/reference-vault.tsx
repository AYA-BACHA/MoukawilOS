"use client";

import { useState } from "react";
import { Gauge, Scale, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatAmount, formatWhole } from "@/lib/format";
import type { Statute, TurnoverStats, User } from "@/types/models";

interface ReferenceVaultProps {
  statutes: Statute[];
  cited: string[];
  user: User;
  stats: TurnoverStats;
}

export function ReferenceVault({ statutes, cited, user, stats }: ReferenceVaultProps) {
  const [search, setSearch] = useState("");

  const filteredStatutes = statutes.filter((s) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return s.code.toLowerCase().includes(query) || s.title.toLowerCase().includes(query) || s.summary.toLowerCase().includes(query);
  });

  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
      {/* Real-time Ceiling & Tax Monitor Card */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-mint text-primary">
              <Gauge className="size-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Fiscal Monitor</h2>
          </div>
          <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-ink">
            {Math.round(stats.utilization * 100)}% Utilized
          </span>
        </div>

        <div>
          <div className="flex items-baseline justify-between font-num">
            <span className="text-xl font-bold tracking-tight text-ink">
              {formatWhole(stats.collected)}{" "}
              <span className="text-xs font-normal text-muted">DZD</span>
            </span>
            <span className="text-xs text-muted">/ 5,000,000 DZD</span>
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
            <span className="text-[10px] text-muted block mb-0.5 font-medium">Remaining</span>
            <span className="font-num font-bold text-ink block truncate">{formatWhole(stats.remaining)} DZD</span>
          </div>
          <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
            <span className="text-[10px] text-muted block mb-0.5 font-medium">0.5% IFU Tax</span>
            <span className="font-num font-bold text-teal block truncate">
              {formatAmount(stats.collected * user.ifuRate)} DZD
            </span>
          </div>
        </div>
      </section>

      {/* Statutory Reference Vault Card */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-mint text-primary">
              <Scale className="size-3.5" />
            </span>
            <h2 className="text-sm font-bold tracking-tight text-ink">Legal Vault</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-surface-low px-2 py-0.5 text-[10px] font-semibold text-muted">
            {statutes.length} Texts
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Law 22-23, decrees..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-7 pr-3 text-xs text-ink placeholder:text-muted/70 outline-none transition-all focus:border-primary focus:bg-white"
          />
        </div>

        {/* Statutes List */}
        <ul className="flex max-h-[400px] flex-col gap-2.5 overflow-y-auto pr-1">
          {filteredStatutes.map((statute) => {
            const isCited = cited.includes(statute.id);
            return (
              <li
                key={statute.id}
                className={cn(
                  "rounded-xl p-3 border transition-all duration-200",
                  isCited
                    ? "border-primary/40 bg-mint/40 shadow-xs ring-1 ring-primary/20"
                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200",
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-num text-[11px] font-bold text-teal">{statute.code}</span>
                  {isCited && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                      <span className="size-1 rounded-full bg-white animate-pulse" />
                      Cited
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-ink leading-tight">{statute.title}</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{statute.summary}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
