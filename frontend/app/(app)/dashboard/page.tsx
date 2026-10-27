import { cookies } from "next/headers";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getCurrentUser, getInvoices, getNextDeadline, type DemoScenario } from "@/lib/api";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const scenarioCookie = (cookieStore.get("moukawil_demo_scenario")?.value as DemoScenario) || "standard";
  const fyCookie = cookieStore.get("moukawil_fiscal_year")?.value || "2026";

  const [user, invoices, deadline] = await Promise.all([
    getCurrentUser(),
    getInvoices(scenarioCookie),
    getNextDeadline(),
  ]);

  return (
    <DashboardView
      user={user}
      initialInvoices={invoices}
      deadline={deadline}
      initialFiscalYear={fyCookie}
    />
  );
}
