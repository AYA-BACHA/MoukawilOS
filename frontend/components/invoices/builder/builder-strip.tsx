"use client";

import Link from "next/link";
import { Bookmark, ChevronRight, ShieldCheck } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

interface BuilderStripProps {
  number: string;
  saved: boolean;
  onSave: () => void;
  onIssue: () => void;
}

export function BuilderStrip({ number, saved, onSave, onIssue }: BuilderStripProps) {
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
        <span className="w-fit rounded bg-surface-low px-1 py-0.5 font-num text-xs uppercase text-muted">{t("Law 22-23 Compliant")}</span>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={onSave}
          className={buttonClass("soft", "flex-1 sm:flex-initial min-h-[44px] rounded-lg border border-slate-200/80 bg-surface-low hover:bg-surface px-3 py-2 text-xs font-semibold tracking-normal transition-all")}
        >
          <Bookmark className="size-3.5 text-accent" />
          {saved ? t("Draft Saved") : t("Save Draft")}
        </button>
        <button
          type="button"
          onClick={onIssue}
          className={buttonClass("primary", "flex-1 sm:flex-initial min-h-[44px] rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:bg-primary-ink active:scale-95")}
        >
          <ShieldCheck className="size-3.5" />
          {t("Issue & Download PDF")}
        </button>
      </div>
    </div>
  );
}
