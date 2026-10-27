"use client";

import { Building2, CalendarDays, CirclePlus, Clock, FileText, Info, ListChecks, Lock, ShieldCheck, User, WalletCards, X } from "lucide-react";
import { Field, inputClass } from "@/components/ui/field";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { cn } from "@/lib/cn";

import { addDays, lineTotal, paymentTerms, subtotal } from "@/lib/invoice-math";
import type { ClientType, DraftClient, InvoiceDraft, InvoiceItem } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const cardClass = "flex flex-col gap-3 rounded-lg bg-card p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]";

function CardHeader({ icon: Icon, title, aside }: { icon: typeof Building2; title: string; aside: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-1.5">
        <Icon className="size-4 text-ink" />
        <h2 className="text-lg font-medium leading-6 tracking-[-0.01em] text-ink">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

interface ClientCardProps {
  clientType: ClientType;
  client: DraftClient;
  onTypeChange: (type: ClientType) => void;
  onClientChange: (patch: Partial<DraftClient>) => void;
}

const clientTypes: { value: ClientType; label: string; icon: typeof Building2 }[] = [
  { value: "B2B", label: "Company (B2B)", icon: Building2 },
  { value: "B2C", label: "Individual (B2C)", icon: User },
];

export function ClientCard({ clientType, client, onTypeChange, onClientChange }: ClientCardProps) {
  const { t } = useI18n();
  const isCompany = clientType === "B2B";

  return (
    <section className={cardClass}>
      <CardHeader icon={Building2} title={t("Client Classification")} aside={<span className="rounded bg-surface-low px-1 py-0.5 text-xs font-medium tracking-[0.02em] text-body">{t("Step 01")}</span>} />
      <div className="flex gap-1 rounded bg-surface-low p-1">
        {clientTypes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onTypeChange(value)}
            className={cn(
              "flex flex-1 min-h-[44px] items-center justify-center gap-1 rounded py-1.5 text-xs font-bold transition-all active:scale-95",
              clientType === value ? "bg-mint text-accent shadow-xs" : "font-medium text-body",
            )}
          >
            <Icon className="size-3.5" />
            {t(label)}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <Field label={isCompany ? t("Company Legal Name (Raison Sociale)") : t("Full Name")}>
          <input className={inputClass} value={client.name} onChange={(event) => onClientChange({ name: event.target.value })} />
        </Field>
        {isCompany && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Field label={t("NIF")} hint={t("15 Digits")}>
              <input className={cn(inputClass, "font-num")} inputMode="numeric" maxLength={15} value={client.nif} onChange={(event) => onClientChange({ nif: event.target.value })} />
            </Field>
            <Field label={t("NIS")} hint={t("13 Digits")}>
              <input className={cn(inputClass, "font-num")} inputMode="numeric" maxLength={13} value={client.nis} onChange={(event) => onClientChange({ nis: event.target.value })} />
            </Field>
            <Field label={t("RC Number")} hint={t("Wilaya/Num")}>
              <input className={cn(inputClass, "font-num")} value={client.rc} onChange={(event) => onClientChange({ rc: event.target.value })} />
            </Field>
          </div>
        )}
        <Field label={isCompany ? t("Statutory Business Address") : t("Address")}>
          <input className={inputClass} value={client.address} onChange={(event) => onClientChange({ address: event.target.value })} />
        </Field>
      </div>
    </section>
  );
}

interface MetadataCardProps {
  number: string;
  issueDate: string;
  paymentTermsDays: number;
  onChange: (patch: Partial<Pick<InvoiceDraft, "issueDate" | "paymentTermsDays">>) => void;
}

export function MetadataCard({ number, issueDate, paymentTermsDays, onChange }: MetadataCardProps) {
  const { t, formatLongDate } = useI18n();
  return (
    <section className={cardClass}>
      <CardHeader
        icon={FileText}
        title={t("Invoice Metadata")}
        aside={
          <span className="flex items-center gap-1 rounded bg-surface-low px-1 py-0.5 font-num text-xs font-bold text-body">
            <Lock className="size-2.5" />
            {number}
          </span>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={t("Issue Date")}>
          <span className="relative">
            <input type="date" className={cn(inputClass, "pe-10")} value={issueDate} onChange={(event) => onChange({ issueDate: event.target.value })} />
            <CalendarDays className="pointer-events-none absolute end-3 top-2.5 size-[15px] text-muted" />
          </span>
        </Field>
        <Field label={t("Payment Terms")}>
          <SelectDropdown
            value={String(paymentTermsDays)}
            options={paymentTerms.map(({ days, label }) => ({
              value: String(days),
              label: t("{label} (Due: {date})", { label: t(label), date: formatLongDate(addDays(issueDate, days)) }),
            }))}
            onChange={(val) => onChange({ paymentTermsDays: Number(val) })}
            className="w-full"
            buttonClassName="w-full justify-between h-10 border-slate-300 bg-slate-50/70 hover:bg-card text-xs font-medium"
            icon={<Clock className="size-3.5 text-muted" />}
          />
        </Field>
      </div>
    </section>
  );
}

interface ItemsCardProps {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
}

export function ItemsCard({ items, onChange }: ItemsCardProps) {
  const { t, formatAmount } = useI18n();
  const update = (id: string, patch: Partial<InvoiceItem>) => onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));
  const add = () => onChange([...items, { id: crypto.randomUUID(), description: "", details: null, quantity: 1, unitPrice: 0 }]);

  return (
    <section className={cardClass}>
      <CardHeader icon={ListChecks} title={t("Itemized Deliverables")} aside={<span className="text-xs font-medium tracking-[0.02em] text-muted">{t("DZD Denominated")}</span>} />
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-surface-low p-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <input
                className={cn(inputClass, "h-10")}
                placeholder={t("Deliverable description")}
                value={item.description}
                onChange={(event) => update(item.id, { description: event.target.value })}
              />
              <button
                type="button"
                aria-label={t("Remove item")}
                onClick={() => remove(item.id)}
                disabled={items.length === 1}
                className="flex size-11 shrink-0 items-center justify-center rounded-lg text-body hover:bg-slate-200 disabled:opacity-40 active:scale-95"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Desktop items layout (sm:grid) */}
            <div className="hidden sm:grid grid-cols-12 items-end gap-2">
              <Field label={<span className="text-muted">{t("Qty")}</span>} className="col-span-3">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className={cn(inputClass, "h-9 px-2 font-num text-xs")}
                  value={item.quantity}
                  onChange={(event) => update(item.id, { quantity: Math.max(0, Number(event.target.value)) })}
                />
              </Field>
              <Field label={<span className="text-muted">{t("Rate (DZD)")}</span>} className="col-span-5">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  className={cn(inputClass, "h-9 px-2 text-end font-num text-xs")}
                  value={item.unitPrice}
                  onChange={(event) => update(item.id, { unitPrice: Math.max(0, Number(event.target.value)) })}
                />
              </Field>
              <div className="col-span-4 flex flex-col items-end gap-1 pb-0.5">
                <span className="text-xs font-medium tracking-[0.02em] text-muted">{t("Line Total")}</span>
                <span className="font-num text-sm font-bold text-primary-ink">{t("{v1} DZD", { v1: formatAmount(lineTotal(item)) })}</span>
              </div>
            </div>

            {/* Mobile items stacked card (< sm) */}
            <div className="flex flex-col gap-2 sm:hidden pt-1">
              <div className="grid grid-cols-2 gap-2">
                <Field label={<span className="text-muted text-[11px]">{t("Quantity")}</span>}>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    className={cn(inputClass, "h-10 px-2 font-num")}
                    value={item.quantity}
                    onChange={(event) => update(item.id, { quantity: Math.max(0, Number(event.target.value)) })}
                  />
                </Field>
                <Field label={<span className="text-muted text-[11px]">{t("Unit Rate (DZD)")}</span>}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    className={cn(inputClass, "h-10 px-2 text-end font-num")}
                    value={item.unitPrice}
                    onChange={(event) => update(item.id, { unitPrice: Math.max(0, Number(event.target.value)) })}
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <span className="text-xs text-muted">{t("Line Total:")}</span>
                <span className="font-num text-base font-bold text-primary-ink">{t("{v1} DZD", { v1: formatAmount(lineTotal(item)) })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/30 bg-mint/30 py-2.5 text-xs font-bold text-accent hover:bg-mint/50 active:scale-95 transition-all"
      >
        <CirclePlus className="size-4" />
        {t("+ Add Item")}
      </button>
    </section>
  );
}

export function SummaryCard({ items }: { items: InvoiceItem[] }) {
  const { t, formatAmount } = useI18n();
  const total = subtotal(items);

  return (
    <section className={cardClass}>
      <CardHeader icon={WalletCards} title={t("Tax Exemption & Summary")} aside={<span className="text-xs font-medium tracking-[0.02em] text-teal">{t("TVA Non Applicable")}</span>} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between py-1 text-sm">
          <span className="text-body">{t("Subtotal (Montant HT)")}</span>
          <span className="font-num font-bold text-ink">{t("{v1} DZD", { v1: formatAmount(total) })}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-1 text-sm">
          <span className="flex items-center gap-1 text-body">
            {t("Value Added Tax (VAT / TVA)")}
            <Info className="size-3.5 text-muted" />
          </span>
          <span className="text-end font-num text-xs text-muted">{t("0.00 DZD (0% Statutory Exemption)")}</span>
        </div>
        <div className="mt-1 flex items-center justify-between rounded bg-mint/40 p-3">
          <span className="text-sm font-semibold text-primary-ink">{t("Total Payable (TTC)")}</span>
          <span className="font-num text-[28px] font-bold leading-9 tracking-[-0.02em] text-accent">{t("{v1} DZD", { v1: formatAmount(total) })}</span>
        </div>
      </div>
      <div className="flex gap-2 rounded bg-surface-low px-3 pb-3 pt-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
        <div>
          <p className="text-xs font-semibold tracking-[0.02em] text-primary-ink">{t("Statutory Exemption Clause")}</p>
          <p className="pt-0.5 text-xs leading-4 tracking-[0.01em] text-body">
            {t("Exempt from VAT pursuant to Algerian Law 22-23 and Executive Decree 23-197. Fiscal registration verified with ANAE.")}
          </p>
        </div>
      </div>
    </section>
  );
}
