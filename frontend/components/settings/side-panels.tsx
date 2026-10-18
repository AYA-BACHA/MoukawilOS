import { BadgeCheck, History, ShieldCheck, FileCheck2, Shield } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { FISCAL_YEAR } from "@/lib/constants";
import { formatWhole } from "@/lib/format";
import type { TurnoverStats, User } from "@/types/models";

export function CeilingPanel({ user, stats }: { user: User; stats: TurnoverStats }) {
  return (
    <section id="compliance-ceiling" className="flex flex-col gap-4 rounded-lg bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted">Annual statutory ceiling</h2>
        <Pill className="bg-mint px-2 py-0.5 font-semibold text-mint-ink">Law 22-23</Pill>
      </div>
      <div className="flex flex-col gap-1">
        <p className="flex items-baseline justify-between">
          <span className="font-num text-[28px] font-bold leading-9 tracking-[-0.02em] text-primary-ink">{formatWhole(stats.collected)}</span>
          <span className="font-num text-sm text-muted">/ {formatWhole(stats.ceiling)} DZD</span>
        </p>
        <p className="text-xs tracking-[0.01em] text-body">{(stats.utilization * 100).toFixed(1)}% of legal maximum revenue threshold utilized</p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-xl bg-surface-low shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="h-full rounded-xl bg-primary" style={{ width: `${stats.utilization * 100}%` }} />
      </div>
      <dl className="flex flex-col gap-2 rounded bg-surface-low p-3 text-xs font-medium tracking-[0.02em] text-body shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <dt>Remaining Legal Capacity:</dt>
          <dd className="text-right font-num text-sm font-bold text-primary-ink">{formatWhole(stats.remaining)} DZD</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Applicable IFU Tax Rate:</dt>
          <dd className="font-num text-sm font-bold text-teal">{user.ifuRate * 100}% (Flat)</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>CASNOS Regularization:</dt>
          <dd className="flex items-center gap-1 font-semibold text-primary-ink">
            <BadgeCheck className="size-3" />
            Verified {user.casnosVerifiedYear}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function PassCard({ user }: { user: User }) {
  return (
    <section
      className="relative flex h-64 flex-col justify-between overflow-hidden rounded-lg p-6 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
      style={{ backgroundImage: "linear-gradient(141deg, #00342f 0%, #154b46 50%, #43655f 100%)" }}
    >
      <ShieldCheck className="absolute -bottom-10 -right-10 size-48 opacity-10" strokeWidth={1} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] opacity-80">Democratic &amp; Popular Republic of Algeria</p>
          <p className="text-lg font-bold leading-6 tracking-[-0.025em]">Auto-Entrepreneur Digital Pass</p>
        </div>
        <ShieldCheck className="size-6" strokeWidth={1.5} />
      </div>
      <div className="relative">
        <p className="font-num text-xs opacity-75">Card ID No.</p>
        <p className="font-num text-xl font-bold tracking-[0.025em]">
          {user.registration}-{new Date(user.registeredAt).getUTCFullYear()}
        </p>
      </div>
      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.02em] opacity-75">Holder</p>
          <p className="text-sm font-semibold uppercase">{user.fullName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium tracking-[0.02em] opacity-75">Fiscal Authority</p>
          <p className="text-xs font-semibold tracking-[0.02em]">{user.fiscalAuthority}</p>
        </div>
      </div>
    </section>
  );
}

export function AuditPanel({ user }: { user: User }) {
  const items = [
    { icon: FileCheck2, title: `Tax Year ${FISCAL_YEAR} Declaration Open`, detail: "G50-A filing schedule synced" },
    { icon: History, title: "Digital Signature Certificate", detail: `RSA-2048 • Valid through ${user.certificateValidUntil}` },
  ];

  return (
    <section id="security" className="flex scroll-mt-24 flex-col gap-3 rounded-lg bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">Compliance Auditing</h2>
        <Shield className="size-4 text-body" strokeWidth={1.75} />
      </div>
      <p className="text-xs leading-4 tracking-[0.01em] text-body">System activity strictly adheres to Algerian auditing guidelines. Every update creates an unalterable log hash.</p>
      <ul className="flex flex-col gap-2 pt-1">
        {items.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="flex items-center gap-2 rounded bg-surface-low p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
            <div>
              <p className="text-xs font-semibold tracking-[0.02em] text-ink">{title}</p>
              <p className="font-num text-xs text-muted">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-2 flex items-center justify-center gap-1.5 rounded bg-surface-low py-2 text-sm font-medium text-ink shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <History className="size-3.5" />
        View Full Compliance Audit Trail
      </button>
    </section>
  );
}
