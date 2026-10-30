import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileNavProvider } from "@/components/layout/mobile-nav-context";
import { TourProvider } from "@/components/layout/tour-context";
import { getCurrentUser, getInvoices, type DemoScenario } from "@/lib/api";
import { computeStats } from "@/lib/stats";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const scenarioCookie = (cookieStore.get("moukawil_demo_scenario")?.value as DemoScenario) || "standard";

  const [user, invoices] = await Promise.all([getCurrentUser(), getInvoices(scenarioCookie)]);
  const activeYearInvoices = invoices.filter((i) => !i.issueDate || i.issueDate.startsWith("2026"));
  const { utilization } = computeStats(user, activeYearInvoices);

  return (
    <MobileNavProvider>
      <TourProvider>
        <div className="min-h-dvh flex flex-col">
          <Sidebar user={user} />
          <div className="flex-1 flex flex-col ps-0 lg:ps-60 pb-16 lg:pb-0 overflow-x-hidden min-w-0">
            <Topbar utilization={utilization} />
            <main className="w-full flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">{children}</main>
          </div>
          <BottomNav />
        </div>
      </TourProvider>
    </MobileNavProvider>
  );
}
