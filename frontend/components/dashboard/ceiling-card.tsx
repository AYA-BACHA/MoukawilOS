import { ArrowRight, BadgeCheck, Banknote } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { formatAmount } from "@/lib/format";
import type { TurnoverStats } from "@/types/models";

const milestones = [
  { label: "0 DZD", ratio: 0 },
  { label: "25% (1.25M)", ratio: 0.25 },
  { label: "50% (2.50M)", ratio: 0.5 },
  { label: "75% (3.75M)", ratio: 0.75 },
];

export function CeilingCard({ stats }: { stats: TurnoverStats }) {
  const { utilization, remaining, ceiling, collected } = stats;
  const percent = Math.round(utilization * 100);

  return (
    <section className="relative overflow-hidden rounded-lg bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-mint/40" />
      <div className="flex flex-col gap-4 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted">Collected Turnover</h2>
            <Pill className="bg-mint/40 px-2.5 py-1 text-teal">
              <Banknote className="size-3" />
              Cash-Basis Accounting (Law 22-23)
            </Pill>
          </div>
          <Pill className="bg-surface-low px-2.5 py-1 text-body">
            Statutory Cap: <span className="font-num text-sm font-bold text-ink">{formatAmount(ceiling)} DZD</span>
          </Pill>
        </div>

        <div className="relative flex h-11 items-start justify-between">
          <p className="flex items-baseline gap-2 pt-1">
            <span className="font-num text-[28px] font-bold leading-9 tracking-[-0.025em] text-ink">{formatAmount(collected)}</span>
            <span className="font-num text-xl leading-7 text-muted">DZD</span>
          </p>
          <Pill className="mt-2 bg-surface-low/60 px-3 py-1.5 font-normal text-body">
            <BadgeCheck className="size-3.5" />
            Audited Against Official Treasury Receipts
          </Pill>
        </div>

        <div className="flex flex-col gap-1 pt-1">
          <div className="relative h-3 overflow-hidden rounded-xl bg-mint/40">
            <div className="absolute inset-y-0.5 left-0 rounded-xl bg-primary" style={{ width: `${utilization * 100}%` }} />
            <div className="absolute inset-y-0 left-1/4 w-px bg-white/90" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-white/90" />
          </div>
          <div className="flex justify-between px-1 pt-1.5 font-num text-xs">
            {milestones.map(({ label, ratio }) => (
              <span key={label} className={ratio === 0.5 ? "text-body" : "text-muted"}>
                {label}
              </span>
            ))}
            <span className="font-bold text-primary-ink">100% ({formatAmount(ceiling)} DZD Ceiling)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-y-3 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <Pill dot="size-2 bg-primary" className="bg-mint px-3 py-1.5 text-sm font-semibold text-primary shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              {percent}% of ceiling
            </Pill>
            <p className="text-sm text-body">
              <span className="font-num font-bold text-ink">{formatAmount(remaining)} DZD</span> remaining before ceiling
            </p>
          </div>
          <button className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-primary-ink">
            View calculation details
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </section>
  );
}
