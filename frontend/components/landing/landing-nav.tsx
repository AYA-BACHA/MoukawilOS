"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DemoLoginButton } from "@/components/auth/demo-login-button";
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="flex items-center gap-1.5 sm:gap-2 ms-1">
            {/* Evaluator / Tester instant 1-click Demo (Always available) */}
            <DemoLoginButton variant="nav" showSubtext={false} />

            {signedIn ? (
              <Link href="/dashboard" className={buttonClass("primary", "h-9 rounded-lg px-3 text-xs font-semibold")}>
                {t("Dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-body transition-colors hover:text-ink hover:bg-surface"
                >
                  {t("Sign in")}
                </Link>
                <Link
                  href="/sign-up"
                  className={buttonClass("primary", "h-9 rounded-lg px-3 text-xs font-semibold")}
                >
                  {t("Sign up")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
