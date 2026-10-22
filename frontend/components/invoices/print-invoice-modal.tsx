"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Download, Printer, X } from "lucide-react";
import { QrMark } from "@/components/invoices/builder/qr-mark";
import { hashSeed } from "@/lib/hash";
import { useI18n } from "@/lib/i18n/provider";
import type { InvoiceWithClient, User } from "@/types/models";

import db from "@/data/db.json";

const fallbackUser = db.users[0] as unknown as User;

interface PrintInvoiceModalProps {
  invoice: InvoiceWithClient;
  user?: User;
  onClose: () => void;
  autoPrint?: boolean;
}

export function PrintInvoiceModal({
  invoice,
  user = fallbackUser,
  onClose,
  autoPrint = false,
}: PrintInvoiceModalProps) {
  const { t, formatAmount, formatDate } = useI18n();
  const isCompany = invoice.client.type === "B2B";
  const hash = hashSeed(`${invoice.number}-${invoice.amount}`).toString(16).padStart(8, "0");

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative flex max-h-[96dvh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-y-auto">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-mint px-2 py-0.5 text-xs font-bold text-mint-ink">
              {t("Law 22-23 Certified")}
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {t("Invoice Ref:")} #{invoice.number}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-ink active:scale-95 transition-all"
            >
              <Printer className="size-3.5" />
              <span>{t("Print Invoice / Save PDF")}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("Close")}
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 active:scale-95"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* The Printable Sheet Target */}
        <div
          id="invoice-sheet"
          className="relative flex min-h-[900px] w-full flex-col justify-between border border-slate-200 bg-white p-8 sm:p-10 text-slate-900 shadow-sm"
        >
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Image src="/brand/monogram.png" alt="MoukawilOS" width={36} height={36} className="size-9 shrink-0" />
                  <div>
                    <h2 className="text-base font-extrabold uppercase leading-5 text-black">{user.fullName}</h2>
                    <p className="text-[10px] font-medium uppercase text-slate-500">{user.profession}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 text-[11px] text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">{t("ANAE Reg:")}</span> {user.registration}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">{t("Statutory NIF:")}</span> {user.nif}
                  </p>
                  <p>{t("{city}, Algeria • Phone: {phone}", { city: user.city, phone: user.phone })}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-end text-2xl sm:text-[30px] font-extrabold uppercase leading-8 text-black">
                  {t("COMMERCIAL")}
                  <br />
                  {t("INVOICE")}
                </p>
                <p className="pt-1 text-end text-[10px] font-medium uppercase text-slate-500">
                  {t("Statutory Regime Law 22-23")}
                </p>
                <p className="pt-0.5 text-end font-num text-[11px] font-semibold text-slate-900">
                  {formatDate(invoice.issueDate)}
                </p>
              </div>
            </div>

            {/* Bill to panel */}
            <div className="flex items-start justify-between gap-6 bg-slate-100 px-5 py-4 rounded-lg">
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-black">
                    {t("Bill To (Client / Destinataire)")}
                  </span>
                  <span className="whitespace-nowrap bg-black px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                    {isCompany ? t("B2B Corporate") : t("B2C Individual")}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{invoice.client.name}</h3>
                <p className="text-[11px] leading-4 text-slate-600">{invoice.client.address || invoice.client.location || t("Algeria")}</p>
              </div>
              {isCompany && (
                <div className="flex flex-1 flex-col gap-1 text-[11px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">{t("Fiscal NIF:")}</span>
                    <span className="font-num font-bold text-slate-900">{invoice.client.nif || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">{t("Statistical NIS:")}</span>
                    <span className="font-num font-bold text-slate-900">{invoice.client.nis || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">{t("Trade Reg (RC):")}</span>
                    <span className="font-num font-bold text-slate-900">{invoice.client.rc || "—"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[11px]">
              <p className="text-slate-600">
                {t("Issue Date:")} <span className="font-num font-semibold text-slate-900">{formatDate(invoice.issueDate)}</span>
                <span className="mx-3 text-slate-300">|</span>
                {t("Due Date:")} <span className="font-num font-semibold text-slate-900">{formatDate(invoice.dueDate)}</span>
              </p>
              <p className="font-num font-extrabold text-black">
                {t("Invoice Ref:")} #{invoice.number}
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
                <tr className="border-b border-slate-200 align-top">
                  <td className="px-2 py-3 font-num text-[11px] text-slate-500">1.</td>
                  <td className="px-2 py-3">
                    <p className="text-[11px] font-semibold text-slate-900">
                      {t("Prestation de services professionnels (Régime Auto-Entrepreneur)")}
                    </p>
                    <p className="pt-0.5 text-[10px] leading-4 text-slate-500">
                      {t("Compliant with Executive Decree 23-197 • Law 22-23 statutory regime")}
                    </p>
                  </td>
                  <td className="px-2 py-3 text-end font-num text-[11px] text-slate-900">{formatAmount(invoice.amount)}</td>
                  <td className="px-2 py-3 text-center font-num text-[11px] text-slate-900">1</td>
                  <td className="px-2 py-3 text-end font-num text-[11px] font-bold text-slate-900">{formatAmount(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-extrabold uppercase text-black">{t("Total Due")}</p>
                <p className="bg-slate-100 px-5 py-3 font-num text-2xl font-bold leading-7 text-black">
                  {t("{v1} DZD", { v1: formatAmount(invoice.amount) })}
                </p>
              </div>
              <div className="flex w-60 flex-col gap-1.5 text-[11px]">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-slate-600">{t("Subtotal (HT):")}</span>
                  <span className="font-num font-bold text-slate-900">{t("{v1} DZD", { v1: formatAmount(invoice.amount) })}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-600">{t("VAT / TVA:")}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-teal/10 px-1.5 py-0.5 text-[9px] font-bold text-teal">
                      {t("TVA Non-Assujetti (Art. 282 bis CIDTA)")}
                    </span>
                    <span className="font-num text-slate-900">{t("0.00 DZD")}</span>
                  </div>
                </div>
                <div className="flex justify-between gap-3 border-t-2 border-black pt-2 text-xs font-extrabold text-black">
                  <span className="uppercase">{t("Grand Total")}:</span>
                  <span className="font-num">{t("{v1} DZD", { v1: formatAmount(invoice.amount) })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 pt-10">
            <div className="flex items-end justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="size-20 shrink-0 border border-slate-300 bg-white p-1.5">
                  <QrMark seed={`${invoice.number}-${user.registration}`} />
                </div>
                <div className="text-[11px]">
                  <p className="font-extrabold uppercase leading-4 text-black">
                    {t("ANAE Digital")}
                    <br />
                    {t("Authenticity")}
                  </p>
                  <p className="text-slate-500">{t("Hash: {v1}...{v2}", { v1: hash.slice(0, 5), v2: hash.slice(-4) })}</p>
                  <p className="pt-1 font-bold text-slate-900">
                    {t("Verified Legal")}
                    <br />
                    {t("Signature")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-extrabold uppercase text-black">{t("Certified Electronic Signature")}</p>
                <p className="w-48 py-2 text-center text-xl italic text-black" style={{ fontFamily: "serif" }}>
                  {user.fullName}
                </p>
                <p className="border-t border-slate-300 pt-1 text-[10px] font-bold uppercase text-slate-700">
                  {t("Authorized Signatory • ANAE-ALG")}
                </p>
              </div>
            </div>
            <p className="border-t border-slate-300 pt-3 text-center text-[10px] leading-4 text-slate-500">
              {t("Invoice issued under the Algerian Auto-Entrepreneur statutory regime (Law 22-23) — TVA Non-Assujetti (Art. 282 bis CIDTA). Strictly exempt from Value Added Tax (VAT) pursuant to Executive Decree 23-197.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
