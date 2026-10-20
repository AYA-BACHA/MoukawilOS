"use client";

import Link from "next/link";
import { BadgeCheck, FileText, Gavel, History, IdCard, Pencil } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import type { ClientRow } from "@/lib/clients";
import { useI18n } from "@/lib/i18n/provider";

function Box({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-sm bg-card p-2", className)}>
      <p className="text-[10px] uppercase leading-4 text-muted">{label}</p>
      <p className="font-num text-xs font-bold leading-4 text-ink">{value}</p>
    </div>
  );
}

export function ClientDossier({ row, onEdit }: { row: ClientRow; onEdit: () => void }) {
  const { t, formatAmount } = useI18n();
  const { client } = row;
  const business = client.type === "B2B";

  return (
    <div className="col-span-4 flex flex-col gap-3">
      <section className="flex flex-col gap-3 overflow-hidden rounded-lg bg-card pb-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-2 bg-surface-low px-4 pb-2 pt-3">
          <h2 className="flex items-center gap-1 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-primary-ink">
            <IdCard className="size-[15px] shrink-0" />
            {t("Client inspection dossier")}
          </h2>
          <span className="shrink-0 rounded bg-mint px-2 py-0.5 text-xs font-medium tracking-[0.02em] text-mint-ink">{business ? t("B2B Corporate") : t("B2C Individual")}</span>
        </div>
        <div className="flex flex-col gap-3 px-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-semibold leading-7 tracking-[-0.025em] text-ink">{client.name}</h3>
            <p className="text-xs tracking-[0.01em] text-body">{client.location}</p>
          </div>

          <div className="flex flex-col gap-1 rounded bg-surface-low p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.02em] text-ink">{business ? t("National Tax Identifiers") : t("Consumer Identification")}</p>
              <p className="flex items-center gap-0.5 text-[11px] font-semibold tracking-[0.02em] text-primary-ink">
                <BadgeCheck className="size-3" />
                {t("Validated")}
              </p>
            </div>
            {business ? (
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex gap-1">
                  <Box className="flex-1" label={t("Tax number (NIF)")} value={client.nif ?? "—"} />
                  <Box className="flex-1" label={t("Trade register (RC)")} value={client.rc ?? "—"} />
                </div>
                <div className="flex items-center justify-between rounded-sm bg-card p-2">
                  <p className="text-[10px] uppercase text-muted">{t("Statistical number (NIS)")}</p>
                  <p className="font-num text-xs text-ink">{client.nis ?? "—"}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-1 pt-1">
                <Box className="flex-1" label={t("Identification")} value="Resident Consumer" />
                <Box className="flex-1" label={t("Tax treatment")} value="Exempt (Article 4)" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 rounded bg-surface p-3">
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-body">{t("Lifetime commercial invoicing")}</p>
            <p className="flex items-baseline gap-1 font-num">
              <span className="text-[28px] font-bold leading-9 tracking-[-0.02em] text-primary-ink">{formatAmount(row.invoiced)}</span>
              <span className="text-xs text-body">{t("DZD")}</span>
            </p>
            <p className="pt-1 text-xs font-medium tracking-[0.02em] text-body">
              {t("Statutory VAT Rate:")} <span className="font-semibold text-primary-ink">{t("0% (Law 22-23 Exemption)")}</span>
            </p>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <Link href={`/invoices/new?client=${client.id}`} className={buttonClass("primary", "justify-center rounded py-2.5")}>
              <FileText className="size-[15px]" />
              {t("Issue Commercial Invoice")}
            </Link>
            <div className="flex gap-1">
              <Link href={`/invoices?q=${encodeURIComponent(client.name)}`} className={buttonClass("soft", "flex-1 justify-center rounded py-2 text-[12px]")}>
                <History className="size-3" />
                {t("Audit Ledger")}
              </Link>
              <button onClick={onEdit} className={buttonClass("soft", "flex-1 justify-center rounded py-2 text-[12px]")}>
                <Pencil className="size-3" />
                {t("Edit Record")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex gap-3 rounded-lg bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <span className="grid size-8 shrink-0 place-items-center rounded bg-mint text-accent">
          <Gavel className="size-4" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">{t("Law 22-23 Validation Standard")}</h3>
          <p className="pt-1 text-xs leading-[19.5px] tracking-[0.01em] text-body">
            {t("Commercial invoicing to Algerian corporate bodies requires a validated 15-digit Tax Identification Number (NIF) to preserve statutory single-tax treatment and 0% VAT exemption status.")}
          </p>
        </div>
      </section>
    </div>
  );
}
