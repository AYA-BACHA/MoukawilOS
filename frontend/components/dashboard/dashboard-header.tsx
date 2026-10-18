import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { Button, buttonClass } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import type { User } from "@/types/models";

export function DashboardHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold leading-8 tracking-[-0.025em] text-ink">Welcome back, {user.firstName}</h1>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-num text-body">ANAE Registration: {user.registration}</span>
          <span className="text-muted">•</span>
          <span className="font-medium tracking-[0.01em] text-body">{user.activity}</span>
          <Pill dot="size-2 bg-teal" className="ml-1 bg-mint px-2.5 py-1 text-mint-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            Active Registry
          </Pill>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300"
        >
          View Full Ledger
        </Link>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-ink"
        >
          <Plus className="size-3.5" />
          Create Invoice
        </Link>
      </div>
    </div>
  );
}
