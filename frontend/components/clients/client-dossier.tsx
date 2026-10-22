"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Check, FileDown, FileText, Gavel, History, IdCard, Pencil, Printer, ShieldCheck, X } from "lucide-react";
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
  const { t, formatAmount, formatDate } = useI18n();
  const [showDossierPdf, setShowDossierPdf] = useState(false);
  const { client } = row;
  const business = client.type === "B2B";

  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
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

          <div className="flex flex-col gap-1.5 pt-1">
            <Link href={`/invoices/new?client=${client.id}`} className={buttonClass("primary", "justify-center rounded py-2.5")}>
              <FileText className="size-[15px]" />
              {t("Issue Commercial Invoice")}
            </Link>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setShowDossierPdf(true)}
                className={buttonClass("soft", "flex-1 justify-center rounded py-2 text-[12px] gap-1")}
              >
                <Printer className="size-3 text-accent" />
                {t("Print Dossier PDF")}
              </button>
              <button onClick={onEdit} className={buttonClass("soft", "flex-1 justify-center rounded py-2 text-[12px]")}>
                <Pencil className="size-3" />
                {t("Edit Record")}
              </button>
            </div>
            <Link href={`/invoices?q=${encodeURIComponent(client.name)}`} className="text-center text-[11px] text-muted hover:text-ink transition-colors py-0.5">
              {t("Audit Invoicing History in Ledger →")}
            </Link>
          </div>
        </div>
      </section>

      {/* Official Client Dossier PDF Sheet Modal */}
      {showDossierPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div
            id="receipt-voucher-sheet"
            className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-ink">
                  {t("ANAE Statutory Fiscal Record")}
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">{client.name}</h3>
                <p className="text-xs text-slate-500">{business ? t("B2B Corporate Entity") : t("B2C Individual Client")}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDossierPdf(false)}
                aria-label={t("Close")}
                className="no-print flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-1 flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-xs overflow-y-auto">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">{t("Tax Identification (NIF):")}</span>
                <span className="font-bold text-slate-900">{client.nif || "Exempt / Non-Applicable"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">{t("Trade Register (RC):")}</span>
                <span className="font-bold text-slate-900">{client.rc || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">{t("Statistical (NIS):")}</span>
                <span className="font-bold text-slate-900">{client.nis || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">{t("Location / Address:")}</span>
                <span className="font-bold text-slate-900">{client.location || client.address || "Algeria"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">{t("Total Invoiced to Date:")}</span>
                <span className="font-bold text-teal">{formatAmount(row.invoiced)} DZD</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">{t("Issued Records:")}</span>
                <span className="font-bold text-slate-900">{row.issued} invoices</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-[11px] text-emerald-800">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
              <span>{t("Compliance Verified: Qualified for 0% VAT invoicing under Law 22-23 statutory regime.")}</span>
            </div>

            <div className="no-print mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowDossierPdf(false)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                {t("Close")}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-ink transition-all"
              >
                <Printer className="size-3.5" />
                {t("Print / Save PDF")}
              </button>
            </div>
          </div>
        </div>
      )}

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
