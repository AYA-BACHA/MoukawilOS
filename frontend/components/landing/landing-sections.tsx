"use client";

import Link from "next/link";
import { ArrowRight, Bot, CalendarClock, ChevronDown, FileText, Gauge, Percent, Wallet } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

const trust = ["Law 22-23", "Executive Decree 23-197", "ANAE", "CASNOS", "DGI"];

const features = [
  { icon: Gauge, title: "Live ceiling tracker", text: "See your collected turnover against the 5,000,000 DZD statutory cap, with alerts before you reach it." },
  { icon: Wallet, title: "True cash-basis accounting", text: "Only cleared payments count. Unpaid invoices never consume your ceiling or your tax." },
  { icon: FileText, title: "Compliant invoices", text: "Every invoice carries your ANAE number, the 0% VAT clause and the client's NIF and NIS, ready to print or download as PDF." },
  { icon: Percent, title: "Automatic IFU estimate", text: "Your flat 0.5% IFU is calculated on collected turnover, so you always know what you owe." },
  { icon: CalendarClock, title: "Deadlines, handled", text: "Keep your G50-A filing date and CASNOS regularization in one place." },
  { icon: Bot, title: "Legal assistant", text: "Ask about the ceiling, VAT or declarations and get answers grounded in the official texts." },
];

const steps = [
  { title: "Create your workspace", text: "Sign up and add your ANAE and tax identifiers once." },
  { title: "Issue invoices", text: "Send compliant 0% VAT invoices to your B2B and B2C clients." },
  { title: "Record payments", text: "Mark an invoice as paid when the money clears and watch your ceiling update." },
];

const stats = [
  { value: "5,000,000", label: "DZD annual ceiling" },
  { value: "0.5%", label: "Flat IFU rate" },
  { value: "0%", label: "VAT on your invoices" },
  { value: "3", label: "Languages: AR, FR, EN" },
];

const faqs = [
  { q: "What is an auto-entrepreneur under Law 22-23?", a: "A status created by Law 22-23 that lets independent professionals work legally with a flat 0.5% IFU, no commercial register requirement and an exemption from VAT, up to an annual turnover ceiling of 5,000,000 DZD." },
  { q: "Do unpaid invoices count toward my ceiling?", a: "No. Turnover is recognized on a cash basis, so an invoice only counts once the payment is credited to your bank account or CCP." },
  { q: "Which tax do I pay?", a: "A flat 0.5% IFU on collected turnover, declared once a year with form G50-A before June 30th." },
  { q: "Does MoukawilOS replace my accountant?", a: "No. MoukawilOS provides compliance tooling and information, not legal or tax advice. Confirm your situation with the tax administration or a qualified professional." },
];

export function LandingSections({ signedIn }: { signedIn: boolean }) {
  const { t } = useI18n();
  const container = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

  return (
    <>
      {/* Trust strip */}
      <section className="border-y border-slate-200/70 bg-surface-low">
        <div className={`${container} flex flex-col items-center justify-between gap-4 py-6 md:flex-row`}>
          <p className="text-xs font-semibold uppercase text-muted">{t("Built around")}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {trust.map((item) => (
              <li key={item} className="text-sm font-bold text-body">
                {t(item)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`${container} py-20 lg:py-28`}>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t("Everything an auto-entrepreneur needs")}</h2>
          <p className="text-base leading-7 text-body">{t("One workspace for your invoices, your ceiling and your fiscal obligations.")}</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-card p-6 shadow-xs transition-shadow hover:shadow-lg hover:shadow-black/5">
              <span className="grid size-11 place-items-center rounded-xl bg-mint text-mint-ink">
                <Icon className="size-5" />
              </span>
              <h3 className="text-base font-bold text-ink">{t(title)}</h3>
              <p className="text-sm leading-6 text-body">{t(text)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-surface-low py-20 lg:py-28">
        <div className={container}>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t("How it works")}</h2>
            <p className="text-base leading-7 text-body">{t("From sign-up to your first compliant invoice in three steps.")}</p>
          </div>
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-card p-6">
                <span className="grid size-9 place-items-center rounded-full bg-primary font-num text-sm font-bold text-white">{index + 1}</span>
                <h3 className="text-base font-bold text-ink">{t(step.title)}</h3>
                <p className="text-sm leading-6 text-body">{t(step.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Numbers */}
      <section className={`${container} py-16 lg:py-20`}>
        <dl className="grid grid-cols-2 gap-y-10 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1.5">
              <dt className="order-2 text-sm font-medium text-body">{t(stat.label)}</dt>
              <dd className="font-num text-3xl font-extrabold text-accent sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-surface-low py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t("Frequently asked questions")}</h2>
          <div className="mt-12 flex flex-col gap-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-slate-200 bg-card px-5 py-4 open:shadow-md open:shadow-black/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {t(faq.q)}
                  <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="pt-3 text-sm leading-6 text-body">{t(faq.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`${container} py-20 lg:py-28`}>
        <div className="relative overflow-hidden rounded-3xl bg-[#0c312d] px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -end-20 -top-20 size-72 rounded-full bg-[#2a8579]/30 blur-3xl" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Ready to run your business with confidence?")}</h2>
            <p className="text-base leading-7 text-white/75">{t("Create your workspace and issue your first compliant invoice today.")}</p>
            <Link href={signedIn ? "/dashboard" : "/sign-up"} className={buttonClass("outline", "h-12 rounded-xl border-transparent bg-white px-6 text-sm text-[#0c312d] hover:bg-white/90")}>
              {signedIn ? t("Open dashboard") : t("Create your workspace")}
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
