import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser, getInvoices } from "@/lib/api";
import { computeStats } from "@/lib/stats";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, invoices] = await Promise.all([getCurrentUser(), getInvoices()]);
  const { utilization } = computeStats(user, invoices);

  return (
    <div className="min-h-screen">
      <Sidebar user={user} />
      <div className="pl-60">
        <Topbar utilization={utilization} />
        <main className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
