"use client";

import { useState } from "react";
import { BuilderStrip } from "@/components/invoices/builder/builder-strip";
import { ClientCard, ItemsCard, MetadataCard, SummaryCard } from "@/components/invoices/builder/form-cards";
import { InvoicePreview } from "@/components/invoices/builder/invoice-preview";
import type { InvoiceDraft, User } from "@/types/models";

export function InvoiceBuilder({ user, draft: initialDraft }: { user: User; draft: InvoiceDraft }) {
  const [draft, setDraft] = useState(initialDraft);

  const edit = (patch: Partial<InvoiceDraft>) => setDraft((current) => ({ ...current, ...patch, savedAt: null }));
  const save = () => setDraft((current) => ({ ...current, savedAt: new Date().toISOString() }));

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
    </>
  );
}
