import { cookies } from "next/headers";
import { SettingsView } from "@/components/settings/settings-view";
import { getCurrentUser, getInvoices, type DemoScenario } from "@/lib/api";
import { computeStats } from "@/lib/stats";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const scenarioCookie = (cookieStore.get("moukawil_demo_scenario")?.value as DemoScenario) || "standard";
  const fyCookie = cookieStore.get("moukawil_fiscal_year")?.value || "2026";

  const [user, invoices] = await Promise.all([getCurrentUser(), getInvoices(scenarioCookie)]);
  const activeYearInvoices = invoices.filter((i) => !i.issueDate || i.issueDate.startsWith(fyCookie));
  return <SettingsView user={user} stats={computeStats(user, activeYearInvoices)} />;
}
