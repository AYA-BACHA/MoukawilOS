"use client";

import { useEffect, useMemo, useState } from "react";
import { CeilingCard } from "@/components/dashboard/ceiling-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OperationalIndicators } from "@/components/dashboard/operational-indicators";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { SecondaryKpis } from "@/components/dashboard/secondary-kpis";
import { computeStats } from "@/lib/stats";
import { getInvoices, type DemoScenario } from "@/lib/api";
import { TaxSimulatorModal } from "@/components/dashboard/tax-simulator-modal";
import { getDashboardSummary, getComplianceAlerts, completeObligation } from "@/lib/api";
import type { BackendComplianceAlert } from "@/types/models";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import type { ExtendedDeadline } from "@/lib/deadline";
import type { InvoiceWithClient, PaymentConfirmation, User } from "@/types/models";

export function DashboardView({
  user,
  initialInvoices,
  deadline,
  initialFiscalYear = "2026",
}: {
  user: User;
  initialInvoices: InvoiceWithClient[];
  deadline: ExtendedDeadline;
  initialFiscalYear?: string;
}) {
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>(initialInvoices);
  const [fiscalYear, setFiscalYear] = useState<string>(initialFiscalYear);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [backendAlerts, setBackendAlerts] = useState<BackendComplianceAlert[]>([]);
  const [completedCodes, setCompletedCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    getComplianceAlerts().then((alerts) => {
      if (alerts && alerts.length > 0) setBackendAlerts(alerts);
    }).catch(() => {});
    getDashboardSummary(Number(fiscalYear)).catch(() => {});
  }, [fiscalYear]);

  const handleCompleteObligation = async (code: string) => {
    try {
      await completeObligation(code, Number(fiscalYear));
      setCompletedCodes((prev) => new Set(prev).add(code));
    } catch {
      // ignore
    }
  };


  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFy = localStorage.getItem("moukawil_fiscal_year");
      if (storedFy) setFiscalYear(storedFy);
    }
  }, []);

  // Filter or synthesize invoices based on selected fiscal year
  const activeInvoices = useMemo(() => {
    if (fiscalYear === "2025") {
      return [
        {
          id: "inv_2025_1",
          userId: user.id,
          clientId: "cli_1",
          number: "FAC-2025-001",
          issueDate: "2025-11-10",
          dueDate: "2025-12-05",
          amount: 1100000,
          status: "paid" as const,
          statutoryClause: "TVA non applicable - Art. 13 LFR 2023",
          paidAt: "2025-12-05",
          paymentRail: "bank_transfer",
          client: {
            id: "cli_1",
            userId: user.id,
            name: "Sonatrach Digital SPA",
            type: "B2B" as const,
            nif: "000216001234567",
            nis: "000216010123456",
            rc: "16/00-1234567B20",
            address: "Hydra, Alger",
            location: "Hydra, Alger",
            description: null,
            email: "achats@sonatrach-digital.dz",
            phone: "021000001",
            anaeVerified: true,
          },
        },
        {
          id: "inv_2025_2",
          userId: user.id,
          clientId: "cli_2",
          number: "FAC-2025-002",
          issueDate: "2025-12-01",
          dueDate: "2025-12-20",
          amount: 750000,
          status: "paid" as const,
          statutoryClause: "TVA non applicable - Art. 13 LFR 2023",
          paidAt: "2025-12-20",
          paymentRail: "cheque",
          client: {
            id: "cli_2",
            userId: user.id,
            name: "Yacine Mansouri",
            type: "B2C" as const,
            nif: null,
            nis: null,
            rc: null,
            address: "Oran",
            location: "Oran",
            description: null,
            email: "yacine@example.dz",
            phone: "0550000003",
            anaeVerified: false,
          },
        },
      ];
    } else if (fiscalYear === "2024") {
      return [
        {
          id: "inv_2024_1",
          userId: user.id,
          clientId: "cli_1",
          number: "FAC-2024-001",
          issueDate: "2024-09-10",
          dueDate: "2024-10-10",
          amount: 950000,
          status: "paid" as const,
          statutoryClause: "TVA non applicable - Art. 13 LFR 2023",
          paidAt: "2024-10-05",
          paymentRail: "bank_transfer",
          client: {
            id: "cli_1",
            userId: user.id,
            name: "Sonatrach Digital SPA",
            type: "B2B" as const,
            nif: "000216001234567",
            nis: "000216010123456",
            rc: "16/00-1234567B20",
            address: "Hydra, Alger",
            location: "Hydra, Alger",
            description: null,
            email: "achats@sonatrach-digital.dz",
            phone: "021000001",
            anaeVerified: true,
          },
        },
      ];
    }
    return invoices.filter((inv) => !inv.issueDate || inv.issueDate.startsWith(fiscalYear));
  }, [invoices, fiscalYear, user.id]);

  // Reactive Stats: updates automatically when activeInvoices change!
  const stats = useMemo(() => computeStats(user, activeInvoices), [user, activeInvoices]);

  // Sync client-side persistent payments on mount so navigation never resets paid status
  useEffect(() => {
    try {
      const stored = localStorage.getItem("moukawil_paid_invoices");
      if (stored) {
        const paymentsMap = JSON.parse(stored);
        setInvoices((prev) =>
          prev.map((inv) =>
            paymentsMap[inv.id]
              ? {
                  ...inv,
                  status: "paid" as const,
                  paidAt: paymentsMap[inv.id].paidAt,
                  paymentRail: paymentsMap[inv.id].paymentRail,
                }
              : inv,
          ),
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen for scenario, fiscal year, or payment events across components
  useEffect(() => {
    const handleScenarioChange = (e: Event) => {
      const customEvent = e as CustomEvent<DemoScenario>;
      const explicit = customEvent.detail;
      getInvoices(explicit).then((updated) => setInvoices(updated));
    };

    const handleFyChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) setFiscalYear(customEvent.detail);
    };

    const handlePaidEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ invoiceId: string; settlementDate: string; rail: string }>;
      if (customEvent.detail) {
        const { invoiceId, settlementDate, rail } = customEvent.detail;
        setInvoices((prev) =>
          prev.map((item) =>
            item.id === invoiceId
              ? { ...item, status: "paid", paidAt: settlementDate, paymentRail: rail }
              : item,
          ),
        );
      }
    };

    window.addEventListener("moukawil_scenario_change", handleScenarioChange);
    window.addEventListener("moukawil_fy_change", handleFyChange);
    window.addEventListener("moukawil_invoice_paid", handlePaidEvent);
    return () => {
      window.removeEventListener("moukawil_scenario_change", handleScenarioChange);
      window.removeEventListener("moukawil_fy_change", handleFyChange);
      window.removeEventListener("moukawil_invoice_paid", handlePaidEvent);
    };
  }, []);

  const handlePayment = ({ invoiceId, settlementDate, rail }: PaymentConfirmation) => {
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === invoiceId
          ? { ...item, status: "paid", paidAt: settlementDate, paymentRail: rail }
          : item,
      ),
    );
  };

  // Curate a representative selection covering all invoice states so testers can try all options:
  // - Pending: allows testing "Mark as Paid" -> Cash-basis settlement modal
  // - Paid: allows testing "PDF Receipt" -> View & print official receipt
  // - Draft: allows testing "Resume Edit" -> Open invoice builder
  const recentDisplayInvoices = useMemo(() => {
    const pending = activeInvoices.find((inv) => inv.status === "pending");
    const paid = activeInvoices.find((inv) => inv.status === "paid");
    const draft = activeInvoices.find((inv) => inv.status === "draft");

    const pickedIds = new Set<string>();
    const result: InvoiceWithClient[] = [];

    // Prioritize pending so tester can immediately try "Mark as Paid"
    [pending, paid, draft].forEach((inv) => {
      if (inv && !pickedIds.has(inv.id)) {
        pickedIds.add(inv.id);
        result.push(inv);
      }
    });

    // Fill up to 4 items with remaining active invoices
    for (const inv of activeInvoices) {
      if (result.length >= 4) break;
      if (!pickedIds.has(inv.id)) {
        pickedIds.add(inv.id);
        result.push(inv);
      }
    }

    return result.length > 0 ? result : activeInvoices.slice(0, 4);
  }, [activeInvoices]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <DashboardHeader user={user} onOpenSimulator={() => setIsSimulatorOpen(true)} />
      <CeilingCard stats={stats} />
      <SecondaryKpis deadline={deadline} stats={stats} />
      <RecentInvoices
        invoices={recentDisplayInvoices}
        stats={stats}
        onPaymentConfirmed={handlePayment}
      />
      <OperationalIndicators user={user} stats={stats} />
      {backendAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {backendAlerts.slice(0, 2).map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium ${
                alert.severity === "critical" || alert.severity === "overdue"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <div>
                  <span className="font-bold">{alert.title}: </span>
                  <span>{alert.message}</span>
                </div>
              </div>
              {!completedCodes.has(alert.code) ? (
                <button
                  type="button"
                  onClick={() => handleCompleteObligation(alert.code)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-xs"
                >
                  Mark Done
                </button>
              ) : (
                <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                  <CheckCircle2 className="size-3.5" /> Done
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <TaxSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}
