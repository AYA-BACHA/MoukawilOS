import { ClipboardClock, Info, ReceiptText, Wallet } from "lucide-react";
import { formatAmount } from "@/lib/format";
import type { TurnoverStats } from "@/types/models";

const cardClass = "flex flex-1 flex-col gap-3 overflow-hidden rounded-lg bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]";
const labelClass = "text-xs font-semibold uppercase tracking-[0.05em]";
const unitClass = "text-xs font-semibold tracking-[0.02em]";
const amountClass = "font-num text-[28px] font-bold leading-9 tracking-[-0.02em]";

interface SummaryStripProps {
  stats: TurnoverStats;
}

export function SummaryStrip({ stats }: SummaryStripProps) {
  const { collected, pending, ceiling, remaining, utilization, totalInvoiced, counts } = stats;
  const impact = (pending / ceiling) * 100;

  return (
    <div className="flex items-stretch gap-3">
      <article className={cardClass}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`${labelClass} text-muted`}>Total Invoiced</h3>
            <p className="pt-0.5 text-xs tracking-[0.01em] text-body">Aggregate commitment ({counts.all} files)</p>
          </div>
          <span className="grid size-8 place-items-center rounded bg-surface-low text-body">
            <ReceiptText className="size-4" />
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <p className="flex items-baseline gap-1">
            <span className={`${amountClass} text-ink`}>{formatAmount(totalInvoiced)}</span>
            <span className={`${unitClass} text-muted`}>DZD</span>
          </p>
          <p className="flex items-center gap-1 text-xs font-medium tracking-[0.02em] text-body">
            <Info className="size-3.5 shrink-0" />
            Includes {counts.draft} ongoing draft & {counts.pending} issued receivables
          </p>
        </div>
      </article>

      <article className={cardClass}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1">
              <h3 className={`${labelClass} text-primary-ink`}>Collected Turnover</h3>
              <span className="rounded-sm bg-mint px-1.5 py-0.5 text-[10px] font-bold leading-[15px] text-mint-ink">CASNOS BASE</span>
            </div>
            <p className="pt-0.5 text-xs tracking-[0.01em] text-body">{counts.paid} paid invoices settled via bank/CCP</p>
          </div>
          <span className="grid size-8 place-items-center rounded bg-mint text-accent">
            <Wallet className="size-4" />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="flex items-baseline gap-1">
            <span className={`${amountClass} text-primary-ink`}>{formatAmount(collected)}</span>
            <span className={`${unitClass} text-teal`}>DZD</span>
          </p>
          <div className="flex flex-col gap-1 pt-1">
            <div className="h-1.5 overflow-hidden rounded-xl bg-surface">
              <div className="h-full rounded-xl bg-primary" style={{ width: `${utilization * 100}%` }} />
            </div>
            <div className="flex items-start justify-between font-num text-xs">
              <span className="text-body">
                {Math.round(utilization * 100)}% of {ceiling.toLocaleString("en-US")} DZD statutory ceiling
              </span>
              <span className="text-right text-teal">{remaining.toLocaleString("en-US")} DZD remaining</span>
            </div>
          </div>
        </div>
      </article>

      <article className={cardClass}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`${labelClass} text-muted`}>Pending Inflow</h3>
            <p className="pt-0.5 text-xs tracking-[0.01em] text-body">{counts.pending} issued invoices awaiting settlement</p>
          </div>
          <span className="grid size-8 place-items-center rounded bg-surface-high text-accent">
            <ClipboardClock className="size-4" />
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <p className="flex items-baseline gap-1">
            <span className={`${amountClass} text-ink`}>{formatAmount(pending)}</span>
            <span className={`${unitClass} text-muted`}>DZD</span>
          </p>
          <p className="flex items-center gap-1 text-xs font-medium tracking-[0.02em] text-body">
            <span className="size-2 rounded-full bg-success" />
            Impact when settled: +{impact.toFixed(1)}% legal turnover
          </p>
        </div>
      </article>
    </div>
  );
}
