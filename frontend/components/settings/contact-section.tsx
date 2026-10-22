"use client";

import { Building2, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { IconInput, SettingField, controlClass } from "@/components/settings/setting-field";
import { SectionCard } from "@/components/settings/section-card";
import { cn } from "@/lib/cn";
import { wilayas } from "@/lib/wilayas";
import type { UserSettings } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

interface ContactSectionProps {
  values: UserSettings;
  onChange: (patch: Partial<UserSettings>) => void;
}

export function ContactSection({ values, onChange }: ContactSectionProps) {
  const { t } = useI18n();
  return (
    <SectionCard
      id="contact"
      icon={Building2}
      title={t("Official Business Address & Contact")}
      subtitle={t("Displayed on issued invoice footers and legal compliance declarations")}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingField label={t("Professional email")} hint={t("Recipient for tax agency verification and audit notices.")}>
          <IconInput icon={<Mail className="size-[15px]" />} type="email" value={values.email} onChange={(event) => onChange({ email: event.target.value })} />
        </SettingField>
        <SettingField label={t("Professional phone")} hint={t("Used on official customer statements and invoices.")}>
          <IconInput icon={<Phone className="size-[14px]" />} type="tel" className="font-num" value={values.phone} onChange={(event) => onChange({ phone: event.target.value })} />
        </SettingField>
        <SettingField label={t("Registered domiciliation address")} className="col-span-1 sm:col-span-2">
          <IconInput icon={<MapPin className="size-[15px]" />} value={values.address} onChange={(event) => onChange({ address: event.target.value })} />
        </SettingField>
        <SettingField label={t("City")}>
          <input className={controlClass} value={values.city} onChange={(event) => onChange({ city: event.target.value })} />
        </SettingField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SettingField label={t("Wilaya")}>
            <span className="relative">
              <select className={cn(controlClass, "appearance-none truncate pe-8")} value={values.wilaya} onChange={(event) => onChange({ wilaya: event.target.value })}>
                {wilayas.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {code} - {t(name)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-3.5 size-3 text-body" />
            </span>
          </SettingField>
          <SettingField label={t("Postal code")}>
            <input className={cn(controlClass, "font-num")} inputMode="numeric" maxLength={5} value={values.postalCode} onChange={(event) => onChange({ postalCode: event.target.value.replace(/\D/g, "") })} />
          </SettingField>
        </div>
      </div>
    </SectionCard>
  );
}
