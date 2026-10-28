"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Printer, RotateCcw, X } from "lucide-react";
import { QrMark } from "@/components/invoices/builder/qr-mark";
import { CreditNoteModal } from "@/components/invoices/credit-note-modal";
import { hashSeed } from "@/lib/hash";
import { printElementById } from "@/lib/print";
import { useI18n } from "@/lib/i18n/provider";
import type { InvoiceWithClient, User } from "@/types/models";

const fallbackUser: User = {
  id: "usr_1",
  firstName: "Sara",
  displayName: "Sara Benali",
  registration: "26-123456",
  fullName: "Sara Benali",
  profession: "Digital Consultant & Software Architect",
  activity: "Conseil en systèmes informatiques",
  nif: "123456789012345",
  city: "Alger Centre",
  phone: "0550 12 34 56",
  ceiling: 5000000,
  ifuRate: 0.005,
  email: "sara.benali@moukawil.dz",
  address: "Didouche Mourad, Alger",
  wilaya: "16 - Alger",
  postalCode: "16000",
  nis: "000216010123456",
  statutoryActivity: "Conseil en technologies de l'information",
  activityCode: "62.02",
  registeredAt: "2024-02-15",
  cardValidUntil: "2029-02-15",
  fiscalAuthority: "Inspection des Impôts d'Alger Centre",
  casnosVerifiedYear: 2026,
  certificateValidUntil: 2026,
  invoicePrefix: "FAC",
  nextInvoiceNumber: 1,
  paymentTermsDays: 30,
  appendExemptionClause: true,
  exemptionClause: "TVA non applicable - Art. 13 de la LFR 2023 / Art. 282 ter du CIDTA",
};

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
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const isCompany = invoice.client.type === "B2B";
  const hash = hashSeed(`${invoice.number}-${invoice.amount}`).toString(16).padStart(8, "0");

  const handlePrint = () => {
    printElementById("invoice-sheet", `Facture-${invoice.number}`);
  };

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="relative flex max-h-[96dvh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-y-auto">
          {/* Modal Controls (Hidden in Print) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-mint px-2 py-0.5 text-xs font-bold text-mint-ink">
                {t("Law 22-23 Certified")}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {t("Invoice Ref:")} #{invoice.number}
              </span>
              {invoice.creditNoteNumber && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  {t("Avoir:")} {invoice.creditNoteNumber}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {invoice.status !== "draft" && invoice.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => setShowCreditNoteModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-2xs active:scale-95 transition-all"
                >
                  <RotateCcw className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t("Issue Credit Note")}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handlePrint}
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
                  <p className="text-end text-2xl sm:text-3xl font-extrabold uppercase leading-7 text-black">
                    {t("COMMERCIAL")}
                    <br />
                    {t("INVOICE")}
                  </p>
                  <p className="pt-1.5 text-end text-[10px] font-medium uppercase text-slate-500">{t("Statutory Regime Law 22-23")}</p>
                  <p className="pt-0.5 text-end font-num text-xs font-semibold text-slate-900">{formatDate(invoice.issueDate)}</p>
                </div>
              </div>

              {/* Bill to panel */}
              <div className="flex items-start justify-between gap-6 bg-slate-50 border border-slate-200/80 p-4 sm:p-5">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase text-black">{t("Bill To (Client / Destinataire)")}</span>
                    <span className="whitespace-nowrap bg-black px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                      {isCompany ? t("B2B Corporate") : t("B2C Individual")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{invoice.client.name}</h3>
                  <p className="text-[11px] leading-4 text-slate-600">{invoice.client.address || invoice.client.location}</p>
                </div>
                {isCompany && (
                  <div className="flex flex-1 flex-col gap-1 text-[11px]">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-600">{t("Fiscal NIF:")}</span>
                      <span className="font-num font-bold text-slate-900">{invoice.client.nif || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-600">{t("Statistical NIS:")}</span>
                      <span className="font-num font-bold text-slate-900">{invoice.client.nis || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-600">{t("Trade Reg (RC):")}</span>
                      <span className="font-num font-bold text-slate-900">{invoice.client.rc || "—"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates & Reference info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-slate-200 py-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">{t("Invoice Number")}</span>
                  <p className="font-num font-bold text-slate-900 mt-0.5">{invoice.number}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">{t("Issue Date")}</span>
                  <p className="font-num text-slate-900 mt-0.5">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">{t("Due Date")}</span>
                  <p className="font-num text-slate-900 mt-0.5">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">{t("Payment Status")}</span>
                  <p className="font-semibold text-slate-900 mt-0.5 uppercase text-[11px]">
                    {invoice.creditNoteNumber ? t("Credited") : invoice.status}
                  </p>
                </div>
              </div>

              {/* Line items table */}
              <div className="flex flex-col">
                <table className="w-full text-start text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 text-start">{t("Description")}</th>
                      <th className="py-2.5 px-3 text-center">{t("Qty")}</th>
                      <th className="py-2.5 px-3 text-end">{t("Unit Price")}</th>
                      <th className="py-2.5 px-3 text-end">{t("Total (DZD)")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3 text-slate-900">
                        <p className="font-medium">{t("Prestation de services professionnels")}</p>
                        <p className="text-[10px] text-slate-500">{invoice.statutoryClause}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-num text-slate-700">1</td>
                      <td className="py-3 px-3 text-end font-num text-slate-700">{formatAmount(invoice.amount)}</td>
                      <td className="py-3 px-3 text-end font-num font-bold text-slate-900">{formatAmount(invoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals panel */}
              <div className="flex justify-end pt-2">
                <div className="flex w-full sm:w-72 flex-col gap-1.5 border-t border-slate-300 pt-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{t("Subtotal (Hors Taxe):")}</span>
                    <span className="font-num font-semibold text-slate-900">{formatAmount(invoice.amount)} DZD</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{t("VAT / TVA (0% Exonéré):")}</span>
                    <span className="font-num text-slate-900">0.00 DZD</span>
                  </div>
                  {invoice.creditedAmount ? (
                    <div className="flex justify-between text-amber-700 font-medium">
                      <span>{t("Credit Note (Avoir):")}</span>
                      <span className="font-num">-{formatAmount(invoice.creditedAmount)} DZD</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-extrabold text-slate-900">
                    <span>{t("Net Amount Due:")}</span>
                    <span className="font-num text-accent">
                      {formatAmount(Math.max(0, invoice.amount - (invoice.creditedAmount || 0)))} DZD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with QR Code & Electronic signature */}
            <div className="border-t border-slate-200 pt-6 mt-6">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-16 shrink-0 border border-slate-300 bg-white p-1">
                    <QrMark seed={hash} />
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

      {showCreditNoteModal && (
        <CreditNoteModal
          invoice={invoice}
          onClose={() => setShowCreditNoteModal(false)}
          onSuccess={() => {
            setShowCreditNoteModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
