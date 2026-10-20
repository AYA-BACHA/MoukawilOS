"use client";

import { useEffect, useState } from "react";
import { Building2, Check, ChevronRight, FileText, Info, RefreshCw, Save, Shield, ShieldCheck, X, type LucideIcon } from "lucide-react";
import { ContactSection } from "@/components/settings/contact-section";
import { IdentificationSection } from "@/components/settings/identification-section";
import { InvoicingSection } from "@/components/settings/invoicing-section";
import { AuditPanel, CeilingPanel, PassCard } from "@/components/settings/side-panels";
import { cn } from "@/lib/cn";
import { updateUserSettings } from "@/lib/api";
import type { TurnoverStats, User, UserSettings } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const tabs: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "identification", label: "Statutory Identification", icon: ShieldCheck },
  { id: "contact", label: "Contact Details", icon: Building2 },
  { id: "invoicing", label: "Invoicing Defaults", icon: FileText },
  { id: "security", label: "Security & Compliance", icon: Shield },
];

const pickSettings = (user: User): UserSettings => ({
  email: user.email,
  phone: user.phone,
  address: user.address,
  city: user.city,
  wilaya: user.wilaya,
  postalCode: user.postalCode,
  invoicePrefix: user.invoicePrefix,
  nextInvoiceNumber: user.nextInvoiceNumber,
  paymentTermsDays: user.paymentTermsDays,
  appendExemptionClause: user.appendExemptionClause,
  exemptionClause: user.exemptionClause,
});

export function SettingsView({ user, stats }: { user: User; stats: TurnoverStats }) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(() => pickSettings(user));
  const [values, setValues] = useState(saved);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [synced, setSynced] = useState(false);
  const [toast, setToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const update = (patch: Partial<UserSettings>) => setValues((current) => ({ ...current, ...patch }));

  const goTo = (id: string) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const save = async () => {
    setSaving(true);
    const updated = await updateUserSettings(values);
    const next = pickSettings(updated);
    setSaved(next);
    setValues(next);
    setSynced(true);
    setToast(true);
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6 px-6 pb-6 pt-4">
      <header className="flex items-end justify-between rounded-lg bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.05em] text-body">
            {t("Fiscal OS")}
            <ChevronRight className="rtl:-scale-x-100 size-2.5" />
            {t("Configuration Hub")}
            <ChevronRight className="rtl:-scale-x-100 size-2.5" />
            <span className="font-semibold text-primary-ink">{t("Statutory Profile")}</span>
          </nav>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.025em] text-ink">{t("Profile & Settings")}</h1>
          <p className="max-w-2xl text-base tracking-[-0.005em] text-body">{t("Manage your statutory identification, fiscal credentials, contact details, and invoice defaults.")}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="flex items-center gap-1 text-xs font-medium tracking-[0.02em] text-body">
            <RefreshCw className="size-2.5" />
            {synced ? t("Last synced just now") : t("All changes synced")}
          </p>
          <button onClick={save} disabled={saving} className="flex items-center gap-1 rounded bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] disabled:opacity-60">
            <Save className="size-3.5" />
            {t("Save Changes")}
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-auto rounded-lg bg-surface-low p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={cn(
              "flex items-center gap-1 whitespace-nowrap rounded px-3 py-2 text-sm font-medium",
              activeTab === id ? "bg-card text-primary-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : "text-body",
            )}
          >
            <Icon className="size-[15px]" strokeWidth={1.75} />
            {t(label)}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-8 flex flex-col gap-6">
          <IdentificationSection user={user} />
          <ContactSection values={values} onChange={update} />
          <InvoicingSection values={values} onChange={update} />
        </div>
        <div className="col-span-4 flex flex-col gap-6">
          <CeilingPanel user={user} stats={stats} />
          <PassCard user={user} />
          <AuditPanel user={user} />
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-lg bg-card p-4 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <p className="flex items-center gap-2 text-xs tracking-[0.01em] text-body">
          <Info className="size-4 shrink-0 text-accent" />
          {t("Any modification to your legal name, NIF, or statutory activity code requires formal ANAE re-validation.")}
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => setValues(saved)} disabled={!dirty} className="rounded bg-surface px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-50">
            {t("Discard Changes")}
          </button>
          <button onClick={save} disabled={saving || !dirty} className="flex items-center gap-1 rounded bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] disabled:opacity-60">
            <Check className="size-3.5" />
            {t("Save Changes")}
          </button>
        </div>
      </div>

      {toast && (
        <div role="status" className="fixed end-8 top-20 z-30 flex items-center gap-2 rounded bg-card px-3 py-2 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
          <ShieldCheck className="size-[17px] text-accent" />
          <div>
            <p className="text-sm font-semibold text-primary-ink">{t("Settings saved successfully")}</p>
            <p className="text-xs tracking-[0.01em] text-body">{t("Invoicing defaults and fiscal registry synced.")}</p>
          </div>
          <button aria-label={t("Dismiss")} onClick={() => setToast(false)} className="ps-3 text-body">
            <X className="size-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
