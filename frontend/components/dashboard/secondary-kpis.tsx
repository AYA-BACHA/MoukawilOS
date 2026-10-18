import { ArrowRight, CalendarCheck, ClipboardClock } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { formatAmount, formatLongDate } from "@/lib/format";
import type { Deadline, TurnoverStats } from "@/types/models";

const cardClass = "flex flex-1 flex-col gap-4 rounded-lg bg-white p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]";
const labelClass = "text-xs font-semibold uppercase tracking-[0.05em] text-muted";
const linkClass = "inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm font-semibold text-primary-ink";

export function SecondaryKpis({ deadline, stats }: { deadline: Deadline; stats: TurnoverStats }) {
  return (
    <div className="flex gap-4">
      <article className={`${cardClass} gap-5`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className={labelClass}>Next Statutory Deadline</h3>
            <span className="grid size-8 place-items-center rounded-lg bg-mint/60 text-primary">
              <CalendarCheck className="size-4" />
            </span>
          </div>
          <p className="pt-1 text-2xl font-bold leading-8 tracking-[-0.025em] text-ink">{formatLongDate(deadline.dueDate)}</p>
          <p className="text-sm text-body">{deadline.description}</p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <button className={linkClass}>
            View declaration preview
            <ArrowRight className="size-3" />
          </button>
          <Pill className="bg-surface-low px-2 py-0.5 font-num font-normal text-muted">DGI Tax Portal Sync</Pill>
        </div>
      </article>

      <article className={cardClass}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className={labelClass}>Pending Inflow</h3>
            <span className="grid size-8 place-items-center rounded-lg bg-surface text-primary">
              <ClipboardClock className="size-4" />
            </span>
          </div>
          <p className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl font-bold leading-8 tracking-[-0.025em] text-ink">{formatAmount(stats.pending)}</span>
            <span className="font-num text-sm text-muted">DZD</span>
          </p>
          <div>
            <Pill dot="bg-teal" className="bg-surface-low px-3 py-1 text-body">
              {stats.counts.pending} pending invoices awaiting client clearance
            </Pill>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <button className={linkClass}>
            Track receivables
            <ArrowRight className="size-3" />
          </button>
          <Pill className="bg-surface-low px-2 py-0.5 font-normal tracking-[0.01em] text-body">Exempt from ceiling until cashed</Pill>
        </div>
      </article>
    </div>
  );
}
