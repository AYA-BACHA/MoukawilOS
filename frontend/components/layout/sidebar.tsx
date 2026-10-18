"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { HowItWorksModal } from "@/components/layout/how-it-works-modal";
import type { User } from "@/types/models";

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold leading-none tracking-tight text-ink">MoukawilOS</span>
                  <span className="rounded bg-mint px-1.5 py-0.5 text-[10px] font-bold text-mint-ink">v2</span>
                </div>
                <span className="pt-1 text-[11px] font-medium leading-none text-muted">
                  Fiscal OS • Law 22-23
                </span>
              </div>
            </div>
          </div>

          <nav className="px-3 py-3">
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
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-mint font-semibold text-[#154b46] shadow-sm shadow-black/5"
                          : "text-body hover:bg-surface-low hover:text-ink",
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
            type="button"
            onClick={() => setShowHowItWorks(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-surface-low p-2 text-xs font-medium tracking-[0.02em] text-ink transition-colors hover:bg-surface hover:border-slate-300"
          >
            <CircleHelp className="size-4 text-primary" />
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

      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </>
  );
}
