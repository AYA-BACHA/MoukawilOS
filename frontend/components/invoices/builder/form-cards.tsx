import { Building2, CalendarDays, CirclePlus, Clock, FileText, Info, ListChecks, Lock, ShieldCheck, User, WalletCards, X } from "lucide-react";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { formatAmount, formatLongDate } from "@/lib/format";
import { addDays, lineTotal, paymentTerms, subtotal } from "@/lib/invoice-math";
import type { ClientType, DraftClient, InvoiceDraft, InvoiceItem } from "@/types/models";

const cardClass = "flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]";

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
  const isCompany = clientType === "B2B";

  return (
    <section className={cardClass}>
      <CardHeader icon={Building2} title="Client Classification" aside={<span className="rounded bg-surface-low px-1 py-0.5 text-xs font-medium tracking-[0.02em] text-body">Step 01</span>} />
      <div className="flex gap-1 rounded bg-surface-low p-1">
        {clientTypes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onTypeChange(value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-sm",
              clientType === value ? "bg-mint font-semibold text-primary shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : "font-medium text-body",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <Field label={isCompany ? "Company Legal Name (Raison Sociale)" : "Full Name"}>
          <input className={inputClass} value={client.name} onChange={(event) => onClientChange({ name: event.target.value })} />
        </Field>
        {isCompany && (
          <div className="grid grid-cols-3 gap-2">
            <Field label="NIF" hint="15 Digits">
              <input className={cn(inputClass, "h-9 px-2 font-num text-xs tracking-[0.05em]")} inputMode="numeric" maxLength={15} value={client.nif} onChange={(event) => onClientChange({ nif: event.target.value })} />
            </Field>
            <Field label="NIS" hint="13 Digits">
              <input className={cn(inputClass, "h-9 px-2 font-num text-xs tracking-[0.05em]")} inputMode="numeric" maxLength={13} value={client.nis} onChange={(event) => onClientChange({ nis: event.target.value })} />
            </Field>
            <Field label="RC Number" hint="Wilaya/Num">
              <input className={cn(inputClass, "h-9 px-2 font-num text-xs tracking-[0.05em]")} value={client.rc} onChange={(event) => onClientChange({ rc: event.target.value })} />
            </Field>
          </div>
        )}
        <Field label={isCompany ? "Statutory Business Address" : "Address"}>
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
  return (
    <section className={cardClass}>
      <CardHeader
        icon={FileText}
        title="Invoice Metadata"
        aside={
          <span className="flex items-center gap-1 rounded bg-surface-low px-1 py-0.5 font-num text-xs font-bold text-body">
            <Lock className="size-2.5" />
            {number}
          </span>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Issue Date">
          <span className="relative">
            <input type="date" className={cn(inputClass, "pr-10")} value={issueDate} onChange={(event) => onChange({ issueDate: event.target.value })} />
            <CalendarDays className="pointer-events-none absolute right-3 top-2.5 size-[15px] bg-white text-body" />
          </span>
        </Field>
        <Field label="Payment Terms">
          <span className="relative">
            <select className={cn(inputClass, "appearance-none truncate pr-10")} value={paymentTermsDays} onChange={(event) => onChange({ paymentTermsDays: Number(event.target.value) })}>
              {paymentTerms.map(({ days, label }) => (
                <option key={days} value={days}>
                  {label} (Due: {formatLongDate(addDays(issueDate, days))})
                </option>
              ))}
            </select>
            <Clock className="pointer-events-none absolute right-3 top-2.5 size-[15px] text-body" />
          </span>
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
  const update = (id: string, patch: Partial<InvoiceItem>) => onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));
  const add = () => onChange([...items, { id: crypto.randomUUID(), description: "", details: null, quantity: 1, unitPrice: 0 }]);

  return (
    <section className={cardClass}>
      <CardHeader icon={ListChecks} title="Itemized Deliverables" aside={<span className="text-xs font-medium tracking-[0.02em] text-muted">DZD Denominated</span>} />
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 rounded bg-surface-low p-3">
            <div className="flex items-center gap-2">
              <input
                className={cn(inputClass, "h-9 px-2")}
                placeholder="Deliverable description"
                value={item.description}
                onChange={(event) => update(item.id, { description: event.target.value })}
              />
              <button aria-label="Remove item" onClick={() => remove(item.id)} disabled={items.length === 1} className="p-1 text-body disabled:opacity-40">
                <X className="size-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-12 items-end gap-2">
              <Field label={<span className="text-muted">Qty</span>} className="col-span-3">
                <input
                  type="number"
                  min={1}
                  className={cn(inputClass, "h-8 px-2 font-num text-xs")}
                  value={item.quantity}
                  onChange={(event) => update(item.id, { quantity: Math.max(0, Number(event.target.value)) })}
                />
              </Field>
              <Field label={<span className="text-muted">Rate (DZD)</span>} className="col-span-5">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={cn(inputClass, "h-8 px-2 text-right font-num text-xs")}
                  value={item.unitPrice}
                  onChange={(event) => update(item.id, { unitPrice: Math.max(0, Number(event.target.value)) })}
                />
              </Field>
              <div className="col-span-4 flex flex-col items-end gap-1 pb-0.5">
                <span className="text-xs font-medium tracking-[0.02em] text-muted">Line Total</span>
                <span className="font-num text-sm font-bold text-primary-ink">{formatAmount(lineTotal(item))} DZD</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center justify-center gap-1 rounded bg-surface-low py-2.5 text-sm font-semibold text-primary">
        <CirclePlus className="size-[15px]" />+ Add Item
      </button>
    </section>
  );
}

export function SummaryCard({ items }: { items: InvoiceItem[] }) {
  const total = subtotal(items);

  return (
    <section className={cardClass}>
      <CardHeader icon={WalletCards} title="Tax Exemption & Summary" aside={<span className="text-xs font-medium tracking-[0.02em] text-teal">TVA Non Applicable</span>} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between py-1 text-sm">
          <span className="text-body">Subtotal (Montant HT)</span>
          <span className="font-num font-bold text-ink">{formatAmount(total)} DZD</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-1 text-sm">
          <span className="flex items-center gap-1 text-body">
            Value Added Tax (VAT / TVA)
            <Info className="size-3.5 text-muted" />
          </span>
          <span className="text-right font-num text-xs text-muted">0.00 DZD (0% Statutory Exemption)</span>
        </div>
        <div className="mt-1 flex items-center justify-between rounded bg-mint/40 p-3">
          <span className="text-sm font-semibold text-primary-ink">Total Payable (TTC)</span>
          <span className="font-num text-[28px] font-bold leading-9 tracking-[-0.02em] text-primary">{formatAmount(total)} DZD</span>
        </div>
      </div>
      <div className="flex gap-2 rounded bg-surface-low px-3 pb-3 pt-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-semibold tracking-[0.02em] text-primary-ink">Statutory Exemption Clause</p>
          <p className="pt-0.5 text-xs leading-4 tracking-[0.01em] text-body">
            Exempt from VAT pursuant to Algerian Law 22-23 and Executive Decree 23-197. Fiscal registration verified with ANAE.
          </p>
        </div>
      </div>
    </section>
  );
}
