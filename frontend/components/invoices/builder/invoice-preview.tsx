"use client";

import { useState } from "react";
import { BadgeCheck, Printer, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { QrMark } from "@/components/invoices/builder/qr-mark";
import { cn } from "@/lib/cn";

import { hashSeed } from "@/lib/hash";
import { addDays, lineTotal, subtotal } from "@/lib/invoice-math";
import type { InvoiceDraft, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const toolButton = "rounded bg-card p-1.5 text-body shadow-[0_1px_1px_rgba(0,0,0,0.05)] disabled:opacity-40";
const SCALES = [0.6, 0.7, 0.8, 0.9, 1];

function Row({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#707977]">{label}</span>
      <span className={cn("font-num text-ink", bold && "font-bold")}>{value}</span>
    </div>
  );
}

export function InvoicePreview({ user, draft }: { user: User; draft: InvoiceDraft }) {
  const { t, formatAmount, formatDate } = useI18n();
  const [scaleIndex, setScaleIndex] = useState(SCALES.length - 1);
  const scale = SCALES[scaleIndex];
  const total = subtotal(draft.items);
  const dueDate = addDays(draft.issueDate, draft.paymentTermsDays);
  const isCompany = draft.clientType === "B2B";
  const hash = hashSeed(`${draft.number}-${total}`).toString(16).padStart(8, "0");

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{t("Legal Document Preview")}</span>
          <span className="rounded bg-surface px-1 py-0.5 font-num text-xs text-muted">{t("A4 • {v1}% Scale", { v1: Math.round(scale * 100) })}</span>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label={t("Zoom in")} disabled={scaleIndex === SCALES.length - 1} onClick={() => setScaleIndex(scaleIndex + 1)} className={toolButton}>
            <ZoomIn className="size-3.5" />
          </button>
          <button aria-label={t("Zoom out")} disabled={scaleIndex === 0} onClick={() => setScaleIndex(scaleIndex - 1)} className={toolButton}>
            <ZoomOut className="size-3.5" />
          </button>
          <button aria-label={t("Print")} onClick={() => window.print()} className={toolButton}>
            <Printer className="size-3.5" />
          </button>
        </div>
      </div>

      <div id="invoice-sheet" style={{ zoom: scale }} className="relative flex min-h-[1040px] max-w-[820px] flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-12 shadow-xl">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex items-start justify-between pb-4">
            <div className="flex w-56 flex-col gap-1">
              <div className="flex items-center gap-2 pb-2">
                <span className="grid h-9 w-7 shrink-0 place-items-center rounded bg-primary text-base font-bold text-white">{t("M")}</span>
                <div>
                  <h2 className="text-xl font-bold leading-[25px] tracking-[-0.025em] text-ink">{user.fullName}</h2>
                  <p className="text-xs font-medium uppercase tracking-[0.05em] text-teal">{user.profession}</p>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 pt-1 text-xs tracking-[0.01em] text-body">
                <p>
                  <span className="font-semibold text-ink">{t("ANAE Reg:")}</span> {user.registration}
                </p>
                <p>
                  <span className="font-semibold text-ink">{t("Statutory NIF:")}</span> {user.nif}
                </p>
                <p>
                  {t("{city}, Algeria • Phone: {phone}", { city: user.city, phone: user.phone })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="ps-10 text-end font-num text-[28px] font-bold leading-9 tracking-[-0.025em] text-accent">
                {t("COMMERCIAL")}
                <br />
                {t("INVOICE")}
              </p>
              <p className="pt-0.5 text-end text-xs font-medium uppercase tracking-[0.05em] text-muted">{t("Statutory Regime Law 22-23")}</p>
              <div className="mt-3 flex min-w-[200px] flex-col gap-1 rounded bg-surface-low p-2 text-xs tracking-[0.01em]">
                <Row label={t("Invoice Ref:")} value={`#${draft.number}`} bold />
                <Row label={t("Issue Date:")} value={formatDate(draft.issueDate)} />
                <Row label={t("Due Date:")} value={formatDate(dueDate)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg bg-surface-low p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.05em] text-muted">{t("Bill To (Client / Destinataire)")}</span>
              <span className="rounded bg-mint px-1 py-0.5 text-xs font-semibold tracking-[0.02em] text-mint-ink">{isCompany ? t("B2B Corporate") : t("B2C Individual")}</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-1 pb-3">
                <h3 className="text-lg font-bold leading-6 tracking-[-0.01em] text-ink">{draft.client.name || t("Client name")}</h3>
                <p className="pt-1 text-xs tracking-[0.01em] text-body">{draft.client.address || t("Client address")}</p>
              </div>
              {isCompany && (
                <div className="flex flex-1 flex-col gap-1 rounded bg-white/80 p-2 text-xs tracking-[0.01em]">
                  <Row label={t("Fiscal NIF:")} value={draft.client.nif || "—"} bold />
                  <Row label={t("Statistical NIS:")} value={draft.client.nis || "—"} bold />
                  <Row label={t("Trade Reg (RC):")} value={draft.client.rc || "—"} bold />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <table className="w-full text-start">
              <thead className="bg-surface-low text-xs font-semibold uppercase tracking-[0.05em] text-body">
                <tr>
                  <th className="px-3 py-2.5">{t("Deliverable Description")}</th>
                  <th className="px-2 py-2.5 text-center">{t("Qty")}</th>
                  <th className="px-3 py-2.5 text-end">{t("Unit Price")}</th>
                  <th className="px-3 py-2.5 text-end">{t("Amount (DZD)")}</th>
                </tr>
              </thead>
              <tbody>
                {draft.items.map((item) => (
                  <tr key={item.id} className="border-t border-surface-low align-top first:border-t-0">
                    <td className="max-w-64 px-3 py-3">
                      <p className="text-xs font-semibold tracking-[0.01em] text-ink">{item.description || t("Deliverable description")}</p>
                      {item.details && <p className="pt-0.5 text-xs tracking-[0.01em] text-muted">{item.details}</p>}
                    </td>
                    <td className="px-2 py-3 text-center font-num text-xs text-ink">{item.quantity}</td>
                    <td className="px-3 py-3 text-end font-num text-xs text-ink">{formatAmount(item.unitPrice)}</td>
                    <td className="px-3 py-3 text-end font-num text-xs font-bold text-primary-ink">{formatAmount(lineTotal(item))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-start justify-between gap-6 pt-2">
            <div className="flex w-60 flex-col gap-1 rounded bg-surface-low p-3">
              <p className="flex items-center gap-1 text-xs font-bold tracking-[0.02em] text-primary-ink">
                <BadgeCheck className="size-3.5 shrink-0" />
                {t("Statutory VAT Exemption (0% TVA)")}
              </p>
              <p className="text-xs leading-4 tracking-[0.01em] text-body">
                {t("Invoice issued by an accredited Auto-Entrepreneur under Algerian Law 22-23. In accordance with Executive Decree 23-197, services provided under this regime are exempted from Value Added Tax (TVA).")}
              </p>
              <p className="pt-1 font-num text-xs text-muted">{t("Tax Basis: Exonération Art. 13 LF / Régime Auto-Entrepreneur")}</p>
            </div>
            <div className="flex w-52 flex-col gap-2">
              <div className="flex items-center justify-between gap-2 py-1">
                <span className="text-xs tracking-[0.01em] text-body">{t("Subtotal (HT):")}</span>
                <span className="font-num text-sm font-bold text-ink">{t("{v1} DZD", { v1: formatAmount(total) })}</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1">
                <span className="text-xs tracking-[0.01em] text-body">{t("VAT / TVA (0%):")}</span>
                <span className="font-num text-xs text-muted">{t("0.00 DZD")}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 rounded bg-mint p-3">
                <span className="text-lg font-bold leading-6 tracking-[-0.01em] text-primary-ink">
                  {t("Total")}
                  <br />
                  {t("Due:")}
                </span>
                <span className="text-end font-num text-[28px] font-bold leading-9 tracking-[-0.02em] text-accent">
                  {formatAmount(total)}
                  <br />
                  {t("DZD")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8">
          <div className="flex items-end gap-4 pb-4">
            <div className="flex flex-1 items-center gap-3 rounded bg-surface-low p-2">
              <div className="size-20 shrink-0 rounded bg-white p-1.5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <QrMark seed={`${draft.number}-${user.registration}`} />
              </div>
              <div className="text-xs tracking-[0.01em]">
                <p className="font-bold leading-4 text-ink">
                  {t("ANAE Digital")}
                  <br />
                  {t("Authenticity")}
                </p>
                <p className="text-body">
                  {t("Hash: {v1}...{v2}", { v1: hash.slice(0, 5), v2: hash.slice(-4) })}
                </p>
                <p className="pt-1 font-num font-bold text-teal">
                  {t("Verified Legal")}
                  <br />
                  {t("Signature")}
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-end">
              <p className="pb-4 text-xs font-medium tracking-[0.02em] text-muted">{t("Certified Electronic Signature")}</p>
              <p className="w-48 py-1 text-center font-num text-sm font-bold italic text-primary-ink">{user.fullName}</p>
              <p className="pt-1 font-num text-xs text-muted">{t("Authorized Signatory • ANAE-ALG")}</p>
            </div>
          </div>
          <p className="rounded bg-surface-low px-2 py-2 text-center text-xs leading-[19.5px] tracking-[0.01em] text-body">
            {t("Invoice issued under the Algerian Auto-Entrepreneur statutory regime (Law 22-23) — Strictly exempt from Value Added Tax (VAT) pursuant to Executive Decree 23-197.")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 text-xs font-medium tracking-[0.02em] text-body">
        <span className="flex items-center gap-1">
          <RefreshCw className="size-3.5" />
          {t("Real-time Live Sync Active")}
        </span>
        <span>•</span>
        <span>{t("Format: DIN 476 / ISO 216 A4")}</span>
        <span>•</span>
        <span>{t("Render Engine: v2.4-dzd")}</span>
      </div>
    </div>
  );
}
