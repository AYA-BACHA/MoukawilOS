import { Building2, CircleCheck, ShieldCheck, WalletCards, type LucideIcon } from "lucide-react";
import { formatAmount } from "@/lib/format";
import type { computeClientMetrics } from "@/lib/clients";

type Metrics = ReturnType<typeof computeClientMetrics>;

interface MetricCardProps {
  label: string;
  icon: LucideIcon;
  value: React.ReactNode;
  footer: React.ReactNode;
}

function MetricCard({ label, icon: Icon, value, footer }: MetricCardProps) {
  return (
    <article className="flex flex-1 flex-col justify-between overflow-hidden rounded-lg bg-card shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-2 p-4 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-body">{label}</h3>
          <span className="grid size-6 place-items-center rounded bg-surface-low text-accent">
            <Icon className="size-3.5" strokeWidth={1.75} />
          </span>
        </div>
        <div className="py-3">{value}</div>
      </div>
      <div className="flex items-center gap-1 bg-surface-low px-4 py-2.5 text-xs font-medium tracking-[0.02em] text-body">{footer}</div>
    </article>
  );
}

export function ClientMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <div className="flex gap-3">
      <MetricCard
        label="Total active clients"
        icon={Building2}
        value={
          <p className="flex items-baseline gap-1">
            <span className="text-[32px] font-semibold leading-10 tracking-[-0.025em] text-ink">{metrics.total}</span>
            <span className="text-xs font-medium tracking-[0.02em] text-teal">registered entities</span>
          </p>
        }
        footer={
          <span className="flex w-full items-center justify-between">
            <span>{metrics.business} Corporate B2B</span>
            <span className="text-muted">•</span>
            <span>{metrics.individual} Individual B2C</span>
          </span>
        }
      />
      <MetricCard
        label="B2B invoiced revenue"
        icon={WalletCards}
        value={
          <p className="flex items-baseline gap-1 font-num">
            <span className="text-[28px] font-bold leading-9 tracking-[-0.02em] text-ink">{formatAmount(metrics.businessRevenue)}</span>
            <span className="text-xs text-teal">DZD</span>
          </p>
        }
        footer={
          <span className="flex w-full items-center justify-between">
            Average Deal Size:
            <span className="font-num font-bold text-ink">{formatAmount(metrics.averageDeal)} DZD</span>
          </span>
        }
      />
      <MetricCard
        label="Statutory exemption audited"
        icon={ShieldCheck}
        value={
          <p className="flex items-center gap-2">
            <span className="text-[32px] font-semibold leading-10 tracking-[-0.025em] text-primary-ink">{metrics.compliance}%</span>
            <span className="rounded bg-mint px-2 py-0.5 text-xs font-medium tracking-[0.02em] text-mint-ink">Compliant</span>
          </p>
        }
        footer={
          <>
            <CircleCheck className="size-3.5 shrink-0" />
            All entities verified under Law 22-23 0% VAT guidelines
          </>
        }
      />
    </div>
  );
}
