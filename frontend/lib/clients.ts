import type { Client, InvoiceWithClient } from "@/types/models";

export type ClientSort = "revenue" | "recent" | "name";
export type ClientStanding = "active" | "pending";

export interface ClientRow {
  client: Client;
  invoiced: number;
  issued: number;
  drafts: number;
  lastIssued: string | null;
  standing: ClientStanding;
}

export function buildClientRows(clients: Client[], invoices: InvoiceWithClient[]): ClientRow[] {
  return clients.map((client) => {
    const own = invoices.filter(
      (invoice) =>
        invoice.clientId === client.id ||
        (invoice.client && (
          invoice.client.id === client.id ||
          (invoice.client.name && client.name && invoice.client.name.trim().toLowerCase() === client.name.trim().toLowerCase()) ||
          (invoice.client.nif && client.nif && invoice.client.nif === client.nif)
        ))
    );
    const issued = own.filter((invoice) => invoice.status !== "draft");
    return {
      client,
      invoiced: own.reduce((total, invoice) => total + invoice.amount, 0),
      issued: issued.length,
      drafts: own.length - issued.length,
      lastIssued: issued.map((invoice) => invoice.issueDate).sort().at(-1) ?? null,
      standing: issued.length > 0 ? "active" : "pending",
    };
  });
}

export function sortRows(rows: ClientRow[], sort: ClientSort) {
  const compare: Record<ClientSort, (a: ClientRow, b: ClientRow) => number> = {
    revenue: (a, b) => b.invoiced - a.invoiced,
    recent: (a, b) => (b.lastIssued ?? "").localeCompare(a.lastIssued ?? ""),
    name: (a, b) => a.client.name.localeCompare(b.client.name),
  };
  return [...rows].sort(compare[sort]);
}

export function computeClientMetrics(rows: ClientRow[], invoices: InvoiceWithClient[]) {
  const businessClients = rows.filter(({ client }) => client.type === "B2B");
  const businessRevenue = businessClients.reduce((total, row) => total + row.invoiced, 0);
  const compliant = rows.filter(({ client }) => client.type === "B2C" || client.nif);
  return {
    total: rows.length,
    business: businessClients.length,
    individual: rows.filter(({ client }) => client.type === "B2C").length,
    businessRevenue,
    averageDeal: businessClients.length ? businessRevenue / businessClients.length : 0,
    compliance: rows.length ? Math.round((compliant.length / rows.length) * 100) : 0,
  };
}

export function downloadClientsCsv(rows: ClientRow[]) {
  const header = ["Name", "Type", "NIF", "RC", "NIS", "Email", "Phone", "Address", "Invoiced (DZD)"];
  const escape = (value: string | number | null) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const lines = rows.map(({ client, invoiced }) =>
    [client.name, client.type, client.nif, client.rc, client.nis, client.email, client.phone, client.location, invoiced.toFixed(2)].map(escape).join(","),
  );
  const url = URL.createObjectURL(new Blob([[header.map(escape).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "clients-registry.csv";
  link.click();
  URL.revokeObjectURL(url);
}
