"use client";

import { BadgeCheck, History, ShieldCheck, FileCheck2, Shield } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { FISCAL_YEAR } from "@/lib/constants";

import type { TurnoverStats, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

export function CeilingPanel({ user, stats }: { user: User; stats: TurnoverStats }) {
  const { t, formatWhole } = useI18n();
  return (
    <section id="compliance-ceiling" className="flex flex-col gap-4 rounded-lg bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted">{t("Annual statutory ceiling")}</h2>
        <Pill className="bg-mint px-2 py-0.5 font-semibold text-mint-ink">{t("Law 22-23")}</Pill>
      </div>
      <div className="flex flex-col gap-1">
        <p className="flex items-baseline justify-between">
          <span className="font-num text-[28px] font-bold leading-9 tracking-[-0.02em] text-primary-ink">{formatWhole(stats.collected)}</span>
          <span className="font-num text-sm text-muted">{t("/ {v1} DZD", { v1: formatWhole(stats.ceiling) })}</span>
        </p>
        <p className="text-xs tracking-[0.01em] text-body">{t("{v1}% of legal maximum revenue threshold utilized", { v1: (stats.utilization * 100).toFixed(1) })}</p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-xl bg-surface-low shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="h-full rounded-xl bg-primary" style={{ width: `${stats.utilization * 100}%` }} />
      </div>
      <dl className="flex flex-col gap-2 rounded bg-surface-low p-3 text-xs font-medium tracking-[0.02em] text-body shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <dt>{t("Remaining Legal Capacity:")}</dt>
          <dd className="text-end font-num text-sm font-bold text-primary-ink">{t("{v1} DZD", { v1: formatWhole(stats.remaining) })}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>{t("Applicable IFU Tax Rate:")}</dt>
          <dd className="font-num text-sm font-bold text-teal">{t("{v1}% (Flat)", { v1: user.ifuRate * 100 })}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>{t("CASNOS Regularization:")}</dt>
          <dd className="flex items-center gap-1 font-semibold text-primary-ink">
            <BadgeCheck className="size-3" />
            {t("Verified {casnosVerifiedYear}", { casnosVerifiedYear: user.casnosVerifiedYear })}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function PassCard({ user }: { user: User }) {
  const { t } = useI18n();
  return (
    <section
      className="relative flex h-64 flex-col justify-between overflow-hidden rounded-lg p-6 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
      style={{ backgroundImage: "linear-gradient(141deg, #00342f 0%, #154b46 50%, #43655f 100%)" }}
    >
      <ShieldCheck className="absolute -bottom-10 -end-10 size-48 opacity-10" strokeWidth={1} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] opacity-80">{t("Democratic & Popular Republic of Algeria")}</p>
          <p className="text-lg font-bold leading-6 tracking-[-0.025em]">{t("Auto-Entrepreneur Digital Pass")}</p>
        </div>
        <ShieldCheck className="size-6" strokeWidth={1.5} />
      </div>
      <div className="relative">
        <p className="font-num text-xs opacity-75">{t("Card ID No.")}</p>
        <p className="font-num text-xl font-bold tracking-[0.025em]">
          {user.registration}-{new Date(user.registeredAt).getUTCFullYear()}
        </p>
      </div>
      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.02em] opacity-75">{t("Holder")}</p>
          <p className="text-sm font-semibold uppercase">{user.fullName}</p>
        </div>
        <div className="text-end">
          <p className="text-xs font-medium tracking-[0.02em] opacity-75">{t("Fiscal Authority")}</p>
          <p className="text-xs font-semibold tracking-[0.02em]">{user.fiscalAuthority}</p>
        </div>
      </div>
    </section>
  );
}

export function AuditPanel({ user }: { user: User }) {
  const { t } = useI18n();
  const items = [
    { icon: FileCheck2, title: t("Tax Year {year} Declaration Open", { year: FISCAL_YEAR }), detail: "G12 bis filing schedule ready" },
    { icon: History, title: "Digital Signature Certificate", detail: t("RSA-2048 • Valid through {date}", { date: user.certificateValidUntil }) },
  ];

  return (
    <section id="security" className="flex scroll-mt-24 flex-col gap-3 rounded-lg bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">{t("Compliance Auditing")}</h2>
        <Shield className="size-4 text-body" strokeWidth={1.75} />
      </div>
      <p className="text-xs leading-4 tracking-[0.01em] text-body">{t("System activity strictly adheres to Algerian auditing guidelines. Every update creates an unalterable log hash.")}</p>
      <ul className="flex flex-col gap-2 pt-1">
        {items.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="flex items-center gap-2 rounded bg-surface-low p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
            <div>
              <p className="text-xs font-semibold tracking-[0.02em] text-ink">{t(title)}</p>
              <p className="font-num text-xs text-muted">{t(detail)}</p>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-2 flex items-center justify-center gap-1.5 rounded bg-surface-low py-2 text-sm font-medium text-ink shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <History className="size-3.5" />
        {t("View Full Compliance Audit Trail")}
      </button>
    </section>
  );
}
