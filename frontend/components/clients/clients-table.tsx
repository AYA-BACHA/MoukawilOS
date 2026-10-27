"use client";

import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight, EllipsisVertical, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import type { ClientRow } from "@/lib/clients";
import { useI18n } from "@/lib/i18n/provider";

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
  const { t } = useI18n();
  const { client } = row;
  if (client.type === "B2C") {
    return (
      <>
        <Identifier label={t("ID:")} value="Resident Consumer" tone="text-body" />
        <Identifier label={t("Tax:")} value="Exempt (B2C Article 4)" tone="text-teal" />
      </>
    );
  }
  return (
    <>
      {client.nif && <Identifier label={t("NIF:")} value={client.nif} tone="text-ink" />}
      {client.rc && <Identifier label={t("RC:")} value={client.rc} tone="text-body" />}
      {client.nis && <Identifier label={t("NIS:")} value={client.nis} tone="text-muted" />}
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
  const { t, formatAmount, formatDate } = useI18n();
  return (
    <section className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden rounded-lg bg-card shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between bg-surface-low px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-body">{t("Registered client entities (Algerian jurisdiction)")}</h2>
        <p className="text-xs font-medium tracking-[0.02em] text-teal">
          {t("Showing {length} of {total} records", { length: rows.length, total })}
        </p>
      </div>

      {/* Mobile Stacked Card View (< md) */}
      <div className="flex flex-col divide-y divide-slate-100 md:hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-mint text-accent">
              <Users className="size-5" />
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{t("No client records found")}</p>
            <p className="mt-1 text-xs text-muted">
              {t("No registered client entities match your current search query.")}
            </p>
          </div>
        ) : (
          rows.map((row) => {
            const { client } = row;
            const business = client.type === "B2B";
            const active = row.standing === "active";
            const isSelected = client.id === selectedId;

            return (
              <div
                key={client.id}
                onClick={() => onSelect(client.id)}
                className={cn(
                  "p-4 flex flex-col gap-3 transition-colors cursor-pointer",
                  isSelected ? "bg-surface-low/80 ring-1 ring-primary/20" : "hover:bg-slate-50/70",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded text-xs font-bold", business ? "bg-surface text-primary-ink" : "bg-surface-high text-ink")}>
                      {initials(client.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{client.name}</p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={cn("rounded px-1.5 py-0.2 text-[10px] font-semibold", business ? "bg-mint text-mint-ink" : "bg-surface text-body")}>
                          {business ? t("B2B") : t("B2C")}
                        </span>
                        {client.anaeVerified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-teal font-medium">
                            <BadgeCheck className="size-3" />
                            {t("ANAE")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0", active ? "bg-mint text-mint-ink" : "bg-surface-high text-body")}>
                    <span className={cn("size-1.5 rounded-full", active ? "bg-primary" : "bg-muted")} />
                    {active ? t("Active") : t("Pending")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded bg-surface-low/60 p-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-muted block">{business ? t("Tax Identifier") : t("Status")}</span>
                    <span className="font-num text-ink font-medium">{business ? (client.nif || client.rc || "—") : t("Consumer")}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] uppercase text-muted block">{t("Total Invoiced")}</span>
                    <span className="font-num text-ink font-bold">{formatAmount(row.invoiced)} <span className="text-[10px] text-muted">{t("DZD")}</span></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <span className="text-xs text-muted truncate">{client.location || client.email || "Algeria"}</span>
                  <Link
                    href={`/invoices/new?client=${client.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-primary-ink active:scale-95"
                  >
                    {t("Invoice")}
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px] text-start">
          <thead>
            <tr>
              <th className={cn(headClass, "px-4")}>{t("Client / Corporate Profile")}</th>
              <th className={headClass}>{t("Tax Identifier")}</th>
              <th className={cn(headClass, "text-end")}>{t("Invoiced (DZD)")}</th>
              <th className={headClass}>{t("Compliance")}</th>
              <th className={cn(headClass, "px-4 text-end")}>{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-mint text-accent">
                      <Users className="size-5" />
                    </div>
                    <p className="text-sm font-semibold text-ink">{t("No client records found")}</p>
                    <p className="max-w-xs text-xs text-muted">
                      {t("No registered client entities match your current search query.")}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
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
                          <span className={cn("rounded px-2 py-0.5 text-xs font-medium tracking-[0.02em]", business ? "bg-mint text-mint-ink" : "bg-surface text-body")}>{business ? t("B2B Corporate") : t("B2C Individual")}</span>
                          {client.anaeVerified && (
                            <span className="inline-flex items-center gap-0.5 rounded-sm bg-surface px-1.5 py-0.5 text-xs font-medium tracking-[0.02em] text-teal">
                              <BadgeCheck className="size-3" />
                              {t("ANAE")}
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
                  <td className="px-3 py-3 text-end">
                    <p className="font-num text-sm font-bold text-ink">{formatAmount(row.invoiced)}</p>
                    <p className={cn("text-xs tracking-[0.01em]", active ? "text-teal" : "text-muted")}>
                      {active ? t(row.issued === 1 ? "{n} invoice issued" : "{n} invoices issued", { n: row.issued }) : t(row.drafts === 1 ? "{n} draft / pending" : "{n} drafts / pending", { n: row.drafts })}
                    </p>
                    {active && row.lastIssued ? (
                      <p className="pt-0.5 text-xs tracking-[0.01em] text-muted">{formatDate(row.lastIssued)}</p>
                    ) : (
                      <p className="pt-0.5 text-xs tracking-[0.01em] text-danger">{t("Unsettled")}</p>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-xs font-medium tracking-[0.02em]", active ? "bg-mint text-mint-ink" : "bg-surface-high text-body")}>
                      <span className={cn("size-1.5 rounded-full", active ? "bg-primary" : "bg-muted")} />
                      {active ? t("Active") : t("Pending")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/invoices/new?client=${client.id}`} onClick={(event) => event.stopPropagation()} className="rounded-sm bg-surface px-2 py-1 text-xs font-medium tracking-[0.02em] text-primary-ink">
                        {t("Invoice")}
                      </Link>
                      <button aria-label={t("More actions")} className="rounded-sm p-1 text-body">
                        <EllipsisVertical className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between bg-surface-low px-4 py-3">
        <p className="text-xs font-medium tracking-[0.02em] text-body">
          {t("Page {page} of {pageCount} • {total} verified fiscal records", { page, pageCount, total })}
        </p>
        <div className="flex items-center gap-1">
          <button aria-label={t("Previous page")} disabled={page === 1} onClick={() => onPageChange(page - 1)} className="rounded-sm bg-surface p-1 text-ink disabled:opacity-50">
            <ChevronLeft className="rtl:-scale-x-100 size-3.5" />
          </button>
          <button aria-label={t("Next page")} disabled={page === pageCount} onClick={() => onPageChange(page + 1)} className="rounded-sm bg-surface p-1 text-ink disabled:opacity-50">
            <ChevronRight className="rtl:-scale-x-100 size-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
