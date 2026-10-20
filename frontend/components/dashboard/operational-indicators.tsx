"use client";

import { Calculator, Percent, ShieldCheck, type LucideIcon } from "lucide-react";

import type { TurnoverStats, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

interface IndicatorProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  description: string;
}

function Indicator({ icon: Icon, label, value, description }: IndicatorProps) {
  return (
    <article className="flex flex-1 items-start gap-3 rounded-lg bg-card p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint/60 text-accent">
        <Icon className="size-4" />
      </span>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted">{label}</h3>
        <p className="pt-0.5">{value}</p>
        <p className="pt-1 text-xs leading-[19.5px] tracking-[0.01em] text-body">{description}</p>
      </div>
    </article>
  );
}

export function OperationalIndicators({ user, stats }: { user: User; stats: TurnoverStats }) {
  const { t, formatAmount } = useI18n();
  const ifuDue = stats.collected * user.ifuRate;
  const ifuPercent = user.ifuRate * 100;

  return (
    <div id="tour-operational-indicators" className="flex items-start gap-3 pb-8">
      <Indicator
        icon={Percent}
        label={t("TVA Exemption Status")}
        value={<span className="text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">{t("0.00% VAT Certified")}</span>}
        description={t("Law 22-23 legal exemption strictly active on all generated vouchers.")}
      />
      <Indicator
        icon={ShieldCheck}
        label={t("CASNOS Social Security")}
        value={<span className="text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">{t("Coverage Active")}</span>}
        description={t("Full healthcare, maternity, and independent retirement recognized.")}
      />
      <Indicator
        icon={Calculator}
        label={t("Estimated IFU Due")}
        value={<span className="font-num text-xl font-bold leading-7 tracking-[-0.01em] text-ink">{t("{v1} DZD", { v1: formatAmount(ifuDue) })}</span>}
        description={t("Calculated at flat {pct}% against collected turnover of {amount}M DZD.", { pct: ifuPercent, amount: (stats.collected / 1_000_000).toFixed(1) })}
      />
    </div>
  );
}
