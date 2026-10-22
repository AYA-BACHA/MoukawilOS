"use client";

import { useState } from "react";
import { Printer, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { QrMark } from "@/components/invoices/builder/qr-mark";
import Image from "next/image";

import { hashSeed } from "@/lib/hash";
import { addDays, lineTotal, subtotal } from "@/lib/invoice-math";
import type { InvoiceDraft, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

const toolButton = "rounded bg-card p-1.5 text-body shadow-[0_1px_1px_rgba(0,0,0,0.05)] disabled:opacity-40";
const SCALES = [0.6, 0.7, 0.8, 0.9, 1];

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

      <div id="invoice-sheet" style={{ zoom: scale }} className="relative flex min-h-[1040px] max-w-[820px] flex-col justify-between border border-slate-200 bg-white p-12 text-ink shadow-xl">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Image src="/brand/monogram.png" alt="MoukawilOS" width={40} height={40} className="size-10 shrink-0" />
                <div>
                  <h2 className="text-base font-extrabold uppercase leading-5 text-black">{user.fullName}</h2>
                  <p className="text-[10px] font-medium uppercase text-muted">{user.profession}</p>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 text-[11px] text-body">
                <p>
                  <span className="font-semibold text-ink">{t("ANAE Reg:")}</span> {user.registration}
                </p>
                <p>
                  <span className="font-semibold text-ink">{t("Statutory NIF:")}</span> {user.nif}
                </p>
                <p>{t("{city}, Algeria • Phone: {phone}", { city: user.city, phone: user.phone })}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-end text-[34px] font-extrabold uppercase leading-9 text-black">
                {t("COMMERCIAL")}
                <br />
                {t("INVOICE")}
              </p>
              <p className="pt-1.5 text-end text-[10px] font-medium uppercase text-muted">{t("Statutory Regime Law 22-23")}</p>
              <p className="pt-0.5 text-end font-num text-[11px] font-semibold text-ink">{formatDate(draft.issueDate)}</p>
            </div>
          </div>

          {/* Bill to panel */}
          <div className="flex items-start justify-between gap-6 bg-slate-100 px-6 py-5">
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase text-black">{t("Bill To (Client / Destinataire)")}</span>
                <span className="whitespace-nowrap bg-black px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">{isCompany ? t("B2B Corporate") : t("B2C Individual")}</span>
              </div>
              <h3 className="text-sm font-bold text-ink">{draft.client.name || t("Client name")}</h3>
              <p className="text-[11px] leading-4 text-body">{draft.client.address || t("Client address")}</p>
            </div>
            {isCompany && (
              <div className="flex flex-1 flex-col gap-1 text-[11px]">
                <div className="flex justify-between gap-3">
                  <span className="text-body">{t("Fiscal NIF:")}</span>
                  <span className="font-num font-bold text-ink">{draft.client.nif || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-body">{t("Statistical NIS:")}</span>
                  <span className="font-num font-bold text-ink">{draft.client.nis || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-body">{t("Trade Reg (RC):")}</span>
                  <span className="font-num font-bold text-ink">{draft.client.rc || "—"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-[11px]">
            <p className="text-body">
              {t("Issue Date:")} <span className="font-num font-semibold text-ink">{formatDate(draft.issueDate)}</span>
              <span className="mx-3 text-slate-300">|</span>
              {t("Due Date:")} <span className="font-num font-semibold text-ink">{formatDate(dueDate)}</span>
            </p>
            <p className="font-num font-extrabold text-black">
              {t("Invoice Ref:")} #{draft.number}
            </p>
          </div>

          {/* Items */}
          <table className="w-full text-start">
            <thead>
              <tr className="border-b-2 border-black text-[10px] font-extrabold uppercase text-black">
                <th className="w-10 px-2 py-2 text-start">{t("No.")}</th>
                <th className="px-2 py-2 text-start">{t("Deliverable Description")}</th>
                <th className="px-2 py-2 text-end">{t("Unit Price")}</th>
                <th className="px-2 py-2 text-center">{t("Qty")}</th>
                <th className="px-2 py-2 text-end">{t("Amount (DZD)")}</th>
              </tr>
            </thead>
            <tbody>
              {draft.items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-200 align-top">
                  <td className="px-2 py-3 font-num text-[11px] text-body">{index + 1}.</td>
                  <td className="max-w-64 px-2 py-3">
                    <p className="text-[11px] font-semibold text-ink">{item.description || t("Deliverable description")}</p>
                    {item.details && <p className="pt-0.5 text-[10px] leading-4 text-muted">{item.details}</p>}
                  </td>
                  <td className="px-2 py-3 text-end font-num text-[11px] text-ink">{formatAmount(item.unitPrice)}</td>
                  <td className="px-2 py-3 text-center font-num text-[11px] text-ink">{item.quantity}</td>
                  <td className="px-2 py-3 text-end font-num text-[11px] font-bold text-ink">{formatAmount(lineTotal(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-extrabold uppercase text-black">{t("Total Due")}</p>
              <p className="bg-slate-100 px-5 py-3 font-num text-[26px] font-bold leading-8 text-black">{t("{v1} DZD", { v1: formatAmount(total) })}</p>
            </div>
            <div className="flex w-56 flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between gap-3">
                <span className="font-semibold text-body">{t("Subtotal (HT):")}</span>
                <span className="font-num font-bold text-ink">{t("{v1} DZD", { v1: formatAmount(total) })}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-body">{t("VAT / TVA:")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-teal/10 px-1.5 py-0.5 text-[9px] font-bold text-teal">
                    {t("TVA Non-Assujetti (Art. 282 bis CIDTA)")}
                  </span>
                  <span className="font-num text-ink">{t("0.00 DZD")}</span>
                </div>
              </div>
              <div className="flex justify-between gap-3 border-t-2 border-black pt-2 text-xs font-extrabold text-black">
                <span className="uppercase">{t("Grand Total")}:</span>
                <span className="font-num">{t("{v1} DZD", { v1: formatAmount(total) })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 pt-10">
          <div className="flex items-end justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="size-20 shrink-0 border border-slate-300 bg-white p-1.5">
                <QrMark seed={`${draft.number}-${user.registration}`} />
              </div>
              <div className="text-[11px]">
                <p className="font-extrabold uppercase leading-4 text-black">
                  {t("ANAE Digital")}
                  <br />
                  {t("Authenticity")}
                </p>
                <p className="text-body">{t("Hash: {v1}...{v2}", { v1: hash.slice(0, 5), v2: hash.slice(-4) })}</p>
                <p className="pt-1 font-bold text-ink">
                  {t("Verified Legal")}
                  <br />
                  {t("Signature")}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-extrabold uppercase text-black">{t("Certified Electronic Signature")}</p>
              <p className="w-48 py-2 text-center text-xl italic text-black" style={{ fontFamily: "var(--font-tinos), serif" }}>
                {user.fullName}
              </p>
              <p className="border-t border-slate-300 pt-1 text-[10px] font-bold uppercase text-ink">{t("Authorized Signatory • ANAE-ALG")}</p>
            </div>
          </div>
          <p className="border-t border-slate-300 pt-3 text-center text-[10px] leading-4 text-body">
            {t("Invoice issued under the Algerian Auto-Entrepreneur statutory regime (Law 22-23) — TVA Non-Assujetti (Art. 282 bis CIDTA). Strictly exempt from Value Added Tax (VAT) pursuant to Executive Decree 23-197.")}
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
