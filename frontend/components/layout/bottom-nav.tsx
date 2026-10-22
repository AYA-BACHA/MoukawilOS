"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutGrid, Plus, ReceiptText, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/provider";

export function BottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, match: (p: string) => p === "/dashboard" },
    { href: "/invoices", label: "Invoices", icon: ReceiptText, match: (p: string) => p === "/invoices" },
    { href: "/invoices/new", label: "New", icon: Plus, isAction: true, match: (p: string) => p === "/invoices/new" },
    { href: "/clients", label: "Clients", icon: Users, match: (p: string) => p === "/clients" },
    { href: "/assistant", label: "AI Copilot", icon: Bot, match: (p: string) => p === "/assistant" },
  ];

  return (
    <nav
      aria-label={t("Mobile Navigation")}
      className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-slate-200/80 bg-card/95 px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-md shadow-[0_-2px_8px_rgba(0,0,0,0.04)] lg:hidden"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);

        if (item.isAction) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={t("Create New Invoice")}
              className={cn(
                "group relative -top-2 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md transition-all active:scale-95",
                active && "ring-3 ring-mint"
              )}
            >
              <Icon className="size-5 transition-transform group-hover:scale-110" />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1 text-[11px] font-medium transition-all active:scale-95",
              active
                ? "text-primary font-bold"
                : "text-muted hover:text-ink"
            )}
          >
            <Icon className={cn("size-[18px]", active ? "text-primary stroke-[2.25]" : "stroke-[1.75]")} />
            <span className="truncate max-w-[64px]">{t(item.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
