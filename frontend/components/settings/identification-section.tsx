"use client";

import { BadgeCheck, CalendarDays, IdCard, ShieldCheck } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { ReadOnly, SettingField } from "@/components/settings/setting-field";
import { SectionCard } from "@/components/settings/section-card";

import type { User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

function Digits({ value }: { value: string }) {
  const { t } = useI18n();
  return <span className="text-xs font-medium tracking-[0.02em] text-muted">{t("{length} Digits", { length: value.length })}</span>;
}

export function IdentificationSection({ user }: { user: User }) {
  const { t, formatDate, formatLongDate } = useI18n();
  return (
    <SectionCard
      id="identification"
      icon={ShieldCheck}
      title={t("Statutory Identification")}
      subtitle={t("Validated against National Auto-Entrepreneur Agency (ANAE) registry")}
      badge={
        <Pill dot="bg-primary" className="h-fit bg-mint px-2 py-1 text-mint-ink">
          {t("Law 22-23 Binding")}
        </Pill>
      }
    >
      <div className="grid grid-cols-2 gap-4 pt-1">
        <SettingField
          label={t("Full legal name")}
          hint={t("Legal identity matches national ID and tax records.")}
          badge={
            <span className="inline-flex items-center gap-1 rounded-sm bg-mint px-2 py-0.5 text-xs font-medium tracking-[0.02em] text-primary-ink">
              <BadgeCheck className="size-3" />
              {t("Verified with ANAE")}
            </span>
          }
        >
          <ReadOnly>{user.fullName}</ReadOnly>
        </SettingField>
        <SettingField
          label={t("ANAE registration number")}
          hint={t("Issued by the National Auto-Entrepreneur Agency.")}
          badge={
            <span className="inline-flex items-center gap-1 rounded-sm bg-mint px-2 py-0.5 font-num text-xs text-primary-ink">
              <span className="size-1.5 rounded-full bg-primary" />
              {t("Active Registry")}
            </span>
          }
        >
          <ReadOnly trailing={<IdCard className="size-[15px] text-body" />}>
            <span className="font-num font-bold">{user.registration}</span>
          </ReadOnly>
        </SettingField>
        <SettingField label={t("Fiscal NIF (tax number)")} hint={t("Permanent fiscal identification code for corporate ledger filing.")}>
          <ReadOnly trailing={<Digits value={user.nif} />}>
            <span className="font-num">{user.nif}</span>
          </ReadOnly>
        </SettingField>
        <SettingField label={t("Statistical NIS")} hint={t("National statistical identification issued for official reporting.")}>
          <ReadOnly trailing={<Digits value={user.nis} />}>
            <span className="font-num">{user.nis}</span>
          </ReadOnly>
        </SettingField>
        <SettingField label={t("Approved statutory activity")} className="col-span-2">
          <ReadOnly>{user.statutoryActivity}</ReadOnly>
          <div className="flex items-center justify-between pt-1 text-xs tracking-[0.01em]">
            <p className="text-muted">
              {t("Statutory Activity Classification:")} <span className="text-primary-ink">{user.activityCode}</span>
            </p>
            <p className="font-medium tracking-[0.02em] text-teal">{t("Eligible for Flat {v1}% IFU", { v1: user.ifuRate * 100 })}</p>
          </div>
        </SettingField>
        <SettingField label={t("Registration date")}>
          <ReadOnly>
            <CalendarDays className="size-[15px] text-body" />
            {formatLongDate(user.registeredAt)}
          </ReadOnly>
        </SettingField>
        <SettingField label={t("Auto-entrepreneur card status")}>
          <ReadOnly className="bg-mint">
            <ShieldCheck className="size-[15px] text-mint-ink" />
            <span className="font-semibold text-mint-ink">{t("Active & Compliant")}</span>
            <span className="ps-6 text-xs tracking-[0.01em] text-accent">{t("Valid through {v1}", { v1: formatDate(user.cardValidUntil) })}</span>
          </ReadOnly>
        </SettingField>
      </div>
    </SectionCard>
  );
}
