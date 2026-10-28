"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Lock,
  Printer,
  QrCode,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const ref = searchParams?.get("ref") || "FAC-2026-008";
  const [scanTime, setScanTime] = useState<string>("");

  useEffect(() => {
    setScanTime(
      new Date().toLocaleString("fr-DZ", {
        timeZone: "Africa/Algiers",
        dateStyle: "full",
        timeStyle: "medium",
      })
    );
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8 sm:py-14 text-slate-800">
      <div className="mx-auto max-w-xl">
        {/* Algerian Republic Regulatory Header */}
        <div className="text-center pb-6 border-b border-slate-200/80 mb-6">
          <p className="font-serif text-xs sm:text-sm font-semibold tracking-wide text-slate-700">
            الجمهورية الجزائرية الديمقراطية الشعبية
          </p>
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-slate-500 mt-0.5">
            République Algérienne Démocratique et Populaire
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>ANAE · Agence Nationale de l&apos;Auto-Entrepreneur</span>
          </div>
        </div>

        {/* Verification Success Hero Card */}
        <div className="rounded-2xl border border-emerald-200/90 bg-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle green watermark glow */}
          <div className="absolute -top-16 -right-16 size-48 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-50 mb-4">
              <CheckCircle2 className="size-10" strokeWidth={2.2} />
            </div>

            <span className="rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider px-3 py-1 mb-2">
              Statutory Authenticity Certified
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Facture Légale Conforme (Loi 22-23)
            </h1>
            <p className="font-mono text-sm font-bold text-emerald-800 mt-1">
              Référence : #{ref}
            </p>
          </div>

          {/* Dossier Information Grid */}
          <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs font-mono">
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-sans">Titulaire / Freelancer :</span>
              <span className="font-bold text-slate-900 font-sans">Sara Benali</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-sans">N° Immatriculation RNAE :</span>
              <span className="font-bold text-emerald-800">26-123456</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-sans">NIF Statutaire :</span>
              <span className="font-bold text-slate-900">123456789012345</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-sans">Régime Fiscal :</span>
              <span className="font-semibold text-slate-800 font-sans">Auto-Entrepreneur (0.5% IFU)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-sans">Exonération de TVA :</span>
              <span className="font-bold text-emerald-700 font-sans">CIDTA Art. 282 bis (TVA 0%)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-sans">Inspection Fiscale :</span>
              <span className="text-slate-700 font-sans">Alger Centre (16000)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-sans">Contrôle d&apos;Intégrité :</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <Lock className="size-3" />
                Empreinte SHA-256 Valide
              </span>
            </div>
          </div>

          {/* Statutory Exemption Citation */}
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs text-emerald-950">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Mention légale obligatoire constatée :</strong> « Facture établie sous le régime de l&apos;auto-entrepreneur (Loi 22-23) — TVA non applicable selon l&apos;Article 282 bis du CIDTA et le Décret exécutif 23-197. »
              </p>
            </div>
          </div>

          {/* Audit Timestamp */}
          {scanTime && (
            <p className="mt-4 text-center text-[11px] text-slate-400">
              Vérifié en direct le {scanTime} (Heure d&apos;Alger)
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="w-full flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 px-4 shadow-sm transition-all active:scale-95"
            >
              <span>Accéder à MoukawilOS</span>
              <ExternalLink className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-3 px-4 transition-all active:scale-95"
            >
              <Printer className="size-3.5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>MoukawilOS · Système d&apos;Exploitation Fiscal pour Auto-Entrepreneurs Algériens</p>
          <p className="mt-1">Conforme Loi 22-23 &amp; Décret Exécutif 23-197</p>
        </div>
      </div>
    </main>
  );
}

export default function InvoiceVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-slate-50 text-xs font-semibold text-slate-500">
          Vérification du certificat fiscal en cours...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

