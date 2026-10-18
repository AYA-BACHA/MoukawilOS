import { InvoicesLedger } from "@/components/invoices/invoices-ledger";
import { getCurrentUser, getInvoices } from "@/lib/api";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [user, invoices, { q }] = await Promise.all([getCurrentUser(), getInvoices(), searchParams]);
  return <InvoicesLedger user={user} invoices={invoices} initialQuery={q ?? ""} />;
}
