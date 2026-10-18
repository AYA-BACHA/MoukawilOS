"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Calculator,
  CheckCircle2,
  FileCheck2,
  Percent,
  Scale,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { formatAmount } from "@/lib/format";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    {
      id: "ceiling",
      icon: Banknote,
      tag: "Statutory Rule 01",
      title: "5,000,000 DZD Annual Turnover Ceiling",
      lawRef: "Law 22-23 (December 18, 2022) • Art. 2",
      description:
        "As an Algerian auto-entrepreneur, you are entitled to collect up to 5 Million DZD per fiscal year without forming a heavy commercial entity. You can sustain this status for up to 3 consecutive fiscal years before any mandatory transition.",
      demo: (
        <div className="rounded-xl border border-slate-200/90 bg-slate-50 p-4">
          <div className="flex justify-between text-xs font-semibold text-slate-800">
            <span>Collected: 2,000,000 DZD (40%)</span>
            <span>Statutory Cap: 5,000,000 DZD</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[40%] rounded-full bg-primary" />
          </div>
          <p className="mt-2 text-[11px] text-muted">
            3,000,000 DZD remaining capacity. MoukawilOS alerts you before you approach 90%.
          </p>
        </div>
      ),
    },
    {
      id: "cash-basis",
      icon: FileCheck2,
      tag: "Statutory Rule 02",
      title: "Cash-Basis Accounting (Comptabilité d'Encaissement)",
      lawRef: "Executive Decree 23-197 • Art. 13",
      description:
        "Unlike standard corporations that pay taxes on invoices issued (accrual accounting), your auto-entrepreneur status strictly operates on cash receipts. Unpaid client invoices NEVER count toward your ceiling or tax bill until they are settled into your bank or CCP.",
      demo: (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <span className="font-bold text-emerald-800">Cashed Receipts</span>
            <p className="font-num text-sm font-extrabold text-emerald-900 mt-1">2,000,000 DZD</p>
            <p className="text-[10px] text-emerald-700 mt-1">Counts toward ceiling &amp; IFU tax.</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
            <span className="font-bold text-amber-800">Pending Receivables</span>
            <p className="font-num text-sm font-extrabold text-amber-900 mt-1">1,650,000 DZD</p>
            <p className="text-[10px] text-amber-700 mt-1">Strictly exempt until cleared.</p>
          </div>
        </div>
      ),
    },
    {
      id: "ifu-tax",
      icon: Calculator,
      tag: "Statutory Rule 03",
      title: "How Your Tax is Calculated (0.5% Flat IFU)",
      lawRef: "Code des Impôts Directs • Formulaire G50-A",
      description:
        "Your sole tax obligation is the Impôt Forfaitaire Unique (IFU) at an ultra-low rate of 0.5% on collected turnover. You declare this once a year using official form G50-A before June 30th directly to your tax inspection.",
      demo: (
        <div className="rounded-xl border border-slate-200/90 bg-slate-50 p-4 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-600">Collected Turnover:</span>
            <span className="font-bold text-slate-900 font-num">2,000,000.00 DZD</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-600">Flat IFU Rate:</span>
            <span className="font-bold text-emerald-700 font-num">× 0.5 %</span>
          </div>
          <div className="flex justify-between pt-2 text-sm font-bold">
            <span className="text-slate-900">Total Tax Due for FY 2026:</span>
            <span className="text-accent font-num">10,000.00 DZD</span>
          </div>
        </div>
      ),
    },
    {
      id: "vat-exemption",
      icon: Percent,
      tag: "Statutory Rule 04",
      title: "Permanent 0% VAT Exemption (Exonération TVA)",
      lawRef: "Law 22-23 • Article 6",
      description:
        "Auto-entrepreneurs are completely legally exempt from VAT. You do not collect TVA, and you do not file monthly tax returns. Every invoice you issue in MoukawilOS automatically embeds the statutory exemption clause for B2B enterprise clients.",
      demo: (
        <div className="rounded-xl border border-slate-200 bg-card p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Automated Invoice Clause:</p>
          <p className="mt-1.5 rounded-lg bg-surface-low p-2 text-xs font-medium text-slate-800 border border-slate-200/70">
            « Exonéré de la TVA conformément aux dispositions de l&apos;Article 6 de la Loi n° 22-23 portant statut de l&apos;auto-entrepreneur. »
          </p>
        </div>
      ),
    },
    {
      id: "casnos",
      icon: ShieldCheck,
      tag: "Statutory Rule 05",
      title: "CASNOS Social Security & Independent Benefits",
      lawRef: "ANAE Inter-Ministerial Ordinance",
      description:
        "Your official ANAE auto-entrepreneur card automatically qualifies you for CASNOS social coverage. You receive your Chifa card, healthcare reimbursement, sickness coverage, and state retirement pension credits.",
      demo: (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-accent font-bold">Chifa Card</span>
            <span className="text-[10px] text-muted">100% Meds Coverage</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-accent font-bold">Maternity</span>
            <span className="text-[10px] text-muted">Independent Rights</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-accent font-bold">Retirement</span>
            <span className="text-[10px] text-muted">CASNOS Pension</span>
          </div>
        </div>
      ),
    },
    {
      id: "copilot",
      icon: Sparkles,
      tag: "Statutory Rule 06",
      title: "Al-Moukawil AI Legal Intelligence",
      lawRef: "Grounded in Official JORADP Gazette",
      description:
        "Whenever you have a fiscal question about client contracts, B2B withholding, or deadline extensions, Al-Moukawil AI provides instant answers grounded directly in official Algerian legal texts.",
      demo: (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
          <p className="font-semibold text-ink">Ready to explore MoukawilOS?</p>
          <p className="mt-1 text-[11px] text-muted">
            Your workspace is configured for FY 2026. Issue compliant invoices, track statutory milestones, and maintain 100% fiscal peace of mind.
          </p>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-card p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-bold text-mint-ink">
              Interactive Guide
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-mint/80 text-accent shadow-xs">
              <Icon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal">{step.tag}</span>
                <span className="text-[11px] text-slate-400">•</span>
                <span className="text-[11px] font-medium text-slate-500">{step.lawRef}</span>
              </div>
              <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">{step.title}</h3>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">{step.description}</p>

          {/* Step Demo Widget */}
          <div className="mt-1">{step.demo}</div>
        </div>

        {/* Navigation & Progress Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? "w-6 bg-primary" : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              <ArrowLeft className="size-3.5" />
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-ink active:scale-95"
              >
                Next Step
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-ink active:scale-95"
              >
                <CheckCircle2 className="size-3.5" />
                Start Using MoukawilOS
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
