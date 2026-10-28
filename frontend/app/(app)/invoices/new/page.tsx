import { InvoiceBuilder } from "@/components/invoices/builder/invoice-builder";
import { getCurrentUser, getInvoiceDraft } from "@/lib/api";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string; draft?: string }> }) {
  const { client, draft: draftId } = await searchParams;
  const [user, draft] = await Promise.all([getCurrentUser(), getInvoiceDraft(client, draftId)]);
  return <InvoiceBuilder key={draftId ?? client ?? "draft"} user={user} draft={draft} />;
}
