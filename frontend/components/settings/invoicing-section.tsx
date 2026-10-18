import { Banknote, ChevronDown, FileText, Lock, ShieldCheck } from "lucide-react";
import { ReadOnly, SettingField, controlClass } from "@/components/settings/setting-field";
import { SectionCard } from "@/components/settings/section-card";
import { cn } from "@/lib/cn";
import { paymentTerms } from "@/lib/invoice-math";
import type { UserSettings } from "@/types/models";

interface InvoicingSectionProps {
  values: UserSettings;
  onChange: (patch: Partial<UserSettings>) => void;
}

export function InvoicingSection({ values, onChange }: InvoicingSectionProps) {
  return (
    <SectionCard
      id="invoicing"
      icon={FileText}
      title="Invoicing Defaults & Numbering Rules"
      subtitle="Statutory sequences, payment terms, and automated PDF footer statements"
    >
      <div className="grid grid-cols-3 gap-4">
        <SettingField label="Invoice series prefix" hint="Fiscal Year identifier token.">
          <input className={cn(controlClass, "font-num font-bold")} value={values.invoicePrefix} onChange={(event) => onChange({ invoicePrefix: event.target.value })} />
        </SettingField>
        <SettingField label="Next sequential number" hint="Strict sequential integrity (No gaps).">
          <input
            className={cn(controlClass, "font-num font-bold")}
            inputMode="numeric"
            value={String(values.nextInvoiceNumber).padStart(4, "0")}
            onChange={(event) => onChange({ nextInvoiceNumber: Number(event.target.value.replace(/\D/g, "")) })}
          />
        </SettingField>
        <SettingField label="Default payment terms" hint="Standard settlement window.">
          <span className="relative">
            <select className={cn(controlClass, "appearance-none pr-8")} value={values.paymentTermsDays} onChange={(event) => onChange({ paymentTermsDays: Number(event.target.value) })}>
              {paymentTerms.map(({ days, label }) => (
                <option key={days} value={days}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-3 text-body" />
          </span>
        </SettingField>
        <SettingField label="Statutory ledger currency" hint="Executive Decree 23-197 obligates all domestic transactions to be invoiced and logged in Dinar." className="col-span-3">
          <ReadOnly
            trailing={
              <span className="flex items-center gap-1 text-xs font-medium tracking-[0.02em] text-muted">
                <Lock className="size-3" />
                Statutory Law 22-23 Invariant
              </span>
            }
          >
            <Banknote className="size-4 text-body" />
            <span className="font-num font-bold text-primary-ink">DZD (Algerian Dinar)</span>
          </ReadOnly>
        </SettingField>
        <div className="col-span-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="exemption-clause" className="text-xs font-semibold uppercase tracking-[0.05em] text-body">
              Mandatory statutory exemption clause
            </label>
            <label className="flex items-center gap-1.5 text-xs font-medium tracking-[0.02em] text-body">
              Always append to PDF invoices
              <input type="checkbox" className="size-4 accent-primary" checked={values.appendExemptionClause} onChange={(event) => onChange({ appendExemptionClause: event.target.checked })} />
            </label>
          </div>
          <textarea
            id="exemption-clause"
            rows={3}
            className="w-full resize-none rounded bg-surface-low px-3 py-3 text-xs leading-[19.5px] tracking-[0.01em] text-ink shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-primary/30"
            value={values.exemptionClause}
            onChange={(event) => onChange({ exemptionClause: event.target.value })}
          />
          <p className="flex items-center gap-1 text-xs font-medium tracking-[0.02em] text-teal">
            <ShieldCheck className="size-3.5" />
            Statutory legal safeguard to avoid withholding taxes during B2B invoicing
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
