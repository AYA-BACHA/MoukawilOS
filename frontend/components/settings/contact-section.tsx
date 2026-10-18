import { Building2, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { IconInput, SettingField, controlClass } from "@/components/settings/setting-field";
import { SectionCard } from "@/components/settings/section-card";
import { cn } from "@/lib/cn";
import { wilayas } from "@/lib/wilayas";
import type { UserSettings } from "@/types/models";

interface ContactSectionProps {
  values: UserSettings;
  onChange: (patch: Partial<UserSettings>) => void;
}

export function ContactSection({ values, onChange }: ContactSectionProps) {
  return (
    <SectionCard
      id="contact"
      icon={Building2}
      title="Official Business Address & Contact"
      subtitle="Displayed on issued invoice footers and legal compliance declarations"
    >
      <div className="grid grid-cols-2 gap-4">
        <SettingField label="Professional email" hint="Recipient for tax agency verification and audit notices.">
          <IconInput icon={<Mail className="size-[15px]" />} type="email" value={values.email} onChange={(event) => onChange({ email: event.target.value })} />
        </SettingField>
        <SettingField label="Professional phone" hint="Used on official customer statements and invoices.">
          <IconInput icon={<Phone className="size-[14px]" />} type="tel" className="font-num" value={values.phone} onChange={(event) => onChange({ phone: event.target.value })} />
        </SettingField>
        <SettingField label="Registered domiciliation address" className="col-span-2">
          <IconInput icon={<MapPin className="size-[15px]" />} value={values.address} onChange={(event) => onChange({ address: event.target.value })} />
        </SettingField>
        <SettingField label="City">
          <input className={controlClass} value={values.city} onChange={(event) => onChange({ city: event.target.value })} />
        </SettingField>
        <div className="grid grid-cols-2 gap-3">
          <SettingField label="Wilaya">
            <span className="relative">
              <select className={cn(controlClass, "appearance-none truncate pr-8")} value={values.wilaya} onChange={(event) => onChange({ wilaya: event.target.value })}>
                {wilayas.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-3 text-body" />
            </span>
          </SettingField>
          <SettingField label="Postal code">
            <input className={cn(controlClass, "font-num")} inputMode="numeric" maxLength={5} value={values.postalCode} onChange={(event) => onChange({ postalCode: event.target.value.replace(/\D/g, "") })} />
          </SettingField>
        </div>
      </div>
    </SectionCard>
  );
}
