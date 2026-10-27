"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  Highlighter,
  Scale,
  ShieldCheck,
  X,
  FileCode2,
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

  // Resolve the rich document with exact deduced line from statutory documents registry
  const doc: StatutoryDocument = getStatutoryDocument(statute.id || statute.code);

  const copyCitation = () => {
    const text = `${doc.code} — ${doc.document_title}\n${doc.gazette_ref}\n${doc.article_label}\nLigne déduite: ${doc.deduced_line_text}\n\nRègle MoukawilOS: ${doc.deduction_rule_fr}`;
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="statute-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-3xl max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-card shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Official Algerian Republic Header */}
        <div className="flex flex-col border-b border-slate-200/90 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-accent shadow-xs shrink-0">
                <Scale className="size-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-num text-xs font-bold text-teal">{doc.code}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <ShieldCheck className="size-3 text-emerald-700" />
                    {t("Official Republic Gazette (JORADP)")}
                  </span>
                  <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700 font-num">
                    {doc.pdf_filename}
                  </span>
                </div>
                <h3 id="statute-modal-title" className="text-sm font-bold text-ink mt-0.5">
                  {doc.document_title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("Close")}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 active:scale-95 transition-all"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "text"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-low text-body hover:bg-surface hover:text-ink"
              }`}
            >
              <Highlighter className="size-3.5" />
              <span>{t("Document Text & Highlighted Line")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pdf")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "pdf"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-low text-body hover:bg-surface hover:text-ink"
              }`}
            >
              <FileText className="size-3.5" />
              <span>{t("Authentic Gazette PDF ({file})", { file: doc.pdf_filename })}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {activeTab === "text" ? (
            <>
              {/* Quick PDF Switch Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100/90 p-3 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-base">📑</span>
                  <div>
                    <span className="text-xs font-bold text-ink block">
                      {t("Authentic Official Gazette Scan: {file}", { file: doc.pdf_filename })}
                    </span>
                    <span className="text-[10px] text-muted">
                      {doc.gazette_ref} • {doc.article_label} (Page {doc.page_number})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("pdf")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal text-white px-3 py-1.5 text-xs font-bold hover:bg-teal-ink transition-colors shadow-2xs active:scale-95"
                  >
                    <FileText className="size-3.5" />
                    <span>{t("View Original PDF Scan ↗")}</span>
                  </button>
                  <a
                    href={doc.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-card px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-surface transition-colors"
                  >
                    <span>{t("New Tab")}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Deduced Rule Card */}
              <div className="rounded-2xl border-2 border-amber-400/60 bg-amber-50/70 p-4 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1.5">
                  <FileCheck2 className="size-4 text-amber-600" />
                  <span>{t("What MoukawilOS Deduced From This Exact Statutory Line:")}</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-950 font-medium">
                  {activeDeductionRule}
                </p>
              </div>

              {/* Gazette Metadata Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-surface-low p-3 border border-slate-200/70">
                  <FileCode2 className="size-4 text-teal shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                      {t("Gazette Reference")}
                    </span>
                    <span className="font-semibold text-ink truncate block">
                      {doc.gazette_ref}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface-low p-3 border border-slate-200/70">
                  <Scale className="size-4 text-teal shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                      {t("Article & Section")}
                    </span>
                    <span className="font-semibold text-ink truncate block">
                      {doc.article_label} (Page {doc.page_number})
                    </span>
                  </div>
                </div>
              </div>

              {/* Authentic Document Viewer with Exact Line Highlight */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal" />
                    <span>{t("Verbatim Legal Text from Official Gazette")}</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Highlighter className="size-3" />
                    {t("Deduced line highlighted below")}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-300/80 bg-slate-50/70 p-4 font-mono text-xs overflow-x-auto shadow-inner">
                  <div className="flex flex-col gap-1.5 divide-y divide-slate-200/40">
                    {doc.full_context_lines.map((lineObj) => (
                      <div
                        key={lineObj.line}
                        className={`pt-1.5 flex items-start gap-3 transition-colors ${
                          lineObj.isDeduced
                            ? "bg-amber-200/70 -mx-3 px-3 py-2 rounded-xl border-2 border-amber-400 font-sans shadow-sm ring-2 ring-amber-300/50"
                            : "text-slate-700 font-serif"
                        }`}
                      >
                        <span className="font-mono text-[10px] font-bold text-slate-400 select-none pt-0.5 w-5 text-end shrink-0">
                          {String(lineObj.line).padStart(2, "0")}
                        </span>
                        <div className="flex-1">
                          {lineObj.isDeduced && (
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 mb-1">
                              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                              <span>👉 {t("THE EXACT DEDUCED STATUTORY LINE")}</span>
                            </div>
                          )}
                          <p
                            className={`leading-relaxed ${
                              lineObj.isDeduced
                                ? "text-xs sm:text-sm font-bold text-amber-950 font-serif"
                                : "text-xs"
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
                <div className="rounded-xl border border-slate-200 bg-surface-low/80 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                    {t("Arabic Codification (النص القانوني بالعربية):")}
                  </span>
                  <p dir="rtl" className="text-xs font-semibold text-ink leading-relaxed font-serif">
                    {doc.deduced_line_arabic}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* PDF Viewer Tab */
            <div className="flex flex-col gap-3 h-[520px]">
              <div className="flex items-center justify-between bg-surface-low p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-ink">
                  {doc.pdf_filename} — {doc.gazette_ref}
                </span>
                <a
                  href={doc.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-teal font-bold hover:underline"
                >
                  <span>{t("Open in separate window")}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-inner">
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
        <div className="flex items-center justify-between border-t border-slate-200/90 bg-slate-50/80 px-6 py-3.5">
          <button
            type="button"
            onClick={copyCitation}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-card px-3 py-1.5 text-xs font-semibold text-body hover:bg-surface hover:text-ink active:scale-95 transition-all shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-700">{t("Citation & line copied!")}</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted" />
                <span>{t("Copy Deduced Citation")}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <a
              href={doc.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-2xs"
            >
              <span>{t("Open Official PDF (New Tab)")}</span>
              <ExternalLink className="size-3" />
            </a>
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
