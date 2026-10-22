"use client";

import { useState } from "react";
import { Bookmark, Check, ShieldCheck, X } from "lucide-react";
import { BuilderStrip } from "@/components/invoices/builder/builder-strip";
import { ClientCard, ItemsCard, MetadataCard, SummaryCard } from "@/components/invoices/builder/form-cards";
import { InvoicePreview } from "@/components/invoices/builder/invoice-preview";
import { cn } from "@/lib/cn";
import { issueInvoiceApi } from "@/lib/api";
import type { InvoiceDraft, User } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";

export function InvoiceBuilder({ user, draft: initialDraft }: { user: User; draft: InvoiceDraft }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(initialDraft);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [toast, setToast] = useState<string | null>(null);

  const edit = (patch: Partial<InvoiceDraft>) => setDraft((current) => ({ ...current, ...patch, savedAt: null }));
  const save = () => {
    setDraft((current) => ({ ...current, savedAt: new Date().toISOString() }));
    setToast(t("Draft #{number} saved with Law 22-23 compliance.", { number: draft.number }));
    setTimeout(() => setToast(null), 3500);
  };

  const handleIssue = async () => {
    try {
      await issueInvoiceApi(draft);
    } catch (e) {
      console.error(e);
    }
    setActiveTab("preview");
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <>
      <div className="no-print">
        <BuilderStrip number={draft.number} saved={draft.savedAt !== null} onSave={save} onIssue={handleIssue} />
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
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-surface-low px-3 py-2 text-xs font-semibold text-ink active:scale-95"
        >
          <Bookmark className="size-3.5 text-accent" />
          {draft.savedAt ? t("Draft Saved") : t("Save Draft")}
        </button>
        <button
          type="button"
          onClick={handleIssue}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-xs active:scale-95 hover:bg-primary-ink"
        >
          <ShieldCheck className="size-3.5" />
          {t("Issue PDF")}
        </button>
      </div>

      {/* Save Draft Toast */}
      {toast && (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-card p-3.5 shadow-2xl animate-in slide-in-from-bottom-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <p className="text-xs font-semibold text-ink">{toast}</p>
          <button
            onClick={() => setToast(null)}
            className="ms-2 rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
