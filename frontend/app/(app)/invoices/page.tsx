import { cookies } from "next/headers";
import { InvoicesLedger } from "@/components/invoices/invoices-ledger";
import { getCurrentUser, getInvoices, type DemoScenario } from "@/lib/api";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const cookieStore = await cookies();
  const scenarioCookie = (cookieStore.get("moukawil_demo_scenario")?.value as DemoScenario) || "normal";
  const fyCookie = cookieStore.get("moukawil_fiscal_year")?.value || "2026";

  const [user, invoices, { q }] = await Promise.all([
    getCurrentUser(),
    getInvoices(scenarioCookie),
    searchParams,
  ]);
  return <InvoicesLedger user={user} invoices={invoices} initialFiscalYear={fyCookie} initialQuery={q ?? ""} />;
}
