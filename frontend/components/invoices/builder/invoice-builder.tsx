"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, Check, ShieldCheck, X } from "lucide-react";
import { BuilderStrip } from "@/components/invoices/builder/builder-strip";
import { ClientCard, ItemsCard, MetadataCard, SummaryCard } from "@/components/invoices/builder/form-cards";
import { InvoicePreview } from "@/components/invoices/builder/invoice-preview";
import { cn } from "@/lib/cn";
import { issueInvoiceApi, saveDraftApi } from "@/lib/api";
import { printElementById } from "@/lib/print";
import type { InvoiceDraft, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

export function InvoiceBuilder({ user, draft: initialDraft }: { user: User; draft: InvoiceDraft }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(initialDraft);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [toast, setToast] = useState<{ message: string; actionText?: string; actionHref?: string } | null>(null);

  const edit = (patch: Partial<InvoiceDraft>) => setDraft((current) => ({ ...current, ...patch, savedAt: null }));

  const save = async () => {
    setIsSaving(true);
    try {
      await saveDraftApi(draft);
      setDraft((current) => ({ ...current, savedAt: new Date().toISOString() }));
      setToast({
        message: t("Draft #{number} saved to your Invoices Ledger!", { number: draft.number }),
        actionText: t("View in Ledger"),
        actionHref: "/invoices",
      });
      setTimeout(() => setToast(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleIssue = async () => {
    setIsIssuing(true);
    try {
      const res = await issueInvoiceApi(draft);
      if (!res.success && res.error === "profile_incomplete") {
        const missingLabels = res.missing && res.missing.length > 0
          ? ` (${res.missing.map((m) => m.replace(/_/g, " ")).join(", ")})`
          : "";
        setToast({
          message: t("Statutory profile incomplete{missing}: Please add these required fields in Settings to issue official invoices (Law 22-23 Art. 4).", { missing: missingLabels }),
          actionText: t("Complete Settings"),
          actionHref: "/settings",
        });
        return;
      }
      if (res.invoiceNumber) {
        setDraft((cur) => ({ ...cur, number: res.invoiceNumber }));
      }
      setToast({
        message: t("Invoice #{number} officially issued under Law 22-23!", { number: res.invoiceNumber || draft.number }),
        actionText: t("View in Ledger"),
        actionHref: "/invoices",
      });
      setActiveTab("preview");
      setTimeout(() => {
        printElementById("invoice-sheet", `Facture-${res.invoiceNumber || draft.number}`);
      }, 300);
    } catch (e) {
      console.error(e);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleResetSample = () => {
    setDraft({
      id: "new",
      userId: user.id,
      number: `FAC-2026-${String(Math.floor(Math.random() * 800) + 100).padStart(3, "0")}`,
      clientType: "B2B",
      client: {
        name: "Sonatrach Digital SPA",
        nif: "000216001234567",
        nis: "000216010123456",
        rc: "16/00-1234567B20",
        address: "Hydra, Alger",
      },
      issueDate: new Date().toISOString().slice(0, 10),
      paymentTermsDays: 30,
      items: [
        {
          id: "itm_default_1",
          description: "Prestation de développement logiciel & architecture cloud",
          details: "Sous le régime de l'auto-entrepreneur (Loi 22-23 Art. 4) — Exonération TVA Art. 282 bis CIDTA",
          quantity: 1,
          unitPrice: 350000,
        },
      ],
      savedAt: null,
    });
    setToast({
      message: t("Sample invoice data restored."),
    });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <>
      <div className="no-print">
        <BuilderStrip
          number={draft.number}
          saved={draft.savedAt !== null}
          onSave={save}
          onIssue={handleIssue}
          onResetSample={handleResetSample}
          isSaving={isSaving}
          isIssuing={isIssuing}
        />
      </div>

      {/* Mobile Segmented Tab Control (< lg) */}
      <div className="no-print flex lg:hidden rounded-xl bg-surface-low p-1 mx-1 mt-3 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={cn(
            "flex min-h-[44px] flex-1 items-center justify-center rounded-lg text-xs font-bold transition-all active:scale-95",
            activeTab === "edit"
              ? "bg-card text-ink shadow-xs"
              : "text-muted hover:text-ink"
          )}
        >
          {t("Edit Invoice")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex min-h-[44px] flex-1 items-center justify-center rounded-lg text-xs font-bold transition-all active:scale-95",
            activeTab === "preview"
              ? "bg-card text-ink shadow-xs"
              : "text-muted hover:text-ink"
          )}
        >
          {t("Preview PDF")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-4 sm:gap-6 px-1 sm:px-4 py-3 sm:py-4">
        <div className={cn("no-print flex flex-col gap-4", activeTab !== "edit" && "hidden lg:flex")}>
          <ClientCard
            clientType={draft.clientType}
            client={draft.client}
            onTypeChange={(clientType) => edit({ clientType })}
            onClientChange={(patch) => edit({ client: { ...draft.client, ...patch } })}
          />
          <MetadataCard number={draft.number} issueDate={draft.issueDate} paymentTermsDays={draft.paymentTermsDays} onChange={edit} />
          <ItemsCard items={draft.items} onChange={(items) => edit({ items })} />
          <SummaryCard items={draft.items} />

          {/* Prominent Action Bar Card at the Bottom of the Form */}
          <div className="rounded-xl border border-slate-200/90 bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink">{t("Ready to finalize this invoice?")}</span>
              <span className="text-[11px] text-muted">
                {t("Save as draft to finish later, or issue officially under Law 22-23.")}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-surface-low hover:bg-surface px-4 py-2.5 text-xs font-semibold text-ink shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <Bookmark className="size-4 text-accent" />
                <span>{isSaving ? t("Saving Draft...") : draft.savedAt ? t("Draft Saved") : t("Save as Draft")}</span>
              </button>
              <button
                type="button"
                onClick={handleIssue}
                disabled={isIssuing}
                className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-ink px-5 py-2.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <ShieldCheck className="size-4" />
                <span>{isIssuing ? t("Issuing...") : t("Issue & Download PDF")}</span>
              </button>
            </div>
          </div>
        </div>

        <div className={cn("overflow-x-auto max-w-full", activeTab !== "preview" && "hidden lg:block")}>
          <InvoicePreview user={user} draft={draft} />
        </div>
      </div>

      {/* Sticky Mobile Action Bar (< lg) */}
      <div className="no-print sticky bottom-16 lg:hidden z-20 flex items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-card/95 p-3 shadow-lg backdrop-blur-md mx-1 mb-2">
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-surface-low px-3 py-2 text-xs font-semibold text-ink active:scale-95"
        >
          <Bookmark className="size-3.5 text-accent" />
          {isSaving ? t("Saving...") : draft.savedAt ? t("Draft Saved") : t("Save as Draft")}
        </button>
        <button
          type="button"
          onClick={handleIssue}
          disabled={isIssuing}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-xs active:scale-95 hover:bg-primary-ink"
        >
          <ShieldCheck className="size-3.5" />
          {isIssuing ? t("Issuing...") : t("Issue & Print")}
        </button>
      </div>

      {/* Save Draft & Issue Toast with Direct Navigation Link */}
      {toast && (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 shadow-2xl animate-in slide-in-from-bottom-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <p className="text-xs font-bold text-emerald-950">{toast.message}</p>
          {toast.actionHref && (
            <Link
              href={toast.actionHref}
              className="ms-2 inline-flex items-center gap-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 text-xs shadow-2xs active:scale-95 transition-all whitespace-nowrap"
            >
              <span>{toast.actionText}</span>
              <ArrowRight className="size-3 rtl:rotate-180" />
            </Link>
          )}
          <button
            onClick={() => setToast(null)}
            className="ms-1 rounded-lg p-1 text-emerald-800 hover:bg-emerald-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
