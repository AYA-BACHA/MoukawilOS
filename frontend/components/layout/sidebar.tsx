"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, X } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { SpotlightTour } from "@/components/layout/spotlight-tour";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import type { User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

export function Sidebar({ user }: { user: User }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [showTour, setShowTour] = useState(false);
  const { isOpen, close } = useMobileNav();

  // Auto-launch spotlight tour on first visit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tourDone = localStorage.getItem("moukawil_spotlight_tour_done");
      if (!tourDone) {
        const timer = setTimeout(() => setShowTour(true), 900);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Lock body scroll and listen for Escape when mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  const navContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand & Law 22-23 header */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-mint/40">
              <Image src="/brand/monogram.png" alt={t("MoukawilOS")} width={28} height={28} priority />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none tracking-tight text-ink">{t("MoukawilOS")}</span>
              <span className="pt-1.5 text-[11px] font-medium leading-none text-muted">
                {t("Fiscal OS • Law 22-23")}
              </span>
            </div>
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={close}
              aria-label={t("Close Menu")}
              className="flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink active:scale-95"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <nav id={isMobile ? "mobile-sidebar-nav" : "tour-sidebar-nav"} className="px-3 py-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {t("Operational Core")}
          </p>
          <ul className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => {
                      if (isMobile) close();
                    }}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                      active
                        ? "bg-mint font-semibold text-mint-ink shadow-2xs"
                        : "text-body hover:bg-surface-low hover:text-ink hover:translate-x-0.5",
                    )}
                  >
                    <Icon className="size-[19px] shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                    <span>{t(label)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-2 p-3 border-t border-slate-100">
        <button
          id={isMobile ? "mobile-how-it-works" : "tour-how-it-works"}
          type="button"
          onClick={() => {
            if (isMobile) close();
            setShowTour(true);
          }}
          className="group flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-surface-low p-2.5 text-xs font-semibold tracking-[0.02em] text-ink transition-all duration-150 hover:bg-surface hover:border-slate-300 active:scale-95 shadow-2xs hover:shadow-xs"
        >
          <CircleHelp className="size-4 text-accent transition-transform duration-150 group-hover:scale-110" />
          {t("How Moukawil Works")}
        </button>
        <Link
          href="/settings"
          onClick={() => {
            if (isMobile) close();
          }}
          title={t("Open Profile & Settings")}
          className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-transparent bg-surface-low/70 p-2.5 transition-all hover:border-slate-200 hover:bg-surface-low active:scale-98"
        >
          <Image src="/brand/avatar.png" alt="" width={32} height={32} className="rounded-xl shadow-xs shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-ink">{user.displayName}</p>
            <p className="font-num truncate text-[11px] text-muted">{user.registration}</p>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="fixed inset-y-0 start-0 z-20 hidden w-60 flex-col justify-between border-e border-slate-100 bg-card shadow-[0_1px_4px_rgba(0,0,0,0.03)] lg:flex">
        {navContent(false)}
      </aside>

      {/* Mobile Drawer Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={close}
            aria-hidden="true"
          />
          {/* Slide-in Drawer */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t("Mobile Navigation Drawer")}
            className="fixed inset-y-0 start-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-e border-slate-200 bg-card shadow-2xl transition-transform animate-in slide-in-from-start duration-250 ease-out"
          >
            {navContent(true)}
          </aside>
        </div>
      )}

      <SpotlightTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
}
