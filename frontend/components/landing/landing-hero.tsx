"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, LogIn, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { DemoLoginButton } from "@/components/auth/demo-login-button";
import { buttonClass } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

const sampleInvoices = [
  { ref: "2026-0042", client: "Sahel Tech SARL", amount: 1250000, status: "Pending", tone: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40" },
  { ref: "2026-0041", client: "Amine Boudiaf", amount: 80000, status: "Paid", tone: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40" },
  { ref: "2026-0040", client: "Atelier Nour", amount: 45000, status: "Draft", tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60" },
];

export function LandingHero({ signedIn }: { signedIn: boolean }) {
  const { t, formatAmount } = useI18n();

  return (
    <section className="relative overflow-hidden pt-4 sm:pt-6">
      {/* High-tech subtle dot-matrix pattern & radial glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#10b98118_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_10%,#000_60%,transparent_100%)] opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.18),transparent_70%)] opacity-90" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="flex flex-col items-start gap-6">
          {/* Official Law 22-23 Grounding Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-950 shadow-xs backdrop-blur-xs transition-colors hover:border-emerald-500/50 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
            </span>
            <ShieldCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t("Built around Law 22-23 and Executive Decree 23-197")}</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
            {t("Stay under the 5,000,000 DZD ceiling. Stay compliant.")}
          </h1>

          <p className="max-w-xl text-base leading-7 text-body">
            {t("MoukawilOS is the fiscal workspace for Algerian auto-entrepreneurs: track your cash-basis turnover, issue 0% VAT invoices and never miss your G12 / G12 bis deadline.")}
          </p>

          <div className="flex flex-col gap-3.5 w-full max-w-xl">
            {signedIn && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50/90 border border-emerald-300 px-4 py-2.5 text-xs text-ink shadow-2xs dark:bg-emerald-950/40 dark:border-emerald-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex size-2 shrink-0">
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
                  </span>
                  <span className="font-semibold truncate">{t("Active session detected")}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="font-bold text-accent hover:underline inline-flex items-center gap-1 shrink-0 text-xs"
                >
                  <span>{t("Open dashboard")}</span>
                  <ArrowRight className="size-3 rtl:-scale-x-100" />
                </Link>
              </div>
            )}

            {/* Dual-choice interactive cards: Always visible for evaluators & users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Path 1: 1-Click Demo for Evaluators */}
              <div className="relative flex flex-col justify-between rounded-2xl border-2 border-emerald-500/40 bg-card p-5 shadow-sm hover:border-emerald-500/80 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 group">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-0.5 text-[10px] font-bold text-mint-ink">
                      <Sparkles className="size-3 text-emerald-700" />
                      {t("Instant Demo")}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 font-num bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {t("1-Click")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-ink">{t("Test & Evaluate")}</h3>
                  <p className="text-[11px] leading-relaxed text-muted">
                    {t("Pre-loaded with 40% turnover, compliant invoices, and an interactive 11-step spotlight tour.")}
                  </p>
                </div>

                <div className="mt-4">
                  <DemoLoginButton variant="primary" />
                </div>
              </div>

              {/* Path 2: Real Account for Freelancers */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-card p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-bold text-body">
                      <UserPlus className="size-3 text-accent" />
                      {signedIn ? t("Active Account") : t("Real Account")}
                    </span>
                    <span className="text-[10px] font-semibold text-muted font-mono">{t("ANAE")}</span>
                  </div>
                  <h3 className="text-sm font-bold text-ink">{signedIn ? t("Your Workspace") : t("Algerian Freelancers")}</h3>
                  <p className="text-[11px] leading-relaxed text-muted">
                    {signedIn
                      ? t("Access your registered auto-entrepreneur workspace, invoices, and statutory declarations.")
                      : t("Create your official workspace, issue 0% VAT invoices, and track your CASNOS obligations.")}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {signedIn ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-white hover:bg-primary-ink active:scale-98 transition-all"
                      >
                        <span>{t("Open dashboard")}</span>
                        <ArrowRight className="size-3.5 rtl:-scale-x-100" />
                      </Link>
                      <div className="text-center">
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-body hover:text-ink hover:underline"
                        >
                          <span>{t("Continue to active workspace")}</span>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/sign-up"
                        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-surface-low px-4 text-xs font-semibold text-ink hover:bg-surface hover:border-slate-400 active:scale-98 transition-all shadow-2xs"
                      >
                        <UserPlus className="size-3.5 text-accent" />
                        <span>{t("Create Free Account")}</span>
                      </Link>
                      <div className="text-center">
                        <Link
                          href="/sign-in"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-body hover:text-ink hover:underline"
                        >
                          <LogIn className="size-3 text-muted" />
                          <span>{t("Already registered? Sign in")}</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto w-full max-w-xl">
          {/* Top-right floating trust tag: 0% VAT Exemption */}
          <div className="absolute -top-4 -end-2 z-10 hidden rounded-xl border border-emerald-300/80 bg-white/95 px-3.5 py-1.5 shadow-lg shadow-emerald-950/5 backdrop-blur-md dark:border-emerald-800 dark:bg-slate-900/90 sm:flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t("0% VAT Certified")}</span>
            <span className="font-mono text-[9px] text-slate-400">Art. 282 bis</span>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-card p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-xs transition-all hover:shadow-emerald-950/15">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">{t("Collected Turnover")}</span>
              <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-semibold text-mint-ink border border-emerald-200/50 dark:border-emerald-900/50">
                {t("Cash-Basis Accounting (Law 22-23)")}
              </span>
            </div>
            <p className="pt-2 font-num text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              {formatAmount(2000000)} <span className="text-base font-semibold text-muted">{t("DZD")}</span>
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 p-0.5">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 shadow-xs transition-all duration-500" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="rounded-full bg-mint px-2.5 py-1 font-semibold text-mint-ink">{t("{percent}% utilized • Safe & In Compliance", { percent: 40 })}</span>
              <span className="text-muted font-num font-medium">{t("/ {v1} DZD", { v1: formatAmount(5000000) })}</span>
            </div>
            <div className="mt-5 flex flex-col divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 bg-surface-low/50">
              {sampleInvoices.map((invoice) => (
                <div key={invoice.ref} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink">{invoice.client}</p>
                    <p className="font-num text-[10px] text-muted font-mono">#{invoice.ref}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-num text-xs font-bold text-ink">{formatAmount(invoice.amount)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-2xs ${invoice.tone}`}>{t(invoice.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom-left floating pill: Estimated IFU Due */}
          <div className="absolute -bottom-6 -start-4 hidden rounded-2xl border border-slate-200/90 bg-card/95 px-4.5 py-3 shadow-xl shadow-black/10 backdrop-blur-md sm:block dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{t("Estimated IFU Due")}</p>
            <p className="font-num text-lg font-extrabold text-teal">{t("{v1} DZD", { v1: formatAmount(10000) })}</p>
            <p className="text-[9px] text-muted font-medium">Flat 0.5% (LF 2024)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
