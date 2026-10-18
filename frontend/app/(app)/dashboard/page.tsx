import { CeilingCard } from "@/components/dashboard/ceiling-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OperationalIndicators } from "@/components/dashboard/operational-indicators";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { SecondaryKpis } from "@/components/dashboard/secondary-kpis";
import { getCurrentUser, getInvoices, getNextDeadline } from "@/lib/api";
import { computeStats } from "@/lib/stats";

export default async function DashboardPage() {
  const [user, invoices, deadline] = await Promise.all([getCurrentUser(), getInvoices(), getNextDeadline()]);
  const stats = computeStats(user, invoices);

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <DashboardHeader user={user} />
      <CeilingCard stats={stats} />
      <SecondaryKpis deadline={deadline} stats={stats} />
      <RecentInvoices invoices={invoices.slice(0, 3)} stats={stats} />
      <OperationalIndicators user={user} stats={stats} />
    </div>
  );
}
