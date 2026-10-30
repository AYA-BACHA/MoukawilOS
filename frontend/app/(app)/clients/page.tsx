import { cookies } from "next/headers";
import { ClientsDirectory } from "@/components/clients/clients-directory";
import { getClients, getInvoices, type DemoScenario } from "@/lib/api";

export default async function ClientsPage() {
  const cookieStore = await cookies();
  const scenarioCookie = (cookieStore.get("moukawil_demo_scenario")?.value as DemoScenario) || "standard";

  const [clients, invoices] = await Promise.all([
    getClients(),
    getInvoices(scenarioCookie),
  ]);
  return <ClientsDirectory clients={clients} invoices={invoices} />;
}
