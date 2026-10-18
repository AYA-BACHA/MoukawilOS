import Image from "next/image";
import { Bell, CalendarDays, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

export function Topbar({ utilization }: { utilization: number }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white/90 px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-xl bg-surface-low px-3 py-1.5 text-sm font-medium text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <CalendarDays className="size-[15px] text-primary" />
          Fiscal Year 2026
          <ChevronDown className="size-3" />
        </button>
        <Pill dot="size-2 bg-primary" className="bg-mint px-3 py-1 text-mint-ink">
          Status: {Math.round(utilization * 100)}% Utilized • In Compliance
        </Pill>
      </div>
      <div className="flex items-center gap-3">
        <button aria-label="Notifications" className="rounded p-2 text-ink">
          <Bell className="size-[18px]" />
        </button>
        <Link href="/invoices/new" className={buttonClass("primary", "py-2 pl-3 pr-3")}>
          <Plus className="size-3" />
          New Invoice
        </Link>
        <Image src="/brand/avatar.png" alt="" width={32} height={32} className="ml-1 rounded-xl" />
      </div>
    </header>
  );
}
