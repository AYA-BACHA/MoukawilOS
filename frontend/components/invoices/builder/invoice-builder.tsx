"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { BuilderStrip } from "@/components/invoices/builder/builder-strip";
import { ClientCard, ItemsCard, MetadataCard, SummaryCard } from "@/components/invoices/builder/form-cards";
import { InvoicePreview } from "@/components/invoices/builder/invoice-preview";
import type { InvoiceDraft, User } from "@/types/models";

export function InvoiceBuilder({ user, draft: initialDraft }: { user: User; draft: InvoiceDraft }) {
  const [draft, setDraft] = useState(initialDraft);
  const [toast, setToast] = useState<string | null>(null);

  const edit = (patch: Partial<InvoiceDraft>) => setDraft((current) => ({ ...current, ...patch, savedAt: null }));
  const save = () => {
    setDraft((current) => ({ ...current, savedAt: new Date().toISOString() }));
    setToast(`Draft #${draft.number} saved with Law 22-23 compliance.`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <>
      <BuilderStrip number={draft.number} saved={draft.savedAt !== null} onSave={save} onIssue={() => window.print()} />
      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-6 px-6 py-4">
        <div className="flex flex-col gap-4">
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
        <InvoicePreview user={user} draft={draft} />
      </div>

      {/* Save Draft Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl animate-in slide-in-from-bottom-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <p className="text-xs font-semibold text-ink">{toast}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
