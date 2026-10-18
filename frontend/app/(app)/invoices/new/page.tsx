import { InvoiceBuilder } from "@/components/invoices/builder/invoice-builder";
import { getCurrentUser, getInvoiceDraft } from "@/lib/api";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client } = await searchParams;
  const [user, draft] = await Promise.all([getCurrentUser(), getInvoiceDraft(client)]);
  return <InvoiceBuilder key={client ?? "draft"} user={user} draft={draft} />;
}
