"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error to console
    console.error("MoukawilOS Runtime Audit Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-surface-low p-6 font-sans text-ink">
      <header className="flex w-full max-w-4xl items-center justify-between pt-2">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-mint/50">
            <Image src="/brand/monogram.png" alt="MoukawilOS" width={28} height={28} priority />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none tracking-tight text-ink">MoukawilOS</span>
            <span className="pt-1 text-[11px] font-medium leading-none text-muted">Fiscal OS • Law 22-23</span>
          </div>
        </Link>
        <span className="rounded-full border border-slate-200/80 bg-card px-3 py-1 text-xs font-semibold text-muted shadow-2xs">
          Executive Decree 23-197
        </span>
      </header>

      <main className="my-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-xs ring-1 ring-amber-500/20">
          <AlertTriangle className="size-6" />
        </div>

        <h1 className="mt-4 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Session Interrupted
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-body sm:text-sm">
          An unexpected interface exception occurred while rendering statutory records. Your ledger data remains secure under Law 22-23.
        </p>

        {error.digest && (
          <p className="mt-2 rounded-lg bg-card px-2.5 py-1 font-mono text-[11px] text-muted border border-slate-200/80">
            Audit Digest: {error.digest}
          </p>
        )}

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-primary-ink active:scale-95"
          >
            <RefreshCw className="size-4" />
            Retry Operation
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-card px-4 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-all duration-150 hover:bg-surface active:scale-95"
          >
            <Home className="size-4" />
            Return to Dashboard
          </Link>
        </div>
      </main>

      <footer className="w-full max-w-4xl border-t border-slate-200/60 pb-2 pt-4 text-center text-[11px] text-muted">
        MoukawilOS Runtime Diagnostic
      </footer>
    </div>
  );
}
