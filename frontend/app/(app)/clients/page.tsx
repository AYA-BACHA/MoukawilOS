import { ClientsDirectory } from "@/components/clients/clients-directory";
import { getClients, getInvoices } from "@/lib/api";

export default async function ClientsPage() {
  const [clients, invoices] = await Promise.all([getClients(), getInvoices()]);
  return <ClientsDirectory clients={clients} invoices={invoices} />;
}
