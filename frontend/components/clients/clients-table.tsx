import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatAmount, formatDate, initials } from "@/lib/format";
import type { ClientRow } from "@/lib/clients";

const headClass = "px-3 py-5 text-xs font-medium uppercase tracking-[0.05em] text-body";

function Identifier({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <p className="flex items-center gap-1 font-num">
      <span className="text-[11px] text-muted">{label}</span>
      <span className={cn("text-xs", tone)}>{value}</span>
    </p>
  );
}

function TaxIdentifiers({ row }: { row: ClientRow }) {
  const { client } = row;
  if (client.type === "B2C") {
    return (
      <>
        <Identifier label="ID:" value="Resident Consumer" tone="text-body" />
        <Identifier label="Tax:" value="Exempt (B2C Article 4)" tone="text-teal" />
      </>
    );
  }
  return (
    <>
      {client.nif && <Identifier label="NIF:" value={client.nif} tone="text-ink" />}
      {client.rc && <Identifier label="RC:" value={client.rc} tone="text-body" />}
      {client.nis && <Identifier label="NIS:" value={client.nis} tone="text-muted" />}
    </>
  );
}

interface ClientsTableProps {
  rows: ClientRow[];
  total: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function ClientsTable({ rows, total, selectedId, onSelect, page, pageCount, onPageChange }: ClientsTableProps) {
  return (
    <section className="col-span-8 flex flex-col overflow-hidden rounded-lg bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between bg-surface-low px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-body">Registered client entities (Algerian jurisdiction)</h2>
        <p className="text-xs font-medium tracking-[0.02em] text-teal">
          Showing {rows.length} of {total} records
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr>
              <th className={cn(headClass, "px-4")}>Client / Corporate Profile</th>
              <th className={headClass}>Tax Identifier</th>
              <th className={cn(headClass, "text-right")}>Invoiced (DZD)</th>
              <th className={headClass}>Compliance</th>
              <th className={cn(headClass, "px-4 text-right")}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const { client } = row;
              const business = client.type === "B2B";
              const active = row.standing === "active";
              return (
                <tr key={client.id} onClick={() => onSelect(client.id)} className={cn("cursor-pointer border-t border-surface align-top", client.id === selectedId && "bg-surface-low/60")}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded text-sm font-semibold", business ? "bg-surface text-primary-ink" : "bg-surface-high text-ink")}>{initials(client.name)}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">{client.name}</span>
                          <span className={cn("rounded px-2 py-0.5 text-xs font-medium tracking-[0.02em]", business ? "bg-mint text-mint-ink" : "bg-surface text-body")}>{business ? "B2B Corporate" : "B2C Individual"}</span>
                          {client.anaeVerified && (
                            <span className="inline-flex items-center gap-0.5 rounded-sm bg-surface px-1.5 py-0.5 text-xs font-medium tracking-[0.02em] text-teal">
                              <BadgeCheck className="size-3" />
                              ANAE
                            </span>
                          )}
                        </div>
                        <p className="pt-0.5 text-xs tracking-[0.01em] text-body">{[client.email, client.phone].filter(Boolean).join(" • ")}</p>
                        <p className="text-xs tracking-[0.01em] text-muted">{client.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <TaxIdentifiers row={row} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <p className="font-num text-sm font-bold text-ink">{formatAmount(row.invoiced)}</p>
                    <p className={cn("text-xs tracking-[0.01em]", active ? "text-teal" : "text-muted")}>
                      {active ? `${row.issued} ${row.issued === 1 ? "invoice" : "invoices"} issued` : `${row.drafts} ${row.drafts === 1 ? "draft" : "drafts"} / pending`}
                    </p>
                    {active && row.lastIssued ? (
                      <p className="pt-0.5 text-xs tracking-[0.01em] text-muted">{formatDate(row.lastIssued)}</p>
                    ) : (
                      <p className="pt-0.5 text-xs tracking-[0.01em] text-danger">Unsettled</p>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-xs font-medium tracking-[0.02em]", active ? "bg-mint text-mint-ink" : "bg-surface-high text-body")}>
                      <span className={cn("size-1.5 rounded-full", active ? "bg-primary" : "bg-muted")} />
                      {active ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/invoices/new?client=${client.id}`} onClick={(event) => event.stopPropagation()} className="rounded-sm bg-surface px-2 py-1 text-xs font-medium tracking-[0.02em] text-primary-ink">
                        Invoice
                      </Link>
                      <button aria-label="More actions" className="rounded-sm p-1 text-body">
                        <EllipsisVertical className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between bg-surface-low px-4 py-3">
        <p className="text-xs font-medium tracking-[0.02em] text-body">
          Page {page} of {pageCount} • {total} verified fiscal records
        </p>
        <div className="flex items-center gap-1">
          <button aria-label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)} className="rounded-sm bg-surface p-1 text-ink disabled:opacity-50">
            <ChevronLeft className="size-3.5" />
          </button>
          <button aria-label="Next page" disabled={page === pageCount} onClick={() => onPageChange(page + 1)} className="rounded-sm bg-surface p-1 text-ink disabled:opacity-50">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
