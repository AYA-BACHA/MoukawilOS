import { ClientsDirectory } from "@/components/clients/clients-directory";
import { getClients, getInvoices } from "@/lib/api";

export default async function ClientsPage() {
  const [clients, invoices] = await Promise.all([
    getClients(),
    getInvoices(),
    new Promise((resolve) => setTimeout(resolve, 400)),
  ]);
  return <ClientsDirectory clients={clients} invoices={invoices} />;
}
