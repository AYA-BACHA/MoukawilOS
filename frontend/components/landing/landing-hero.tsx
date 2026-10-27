"use client";

import Link from "next/link";
import { ArrowRight, LogIn, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { demoSignInAction } from "@/lib/auth-actions";

const sampleInvoices = [
  { ref: "2026-0042", client: "Sahel Tech SARL", amount: 1250000, status: "Pending", tone: "bg-amber-50 text-amber-800" },
  { ref: "2026-0041", client: "Amine Boudiaf", amount: 80000, status: "Paid", tone: "bg-mint text-mint-ink" },
  { ref: "2026-0040", client: "Atelier Nour", amount: 45000, status: "Draft", tone: "bg-slate-100 text-slate-600" },
];

export function LandingHero({ signedIn }: { signedIn: boolean }) {
  const { t, formatAmount } = useI18n();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(60%_60%_at_50%_0%,var(--mint),transparent)] opacity-70" />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-card px-3 py-1.5 text-xs font-semibold text-accent shadow-xs">
            <ShieldCheck className="size-3.5" />
            {t("Built around Law 22-23 and Executive Decree 23-197")}
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">{t("Stay under the 5,000,000 DZD ceiling. Stay compliant.")}</h1>
          <p className="max-w-xl text-base leading-7 text-body">
            {t("MoukawilOS is the fiscal workspace for Algerian auto-entrepreneurs: track your cash-basis turnover, issue 0% VAT invoices and never miss your G50-A deadline.")}
          </p>

          {signedIn ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className={buttonClass("primary", "h-12 rounded-xl px-6 text-sm")}>
                {t("Open dashboard")}
                <ArrowRight className="size-4 rtl:-scale-x-100" />
              </Link>
              <a href="#how-it-works" className={buttonClass("outline", "h-12 rounded-xl px-6 text-sm")}>
                {t("See how it works")}
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {/* Primary action buttons with high clarity */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 1-Click Demo for Testers & Evaluators */}
                <form
                  action={demoSignInAction}
                  onSubmit={() => {
                    if (typeof window !== "undefined") {
                      sessionStorage.removeItem("moukawil_session_tour_shown");
                      sessionStorage.setItem("moukawil_demo_login", "true");
                    }
                  }}
                >
                  <button
                    type="submit"
                    className="flex h-12 items-center gap-2 rounded-xl bg-primary px-5 sm:px-6 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-ink active:scale-98 transition-all"
                  >
                    <Sparkles className="size-4 text-mint shrink-0" />
                    <span>{t("Try Demo (1-Click)")}</span>
                    <ArrowRight className="size-4 rtl:-scale-x-100 shrink-0" />
                  </button>
                </form>

                {/* Real User Sign Up */}
                <Link
                  href="/sign-up"
                  className={buttonClass("outline", "h-12 rounded-xl px-4 sm:px-5 text-sm font-semibold border-slate-300 hover:border-slate-400")}
                >
                  <UserPlus className="size-4 text-accent shrink-0" />
                  <span>{t("Sign Up (Real Account)")}</span>
                </Link>

                {/* Real User Sign In */}
                <Link
                  href="/sign-in"
                  className="inline-flex h-12 items-center gap-1.5 px-3 text-xs font-semibold text-body hover:text-ink hover:underline"
                >
                  <LogIn className="size-3.5 text-muted shrink-0" />
                  <span>{t("Already registered? Sign in")}</span>
                </Link>
              </div>

              {/* Evaluator & User Guidance Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-card/90 backdrop-blur-xs p-4 shadow-2xs text-xs text-body">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-mint text-mint-ink font-bold text-[11px]">i</span>
                  <span>{t("Quick Guide for Testers & Evaluators:")}</span>
                </div>
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-snug">
                  <div className="rounded-lg bg-surface-low/80 p-2.5 border border-slate-200/60">
                    <span className="font-bold text-ink block mb-0.5">⚡ {t("Testing or evaluating?")}</span>
                    <p className="text-muted">
                      {t("Click \"Try Demo\" for instant access with preloaded invoices, cash ceiling meter, and guided walkthrough.")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-low/80 p-2.5 border border-slate-200/60">
                    <span className="font-bold text-ink block mb-0.5">👤 {t("Real Auto-Entrepreneur?")}</span>
                    <p className="text-muted">
                      {t("Click \"Sign Up\" to create your official workspace with your ANAE number.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product preview */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-2xl shadow-black/10">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase text-muted">{t("Collected Turnover")}</span>
              <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-semibold text-mint-ink">{t("Cash-Basis Accounting (Law 22-23)")}</span>
            </div>
            <p className="pt-2 font-num text-3xl font-extrabold text-ink">
              {formatAmount(2000000)} <span className="text-base font-semibold text-muted">{t("DZD")}</span>
            </p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/5 rounded-full bg-primary" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="rounded-full bg-mint px-2.5 py-1 font-semibold text-mint-ink">{t("{percent}% utilized • Safe & In Compliance", { percent: 40 })}</span>
              <span className="text-muted">{t("/ {v1} DZD", { v1: formatAmount(5000000) })}</span>
            </div>
            <div className="mt-5 flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100">
              {sampleInvoices.map((invoice) => (
                <div key={invoice.ref} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink">{invoice.client}</p>
                    <p className="font-num text-[10px] text-muted">#{invoice.ref}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-num text-xs font-semibold text-ink">{formatAmount(invoice.amount)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${invoice.tone}`}>{t(invoice.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -start-6 hidden rounded-xl border border-slate-200 bg-card px-4 py-3 shadow-xl shadow-black/10 sm:block">
            <p className="text-[10px] font-bold uppercase text-muted">{t("Estimated IFU Due")}</p>
            <p className="font-num text-lg font-extrabold text-ink">{t("{v1} DZD", { v1: formatAmount(10000) })}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
