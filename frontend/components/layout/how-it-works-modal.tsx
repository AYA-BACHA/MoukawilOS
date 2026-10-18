"use client";

import { useEffect, useRef } from "react";
import { Banknote, Calculator, FileCheck, Percent, ShieldCheck, X } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
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

  const pillars = [
    {
      icon: Banknote,
      title: "5,000,000 DZD Statutory Ceiling",
      desc: "Under Law 22-23, auto-entrepreneurs can collect up to 5,000,000 DZD per fiscal year. Exceeding this limit over three consecutive years prompts mandatory commercial transition.",
      badge: "Law 22-23 Art. 2",
    },
    {
      icon: FileCheck,
      title: "Cash-Basis Accounting",
      desc: "Turnover is recognized only upon actual client settlement (treasury deposit or cash voucher). Unpaid invoices do not count toward your legal ceiling.",
      badge: "Art. 13 Compliance",
    },
    {
      icon: Calculator,
      title: "0.5% Flat IFU Tax Rate",
      desc: "Pay a simplified 0.5% tax on collected turnover via the annual G50-A declaration, payable before June 30th of each fiscal year.",
      badge: "Form G50-A",
    },
    {
      icon: Percent,
      title: "Permanent VAT Exemption (0% TVA)",
      desc: "All issued vouchers and invoices are legally exempt from VAT. MoukawilOS automatically generates statutory exemption clauses on every export.",
      badge: "Decree 23-197",
    },
    {
      icon: ShieldCheck,
      title: "CASNOS Social Security",
      desc: "Full social protection including healthcare, sickness benefits, maternity, and state retirement pension managed directly via your ANAE registration.",
      badge: "Active Registry",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div
        ref={modalRef}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-mint px-2 py-0.5 text-xs font-semibold text-mint-ink">
                Law 22-23 v2
              </span>
              <span className="text-xs font-medium text-muted">Algerian Auto-Entrepreneur Framework</span>
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">How MoukawilOS Works</h2>
            <p className="mt-0.5 text-xs text-body">
              A quick reference guide to your fiscal rights, caps, and legal obligations in Algeria.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {pillars.map(({ icon: Icon, title, desc, badge }) => (
            <div
              key={title}
              className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint/70 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">{title}</h3>
                  <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-bold text-teal">{badge}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-body">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs text-muted">Audited for compliance with ANAE &amp; Ministry of Economy.</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-ink"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
