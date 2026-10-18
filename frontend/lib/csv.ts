import { clientDetail, formatDate } from "@/lib/format";
import type { InvoiceWithClient } from "@/types/models";

const columns: [string, (invoice: InvoiceWithClient) => string | number][] = [
  ["Invoice Ref", (i) => i.number],
  ["Client", (i) => i.client.name],
  ["Client Type", (i) => i.client.type],
  ["Client Detail", (i) => clientDetail(i.client)],
  ["Issue Date", (i) => formatDate(i.issueDate)],
  ["Due Date", (i) => formatDate(i.dueDate)],
  ["Amount (DZD)", (i) => i.amount.toFixed(2)],
  ["Statutory Clause", (i) => i.statutoryClause],
  ["Status", (i) => i.status],
];

const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export function downloadLedgerCsv(invoices: InvoiceWithClient[]) {
  const rows = [columns.map(([label]) => escape(label)).join(",")];
  for (const invoice of invoices) rows.push(columns.map(([, get]) => escape(get(invoice))).join(","));
  const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ledger-fy-2026.csv";
  link.click();
  URL.revokeObjectURL(url);
}
