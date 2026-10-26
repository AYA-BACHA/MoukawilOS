"use client";

import { BadgeCheck, FileText, Languages, TrendingUp } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useI18n } from "@/lib/i18n/provider";

const highlights = [
  { icon: TrendingUp, text: "Cash-basis turnover tracking against the 5,000,000 DZD ceiling" },
  { icon: FileText, text: "0% VAT invoices with the statutory clause built in" },
  { icon: BadgeCheck, text: "Flat 0.5% IFU estimated automatically" },
  { icon: Languages, text: "Arabic, French and English, including right-to-left" },
];

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0c312d] p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-[#2a8579]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -start-16 size-96 rounded-full bg-[#5fc9b8]/10 blur-3xl" />
        <Logo light className="relative" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="max-w-sm text-3xl font-extrabold leading-tight tracking-tight">{t("Stay compliant under Law 22-23, without the spreadsheets.")}</h2>
            <p className="max-w-sm text-sm leading-6 text-white/70">{t("The fiscal workspace for Algerian auto-entrepreneurs.")}</p>
          </div>
          <ul className="flex flex-col gap-3.5">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/85">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Icon className="size-3.5 text-[#8fe3d4]" />
                </span>
                {t(text)}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">{t("Built around Law 22-23 and Executive Decree 23-197")}</p>
      </aside>

      <main className="flex flex-col bg-canvas">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Logo className="lg:invisible" />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="flex w-full max-w-md flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
              <p className="text-sm text-body">{subtitle}</p>
            </div>
            {children}
            <p className="text-center text-sm text-body">{footer}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
