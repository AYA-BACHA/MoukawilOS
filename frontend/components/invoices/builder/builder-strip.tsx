"use client";

import Link from "next/link";
import { Bookmark, ChevronRight, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { MoukawilSpinner } from "@/components/ui/action-loading";

interface BuilderStripProps {
  number: string;
  saved: boolean;
  onSave: () => void;
  onIssue: () => void;
  onResetSample?: () => void;
  isSaving?: boolean;
  isIssuing?: boolean;
}

export function BuilderStrip({ number, saved, onSave, onIssue, onResetSample, isSaving, isIssuing }: BuilderStripProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card px-4 sm:px-6 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/invoices" className="font-medium text-body hover:text-ink">
              {t("Invoices")}
            </Link>
            <ChevronRight className="rtl:-scale-x-100 size-3 text-body" />
            <span className="font-semibold text-ink">{t("New Invoice (Draft #{number})", { number })}</span>
          </nav>
          <span className="inline-flex items-center gap-1 rounded-xl bg-mint px-2 py-1 text-xs font-medium tracking-[0.02em] text-mint-ink">
            <span className="size-1.5 rounded-full bg-primary" />
            {t("{v1} • 0% VAT Applied", { v1: saved ? t("Draft saved") : t("Unsaved changes") })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-fit rounded bg-surface-low px-1.5 py-0.5 font-num text-xs uppercase text-muted">{t("Law 22-23 Compliant")}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
            <Sparkles className="size-3 text-emerald-600" />
            {t("Pre-filled Sample Ready")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {onResetSample && (
          <button
            type="button"
            onClick={onResetSample}
            title={t("Restore pre-filled sample data")}
            className="hidden sm:inline-flex items-center gap-1 min-h-[44px] rounded-lg border border-slate-200 bg-surface-low hover:bg-surface px-2.5 py-2 text-xs font-medium text-muted hover:text-ink active:scale-95 transition-all"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("Reset Sample")}</span>
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isIssuing}
          className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-surface-low hover:bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? <MoukawilSpinner size="sm" className="text-accent" /> : <Bookmark className="size-3.5 text-accent" />}
          <span>{isSaving ? t("Saving...") : (saved ? t("Draft Saved") : t("Save as Draft"))}</span>
        </button>
        <button
          type="button"
          onClick={onIssue}
          disabled={isSaving || isIssuing}
          className={buttonClass("primary", "flex-1 sm:flex-initial min-h-[44px] rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:bg-primary-ink active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed")}
        >
          {isIssuing ? <MoukawilSpinner size="sm" className="text-white" /> : <ShieldCheck className="size-3.5" />}
          <span>{isIssuing ? t("Issuing...") : t("Issue & Download PDF")}</span>
        </button>
      </div>
    </div>
  );
}
