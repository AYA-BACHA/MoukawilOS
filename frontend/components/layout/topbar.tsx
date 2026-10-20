"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarDays, CheckCircle2, ChevronDown, Clock, Plus, ShieldCheck, User as UserIcon } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useI18n } from "@/lib/i18n/provider";

const yearOptions = [
  { value: "2026", label: "FY 2026", badge: "Active" },
  { value: "2025", label: "FY 2025", badge: "Audited" },
  { value: "2024", label: "FY 2024", badge: "Closed" },
];

export function Topbar({ utilization }: { utilization: number }) {
  const { t } = useI18n();
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

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
      title: "Statutory G50-A Declaration Due",
      desc: "Annual IFU declaration deadline is June 30, 2026.",
      time: "In 72 days",
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
      title: "ANAE Registry Verified",
      desc: "Your legal auto-entrepreneur card is active with 0% VAT exemption.",
      time: "System",
      icon: ShieldCheck,
      color: "text-accent bg-mint/50",
    },
  ];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-100 bg-card/95 px-6 shadow-xs backdrop-blur-md">
      <div className="flex items-center gap-3">
        <SelectDropdown
          value={fiscalYear}
          options={yearOptions}
          onChange={setFiscalYear}
          icon={<CalendarDays className="size-3.5 text-accent" />}
        />
        <Pill dot="size-2 bg-primary" className="bg-mint px-3 py-1 text-mint-ink shadow-xs">
          {t("Status: {v1}% Utilized • In Compliance", { v1: Math.round(utilization * 100) })}
        </Pill>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            aria-label={t("Notifications")}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-body transition-colors hover:bg-surface hover:text-ink"
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
                      className="flex items-start gap-2.5 rounded-xl p-2 transition-colors hover:bg-slate-50"
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
          className={buttonClass("primary", "rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs hover:bg-primary-ink transition-colors")}
        >
          <Plus className="size-3.5" />
          {t("New Invoice")}
        </Link>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 rounded-xl p-1 transition-all hover:bg-surface"
          >
            <Image src="/brand/avatar.png" alt={t("Profile")} width={32} height={32} className="rounded-xl shadow-xs" />
            <ChevronDown className="size-3 text-muted" />
          </button>

          {showUserMenu && (
            <div className="absolute end-0 z-50 mt-2 w-48 ltr:origin-top-right rtl:origin-top-left rounded-xl border border-slate-200 bg-card p-1.5 shadow-xl shadow-black/8 animate-in fade-in zoom-in-95">
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-body transition-colors hover:bg-surface-low hover:text-ink"
              >
                <UserIcon className="size-3.5 text-muted" />
                {t("Profile & Settings")}
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1.5 text-[11px] text-muted">
                {t("Statute:")} <span className="font-semibold text-teal">{t("Auto-Entrepreneur")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
