import { BadgeCheck, CalendarDays, IdCard, ShieldCheck } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { ReadOnly, SettingField } from "@/components/settings/setting-field";
import { SectionCard } from "@/components/settings/section-card";
import { formatDate, formatLongDate } from "@/lib/format";
import type { User } from "@/types/models";

const digits = (value: string) => <span className="text-xs font-medium tracking-[0.02em] text-muted">{value.length} Digits</span>;

export function IdentificationSection({ user }: { user: User }) {
  return (
    <SectionCard
      id="identification"
      icon={ShieldCheck}
      title="Statutory Identification"
      subtitle="Validated against National Auto-Entrepreneur Agency (ANAE) registry"
      badge={
        <Pill dot="bg-primary" className="h-fit bg-mint px-2 py-1 text-mint-ink">
          Law 22-23 Binding
        </Pill>
      }
    >
      <div className="grid grid-cols-2 gap-4 pt-1">
        <SettingField
          label="Full legal name"
          hint="Legal identity matches national ID and tax records."
          badge={
            <span className="inline-flex items-center gap-1 rounded-sm bg-mint px-2 py-0.5 text-xs font-medium tracking-[0.02em] text-primary-ink">
              <BadgeCheck className="size-3" />
              Verified with ANAE
            </span>
          }
        >
          <ReadOnly>{user.fullName}</ReadOnly>
        </SettingField>
        <SettingField
          label="ANAE registration number"
          hint="Issued by the National Auto-Entrepreneur Agency."
          badge={
            <span className="inline-flex items-center gap-1 rounded-sm bg-mint px-2 py-0.5 font-num text-xs text-primary-ink">
              <span className="size-1.5 rounded-full bg-primary" />
              Active Registry
            </span>
          }
        >
          <ReadOnly trailing={<IdCard className="size-[15px] text-body" />}>
            <span className="font-num font-bold">{user.registration}</span>
          </ReadOnly>
        </SettingField>
        <SettingField label="Fiscal NIF (tax number)" hint="Permanent fiscal identification code for corporate ledger filing.">
          <ReadOnly trailing={digits(user.nif)}>
            <span className="font-num">{user.nif}</span>
          </ReadOnly>
        </SettingField>
        <SettingField label="Statistical NIS" hint="National statistical identification issued for official reporting.">
          <ReadOnly trailing={digits(user.nis)}>
            <span className="font-num">{user.nis}</span>
          </ReadOnly>
        </SettingField>
        <SettingField label="Approved statutory activity" className="col-span-2">
          <ReadOnly>{user.statutoryActivity}</ReadOnly>
          <div className="flex items-center justify-between pt-1 text-xs tracking-[0.01em]">
            <p className="text-muted">
              Statutory Activity Classification: <span className="text-primary-ink">{user.activityCode}</span>
            </p>
            <p className="font-medium tracking-[0.02em] text-teal">Eligible for Flat {user.ifuRate * 100}% IFU</p>
          </div>
        </SettingField>
        <SettingField label="Registration date">
          <ReadOnly>
            <CalendarDays className="size-[15px] text-body" />
            {formatLongDate(user.registeredAt)}
          </ReadOnly>
        </SettingField>
        <SettingField label="Auto-entrepreneur card status">
          <ReadOnly className="bg-mint">
            <ShieldCheck className="size-[15px] text-mint-ink" />
            <span className="font-semibold text-mint-ink">Active &amp; Compliant</span>
            <span className="pl-6 text-xs tracking-[0.01em] text-primary">Valid through {formatDate(user.cardValidUntil)}</span>
          </ReadOnly>
        </SettingField>
      </div>
    </SectionCard>
  );
}
