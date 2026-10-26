"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useI18n } from "@/lib/i18n/provider";

export function LandingFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-200/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <Logo />
          <nav className="flex items-center gap-6 text-sm font-medium text-body">
            <Link href="/sign-in" className="transition-colors hover:text-ink">
              {t("Sign in")}
            </Link>
            <Link href="/sign-up" className="transition-colors hover:text-ink">
              {t("Create account")}
            </Link>
          </nav>
        </div>
        <p className="max-w-3xl text-xs leading-5 text-muted">
          {t("MoukawilOS provides compliance tooling and information, not legal or tax advice. Confirm your situation with the tax administration or a qualified professional.")}
        </p>
        <p className="text-xs text-muted">{t("© {year} MoukawilOS. All rights reserved.", { year: 2026 })}</p>
      </div>
    </footer>
  );
}
