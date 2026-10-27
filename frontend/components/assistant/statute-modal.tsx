"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, FileText, Scale, ShieldCheck, X } from "lucide-react";
import type { Statute } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

interface StatuteModalProps {
  statute: Statute | null;
  onClose: () => void;
}

export function StatuteModal({ statute, onClose }: StatuteModalProps) {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (statute) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [statute, onClose]);

  if (!statute) return null;

  const copyCitation = () => {
    const text = `${statute.code}: ${statute.title}\n${statute.gazette_ref || ""}\n${statute.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeExcerpt =
    lang === "ar"
      ? statute.excerpt_ar || statute.excerpt_fr
      : statute.excerpt_fr || statute.excerpt_ar;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="statute-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-card shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-mint text-accent shadow-2xs">
              <Scale className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-num text-xs font-bold text-teal">{statute.code}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <ShieldCheck className="size-3 text-emerald-700" />
                  {t("Official Codification")}
                </span>
              </div>
              <h3 id="statute-modal-title" className="text-sm font-bold text-ink">
                {t(statute.title)}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close")}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 active:scale-95 transition-all"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Official Gazette Source Strip */}
          {statute.gazette_ref && (
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-surface-low p-3.5 text-xs">
              <FileText className="size-4 text-accent shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  {t("Official Republic Gazette Source")}
                </span>
                <span className="font-semibold text-ink leading-relaxed">
                  {statute.gazette_ref}
                </span>
              </div>
            </div>
          )}

          {/* Statutory Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              {t("Statutory Rule Summary")}
            </h4>
            <p className="text-xs leading-relaxed text-body rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              {t(statute.summary)}
            </p>
          </div>

          {/* Authentic Official Text Excerpt */}
          {activeExcerpt && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-teal" />
                  {t("Verbatim Legal Text (Journal Officiel)")}
                </h4>
                <span className="text-[10px] text-muted italic">
                  {lang === "ar" ? "النص القانوني الأصلي" : "Texte de loi authentique"}
                </span>
              </div>
              <blockquote
                dir={lang === "ar" ? "rtl" : "ltr"}
                className="rounded-xl border-s-4 border-teal bg-mint/30 p-4 text-xs font-medium leading-relaxed text-ink shadow-2xs italic"
              >
                {activeExcerpt}
              </blockquote>
            </div>
          )}

          {/* Both languages toggle if available */}
          {statute.excerpt_ar && statute.excerpt_fr && (
            <div className="border-t border-slate-100 pt-3">
              <details className="text-xs group">
                <summary className="cursor-pointer text-muted hover:text-ink font-semibold flex items-center gap-1 select-none">
                  <span>{lang === "ar" ? "Afficher la version française" : "عرض النص باللغة العربية"}</span>
                </summary>
                <div
                  dir={lang === "ar" ? "ltr" : "rtl"}
                  className="mt-2 rounded-xl border border-slate-200 bg-surface-low/70 p-3 text-xs leading-relaxed text-body italic"
                >
                  {lang === "ar" ? statute.excerpt_fr : statute.excerpt_ar}
                </div>
              </details>
            </div>
          )}

          {/* Compliance Guarantee */}
          <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3 text-[11px] text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-700 shrink-0" />
            <span>
              {t("MoukawilOS automatically enforces this statutory article across your ceiling meter, cash-basis accounting, and invoices.")}
            </span>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3.5">
          <button
            type="button"
            onClick={copyCitation}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-card px-3 py-1.5 text-xs font-semibold text-body hover:bg-surface hover:text-ink active:scale-95 transition-all shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-700">{t("Citation copied!")}</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted" />
                <span>{t("Copy Citation")}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {statute.official_url && (
              <a
                href={statute.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-2xs"
              >
                <span>{t("Open Official Gazette (PDF)")}</span>
                <ExternalLink className="size-3" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-ink active:scale-95 transition-all shadow-2xs"
            >
              {t("Done")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
