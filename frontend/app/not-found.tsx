import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bot, FileText, Home, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-surface-low p-6 font-sans text-ink">
      {/* Top Brand Bar */}
      <header className="flex w-full max-w-4xl items-center justify-between pt-2">
        <Link href="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
          <div className="flex size-9 items-center justify-center rounded-xl bg-mint/50">
            <Image src="/brand/monogram.png" alt="MoukawilOS" width={28} height={28} priority />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none tracking-tight text-ink">MoukawilOS</span>
            <span className="pt-1 text-[11px] font-medium leading-none text-muted">Fiscal OS • Law 22-23</span>
          </div>
        </Link>
        <span className="rounded-full border border-slate-200/80 bg-card px-3 py-1 text-xs font-semibold text-muted shadow-2xs">
          Decree 23-197 Certified
        </span>
      </header>

      {/* Main 404 Hero */}
      <main className="my-auto flex w-full max-w-md flex-col items-center text-center">
        {/* Glow & Status Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal/20 bg-mint/40 px-3.5 py-1 text-xs font-semibold text-accent shadow-2xs">
          <ShieldAlert className="size-3.5" />
          <span>Statutory Route Missing</span>
        </div>

        {/* 404 Numeral */}
        <div className="mt-4 font-num text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-8xl">
          4<span className="bg-gradient-to-r from-teal to-primary bg-clip-text text-transparent">0</span>4
        </div>

        <h1 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Record Not Found in Ledger
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-body sm:text-sm">
          The requested page, invoice reference, or regulatory dossier could not be located in your active fiscal workspace.
        </p>

        {/* Diagnostic Card */}
        <div className="mt-6 w-full rounded-2xl border border-slate-200/80 bg-card p-4 text-left shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">System Diagnostic</p>
          <div className="mt-2.5 flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-muted">ANAE Statute:</span>
              <span className="font-semibold text-accent">Auto-Entrepreneur Active</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-muted">Fiscal Year:</span>
              <span className="font-semibold text-ink">FY 2026 (In Compliance)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Resolution:</span>
              <span className="font-semibold text-ink">Redirect to Operational Core</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-primary-ink active:scale-95"
          >
            <Home className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/invoices"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-card px-4 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-all duration-150 hover:bg-surface active:scale-95"
          >
            <FileText className="size-4 text-accent" />
            Invoices Ledger
          </Link>
          <Link
            href="/assistant"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-card px-4 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-all duration-150 hover:bg-surface active:scale-95"
          >
            <Bot className="size-4 text-accent" />
            AI Assistant
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl border-t border-slate-200/60 pb-2 pt-4 text-center text-[11px] text-muted">
        MoukawilOS • Algerian Law 22-23 (December 18, 2022) &amp; Executive Decree 23-197
      </footer>
    </div>
  );
}
