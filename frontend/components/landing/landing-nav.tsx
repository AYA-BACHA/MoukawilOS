"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonClass } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-body transition-colors hover:text-ink">
              {t(link.label)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          {signedIn ? (
            <Link href="/dashboard" className={buttonClass("primary", "ms-1 h-9 rounded-lg px-4")}>
              {t("Open dashboard")}
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-surface sm:block">
                {t("Sign in")}
              </Link>
              <Link href="/sign-up" className={buttonClass("primary", "ms-1 h-9 rounded-lg px-4")}>
                {t("Get started")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
