"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { SpotlightTour } from "@/components/layout/spotlight-tour";
import type { User } from "@/types/models";

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [showTour, setShowTour] = useState(false);

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

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col justify-between border-r border-slate-100 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <div>
          {/* Brand & Law 22-23 header */}
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-mint/40">
                <Image src="/brand/monogram.png" alt="MoukawilOS" width={28} height={28} priority />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-none tracking-tight text-ink">MoukawilOS</span>
                <span className="pt-1.5 text-[11px] font-medium leading-none text-muted">
                  Fiscal OS • Law 22-23
                </span>
              </div>
            </div>
          </div>

          <nav id="tour-sidebar-nav" className="px-3 py-3">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Operational Core
            </p>
            <ul className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                        active
                          ? "bg-mint font-semibold text-[#154b46] shadow-2xs"
                          : "text-body hover:bg-surface-low hover:text-ink hover:translate-x-0.5",
                      )}
                    >
                      <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 1.75} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 p-3 border-t border-slate-100">
          <button
            id="tour-how-it-works"
            type="button"
            onClick={() => setShowTour(true)}
            className="group flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-surface-low p-2.5 text-xs font-semibold tracking-[0.02em] text-ink transition-all duration-150 hover:bg-surface hover:border-slate-300 active:scale-95 shadow-2xs hover:shadow-xs"
          >
            <CircleHelp className="size-4 text-primary transition-transform duration-150 group-hover:scale-110" />
            How Moukawil Works
          </button>
          <Link
            href="/settings"
            title="Open Profile & Settings"
            className="flex items-center gap-2.5 rounded-xl border border-transparent bg-surface-low/70 p-2.5 transition-all hover:border-slate-200 hover:bg-surface-low"
          >
            <Image src="/brand/avatar.png" alt="" width={32} height={32} className="rounded-xl shadow-xs" />
            <div className="flex-1 truncate">
              <p className="truncate text-xs font-semibold text-ink">{user.displayName}</p>
              <p className="font-num text-[11px] text-muted">{user.registration}</p>
            </div>
          </Link>
        </div>
      </aside>

      <SpotlightTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
}
