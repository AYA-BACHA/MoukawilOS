"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Scale,
  ShieldCheck,
  X,
  BookOpen,
} from "lucide-react";
import type { Statute } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";
import { getStatutoryDocument, type StatutoryDocument } from "@/lib/statutory-documents";

interface StatuteModalProps {
  statute: Statute | null;
  onClose: () => void;
}

export function StatuteModal({ statute, onClose }: StatuteModalProps) {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "pdf">("text");

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

  const doc: StatutoryDocument = getStatutoryDocument(statute.id || statute.code);

  const copyCitation = () => {
    const text = `${doc.code} — ${doc.document_title}\n${doc.gazette_ref}\n${doc.article_label}\nLigne déduite: ${doc.deduced_line_text}\n\nInterprétation fiscale: ${doc.deduction_rule_fr}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeDeductionRule =
    lang === "ar"
      ? doc.deduction_rule_ar
      : lang === "fr"
      ? doc.deduction_rule_fr
      : doc.deduction_rule_en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Clickable Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="statute-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-3xl max-h-[92vh] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-slate-900 dark:border-slate-800"
      >
        {/* Header */}
        <div className="flex flex-col border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:bg-slate-900/90 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-slate-200/70 text-slate-800 shrink-0 mt-0.5 dark:bg-slate-800 dark:text-slate-200">
                <Scale className="size-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">{doc.code}</span>
                  <span className="inline-flex items-center gap-1 rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <ShieldCheck className="size-3 text-slate-600 dark:text-slate-400" />
                    {t("Official Gazette of the Algerian Republic")}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {doc.pdf_filename}
                  </span>
                </div>
                <h3 id="statute-modal-title" className="text-sm font-semibold text-slate-900 mt-1 leading-snug dark:text-slate-100">
                  {doc.document_title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("Close")}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors dark:hover:bg-slate-800"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Clean Segmented Control Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-200/70 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "text"
                  ? "bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>{t("Statutory Text & Codification")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pdf")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "pdf"
                  ? "bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <FileText className="size-3.5" />
              <span>{t("Authentic Gazette PDF ({file})", { file: doc.pdf_filename })}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {activeTab === "text" ? (
            <>
              {/* Publication Metadata & PDF Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{doc.gazette_ref}</span>
                  <span className="text-[11px] text-slate-500">{doc.article_label} • Page {doc.page_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("pdf")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <FileText className="size-3.5 text-slate-500" />
                    <span>{t("Open Embedded PDF")}</span>
                  </button>
                  <a
                    href={doc.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <span>{t("New Tab")}</span>
                    <ExternalLink className="size-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Statutory Interpretation Note */}
              <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1 dark:text-emerald-300">
                  {t("Statutory Deduction & Application")}
                </span>
                <p className="text-xs leading-relaxed text-slate-800 font-medium dark:text-slate-200">
                  {activeDeductionRule}
                </p>
              </div>

              {/* Verbatim Gazette Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {t("Official Gazette Verbatim Text")}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t("Enforced legal passage indicated below")}
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs overflow-x-auto dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-1 divide-y divide-slate-200/40 dark:divide-slate-850">
                    {doc.full_context_lines.map((lineObj) => (
                      <div
                        key={lineObj.line}
                        className={`pt-1 flex items-start gap-3 ${
                          lineObj.isDeduced
                            ? "bg-amber-50/80 -mx-3 px-3 py-2 rounded-lg border border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-800/40"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="font-mono text-[10px] font-medium text-slate-400 select-none pt-0.5 w-6 text-end shrink-0">
                          {String(lineObj.line).padStart(2, "0")}
                        </span>
                        <div className="flex-1">
                          {lineObj.isDeduced && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5 dark:text-amber-400">
                              {t("Enforced Legal Clause:")}
                            </span>
                          )}
                          <p
                            className={`leading-relaxed ${
                              lineObj.isDeduced
                                ? "text-xs font-semibold text-slate-900 font-serif dark:text-slate-100"
                                : "text-xs font-serif"
                            }`}
                          >
                            {lineObj.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Arabic Translation if available */}
              {doc.deduced_line_arabic && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    {t("Official Arabic Codification (النص القانوني بالعربية):")}
                  </span>
                  <p dir="rtl" className="text-xs font-medium text-slate-900 leading-relaxed font-serif dark:text-slate-100">
                    {doc.deduced_line_arabic}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Embedded PDF Viewer */
            <div className="flex flex-col gap-3 h-[540px]">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {doc.pdf_filename} — {doc.gazette_ref}
                </span>
                <a
                  href={doc.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-700 font-medium hover:text-slate-900 hover:underline dark:text-slate-300"
                >
                  <span>{t("Open in separate window")}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="flex-1 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 dark:border-slate-700">
                <iframe
                  src={`${doc.pdf_url}#page=${doc.page_number}`}
                  title={doc.title}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={copyCitation}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition-colors shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">{t("Citation copied")}</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-slate-400" />
                <span>{t("Copy Citation")}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <a
              href={doc.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>{t("Open Official PDF (New Tab)")}</span>
              <ExternalLink className="size-3 text-slate-400" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-2xs dark:bg-slate-100 dark:text-slate-900"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
