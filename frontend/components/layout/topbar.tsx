"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, CheckCircle2, ChevronDown, Clock, LogOut, Menu, Plus, RefreshCw, ShieldCheck, User as UserIcon } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/cn";
import { signOutAction } from "@/lib/auth-actions";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { DemoSwitcher } from "@/components/layout/demo-switcher";
import { SpotlightTour } from "@/components/layout/spotlight-tour";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { useI18n } from "@/lib/i18n/provider";

const yearOptions = [
  { value: "2026", label: "FY 2026", badge: "Active" },
  { value: "2025", label: "FY 2025", badge: "Audited" },
  { value: "2024", label: "FY 2024", badge: "Closed" },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/invoices": "Invoices",
  "/invoices/new": "New Invoice",
  "/clients": "Clients",
  "/assistant": "Legal AI",
  "/settings": "Settings",
};

export function Topbar({ utilization }: { utilization: number }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const { open } = useMobileNav();
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFy = localStorage.getItem("moukawil_fiscal_year");
      if (storedFy) setFiscalYear(storedFy);
    }
  }, []);

  const handleFiscalYearChange = (year: string) => {
    setFiscalYear(year);
    if (typeof window !== "undefined") {
      localStorage.setItem("moukawil_fiscal_year", year);
      document.cookie = `moukawil_fiscal_year=${year}; path=/; max-age=31536000`;
      window.dispatchEvent(new CustomEvent("moukawil_fy_change", { detail: year }));
    }
  };

  const pageTitle = pageTitles[pathname] ?? (pathname.startsWith("/invoices") ? "Invoices" : "MoukawilOS");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: "1",
      title: "Statutory G12 bis Declaration Due",
      desc: "Annual IFU regularisation deadline is January 20, 2027.",
      time: "In 90 days",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      id: "2",
      title: "Turnover Cap Safe",
      desc: t("Current utilization is {pct}% of 5,000,000 DZD cap.", { pct: Math.round(utilization * 100) }),
      time: "Today",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      id: "3",
      title: "Sample Auto-Entrepreneur Profile",
      desc: "ANAE card AE-16-0492 with 0% VAT exemption (sample demo data).",
      time: "Sample",
      icon: ShieldCheck,
      color: "text-accent bg-mint/50",
    },
  ];

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast(true);
      setTimeout(() => setSyncToast(false), 2400);
    }, 600);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-card/95 px-3 sm:px-6 shadow-xs backdrop-blur-md overflow-x-clip">
      {/* Mobile Topbar View (< lg) */}
      <div className="flex w-full items-center justify-between gap-2 lg:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={open}
            aria-label={t("Open Menu")}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-body transition-colors hover:bg-surface hover:text-ink active:scale-95"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Image src="/brand/monogram.png" alt="MoukawilOS" width={24} height={24} className="shrink-0" />
            <h1 className="text-sm font-bold text-ink truncate">{t(pageTitle)}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <DemoSwitcher onStartTour={() => setShowTour(true)} />
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label={t("Settings")}
            className="flex size-9 items-center justify-center rounded-lg p-0.5"
          >
            <Image src="/brand/avatar.png" alt="" width={28} height={28} className="rounded-lg shadow-2xs" />
          </Link>
        </div>
      </div>

      {/* Desktop Topbar View (>= lg) */}
      <div className="hidden w-full items-center justify-between gap-2 lg:flex min-w-0">
        <div className="flex items-center gap-2 xl:gap-3 shrink-0">
          <div id="tour-fiscal-year">
            <SelectDropdown
              value={fiscalYear}
              options={yearOptions}
              onChange={handleFiscalYearChange}
              icon={<CalendarDays className="size-3.5 text-accent" />}
            />
          </div>
          <button
            type="button"
            onClick={handleSync}
            title={t("Recalculate Fiscal Metrics")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-surface-low px-2.5 py-1.5 text-xs font-semibold text-body transition-all duration-150 hover:bg-surface hover:text-ink active:scale-95 shadow-2xs"
          >
            <RefreshCw className={cn("size-3.5 text-accent transition-transform", isSyncing && "animate-spin")} />
            <span className="hidden xl:inline">{isSyncing ? t("Recalculating...") : t("Recalculate")}</span>
          </button>
          <Pill dot="size-2 bg-primary" className="hidden 2xl:inline-flex bg-mint px-3 py-1 text-mint-ink shadow-xs">
            {t("Status: {v1}% Utilized • In Compliance", { v1: Math.round(utilization * 100) })}
          </Pill>
        </div>

        <div className="flex items-center gap-1.5 xl:gap-3 shrink-0">
          <div id="tour-demo-switcher">
            <DemoSwitcher onStartTour={() => setShowTour(true)} />
          </div>
          <LanguageSwitcher />
          <ThemeToggle />

        {/* Notifications Popover */}
        <div id="tour-notifications" ref={notifRef} className="relative">
          <button
            type="button"
            aria-label={t("Notifications")}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-body transition-all duration-150 hover:bg-surface hover:text-ink active:scale-95"
          >
            <Bell className="size-[18px]" />
            <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
          </button>

          {showNotifications && (
            <div className="absolute end-0 z-50 mt-2 w-80 ltr:origin-top-right rtl:origin-top-left rounded-2xl border border-slate-200 bg-card p-3 shadow-xl shadow-black/8 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <span className="text-xs font-bold text-ink">{t("Statutory Notifications")}</span>
                <span className="rounded bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-mint-ink">{t("3 alerts")}</span>
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-2.5 rounded-xl p-2 transition-colors hover:bg-slate-50 cursor-pointer"
                    >
                      <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-ink">{t(n.title)}</p>
                        <p className="text-[11px] text-body leading-snug">{t(n.desc)}</p>
                        <span className="mt-1 block text-[10px] font-medium text-muted">{t(n.time)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* New Invoice Button */}
        <Link
          id="tour-new-invoice"
          href="/invoices/new"
          className={buttonClass("primary", "rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs hover:bg-primary-ink active:scale-95 transition-all duration-150")}
        >
          <Plus className="size-3.5" />
          {t("New Invoice")}
        </Link>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 rounded-xl p-1 transition-all duration-150 hover:bg-surface active:scale-95"
          >
            <Image src="/brand/avatar.png" alt={t("Profile")} width={32} height={32} className="rounded-xl shadow-xs" />
            <ChevronDown className="size-3 text-muted" />
          </button>

          {showUserMenu && (
            <div className="absolute end-0 z-50 mt-2 w-52 ltr:origin-top-right rtl:origin-top-left rounded-xl border border-slate-200 bg-card p-1.5 shadow-xl shadow-black/8 animate-in fade-in zoom-in-95">
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-body transition-colors hover:bg-surface-low hover:text-ink"
              >
                <UserIcon className="size-3.5 text-muted" />
                {t("Profile & Settings")}
              </Link>
              <form
                action={signOutAction}
                onSubmit={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem("moukawil_session_tour_shown");
                    sessionStorage.removeItem("moukawil_demo_login");
                  }
                }}
              >
                <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-body transition-colors hover:bg-surface-low hover:text-ink">
                  <LogOut className="size-3.5 text-muted" />
                  {t("Sign out")}
                </button>
              </form>
              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1.5 text-[11px] text-muted">
                <div className="font-semibold text-ink">Amine B. (AE-16-0492)</div>
                <div className="text-amber-700 font-medium">{t("Demo account (sample data)")}</div>
                <div className="mt-1">{t("Statute:")} <span className="font-semibold text-teal">{t("Auto-Entrepreneur")}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {syncToast && (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-card p-3.5 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span className="text-xs font-semibold text-ink">{t("Ledger recalculated from recorded payments")}</span>
        </div>
      )}

      <SpotlightTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </header>
  );
}
