"use client";

import { useEffect, useMemo, useState } from "react";
import { CeilingCard } from "@/components/dashboard/ceiling-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OperationalIndicators } from "@/components/dashboard/operational-indicators";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { SecondaryKpis } from "@/components/dashboard/secondary-kpis";
import { computeStats } from "@/lib/stats";
import { getInvoices, type DemoScenario } from "@/lib/api";
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

  // Listen for scenario or fiscal year changes across components
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

    window.addEventListener("moukawil_scenario_change", handleScenarioChange);
    window.addEventListener("moukawil_fy_change", handleFyChange);
    return () => {
      window.removeEventListener("moukawil_scenario_change", handleScenarioChange);
      window.removeEventListener("moukawil_fy_change", handleFyChange);
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

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <DashboardHeader user={user} />
      <CeilingCard stats={stats} />
      <SecondaryKpis deadline={deadline} stats={stats} />
      <RecentInvoices
        invoices={activeInvoices.slice(0, 3)}
        stats={stats}
        onPaymentConfirmed={handlePayment}
      />
      <OperationalIndicators user={user} stats={stats} />
    </div>
  );
}
