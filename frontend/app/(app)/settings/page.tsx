import { SettingsView } from "@/components/settings/settings-view";
import { getCurrentUser, getInvoices } from "@/lib/api";
import { computeStats } from "@/lib/stats";

export default async function SettingsPage() {
  const [user, invoices] = await Promise.all([getCurrentUser(), getInvoices()]);
  return <SettingsView user={user} stats={computeStats(user, invoices)} />;
}
