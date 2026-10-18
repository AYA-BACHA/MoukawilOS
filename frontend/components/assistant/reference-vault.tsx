import { Scale } from "lucide-react";
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
  return (
    <div className="col-span-4 flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted">Quick inspection</h2>
        <p className="flex items-baseline justify-between font-num">
          <span className="text-2xl font-bold tracking-[-0.02em] text-primary-ink">{formatWhole(stats.collected)}</span>
          <span className="text-sm text-muted">/ {formatWhole(stats.ceiling)} DZD</span>
        </p>
        <div className="h-2 overflow-hidden rounded-xl bg-surface-low">
          <div className="h-full rounded-xl bg-primary" style={{ width: `${stats.utilization * 100}%` }} />
        </div>
        <dl className="flex flex-col gap-1.5 text-xs font-medium tracking-[0.02em] text-body">
          <div className="flex justify-between">
            <dt>Remaining capacity</dt>
            <dd className="font-num font-bold text-ink">{formatWhole(stats.remaining)} DZD</dd>
          </div>
          <div className="flex justify-between">
            <dt>IFU due at {user.ifuRate * 100}%</dt>
            <dd className="font-num font-bold text-ink">{formatAmount(stats.collected * user.ifuRate)} DZD</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded bg-mint text-primary">
            <Scale className="size-4" strokeWidth={1.75} />
          </span>
          <h2 className="text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">Statutory Reference Vault</h2>
        </div>
        <ul className="flex flex-col gap-2">
          {statutes.map((statute) => (
            <li key={statute.id} className={cn("rounded p-3", cited.includes(statute.id) ? "bg-mint/50 ring-1 ring-primary/30" : "bg-surface-low")}>
              <p className="font-num text-[11px] text-teal">{statute.code}</p>
              <p className="text-sm font-semibold text-ink">{statute.title}</p>
              <p className="pt-0.5 text-xs leading-[19.5px] tracking-[0.01em] text-body">{statute.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
