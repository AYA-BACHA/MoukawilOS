"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/cn";
import type { User } from "@/types/models";

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col justify-between bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div>
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image src="/brand/monogram.png" alt="" width={32} height={32} />
            <div>
              <p className="text-lg font-semibold leading-[18px] tracking-[-0.025em] text-primary-ink">MoukawilOS</p>
              <p className="pt-0.5 text-xs font-medium tracking-[0.02em] text-body">Fiscal OS V1</p>
            </div>
          </div>
          <span className="rounded bg-mint px-1 py-0.5 text-xs font-medium tracking-[0.02em] text-mint-ink">Law 22-23</span>
        </div>
        <nav className="px-3 py-2">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-[0.05em] text-muted">Operational Core</p>
          <ul className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded p-2",
                      active ? "bg-mint text-base font-semibold text-[#154b46]" : "text-sm font-medium text-body",
                    )}
                  >
                    <Icon className="size-[18px]" strokeWidth={1.75} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <button className="flex items-center justify-center gap-2 rounded-xl bg-surface-low p-2 text-xs font-medium tracking-[0.02em] text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <CircleHelp className="size-4" />
          How Moukawil Works
        </button>
        <div className="flex items-center gap-2 rounded-lg bg-surface-low/70 p-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Image src="/brand/avatar.png" alt="" width={32} height={32} className="rounded-xl" />
          <div>
            <p className="text-sm font-semibold text-ink">{user.displayName}</p>
            <p className="font-num text-xs text-body">{user.registration}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
