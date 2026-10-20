"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Download, Plus, Search } from "lucide-react";
import { ClientDossier } from "@/components/clients/client-dossier";
import { ClientMetrics } from "@/components/clients/client-metrics";
import { ClientModal } from "@/components/clients/client-modal";
import { ClientsTable } from "@/components/clients/clients-table";
import { createClient, updateClient } from "@/lib/api";
import { buildClientRows, computeClientMetrics, downloadClientsCsv, sortRows, type ClientSort, type ClientStanding } from "@/lib/clients";
import { cn } from "@/lib/cn";
import type { Client, ClientInput, ClientType, InvoiceWithClient } from "@/types/models";

const PAGE_SIZE = 5;

type TypeFilter = ClientType | "all";
type StandingFilter = ClientStanding | "all";

const sortOptions: { value: ClientSort; label: string }[] = [
  { value: "revenue", label: "Highest Revenue" },
  { value: "recent", label: "Most Recent" },
  { value: "name", label: "Name A–Z" },
];

const standingOptions: { value: StandingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
];

import { SelectDropdown } from "@/components/ui/select-dropdown";
import { useI18n } from "@/lib/i18n/provider";

export function ClientsDirectory({ clients: initialClients, invoices }: { clients: Client[]; invoices: InvoiceWithClient[] }) {
  const { t } = useI18n();
  const [clients, setClients] = useState(initialClients);
  const [type, setType] = useState<TypeFilter>("all");
  const [standing, setStanding] = useState<StandingFilter>("all");
  const [sort, setSort] = useState<ClientSort>("revenue");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initialClients[0]?.id ?? null);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);

  const rows = useMemo(() => buildClientRows(clients, invoices), [clients, invoices]);
  const metrics = useMemo(() => computeClientMetrics(rows, invoices), [rows, invoices]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = rows.filter(
      ({ client, standing: rowStanding }) =>
        (type === "all" || client.type === type) &&
        (standing === "all" || rowStanding === standing) &&
        (!needle || [client.name, client.nif, client.rc, client.nis, client.email].some((field) => field?.toLowerCase().includes(needle))),
    );
    return sortRows(matches, sort);
  }, [rows, type, standing, sort, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = rows.find(({ client }) => client.id === selectedId) ?? filtered[0] ?? null;

  const reset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const submit = async (input: ClientInput) => {
    if (modal === "edit" && selected) {
      const updated = await updateClient(selected.client, input);
      setClients((current) => current.map((client) => (client.id === updated.id ? updated : client)));
    } else {
      const created = await createClient(input);
      setClients((current) => [...current, created]);
      setSelectedId(created.id);
    }
    setModal(null);
  };

  const tabs: { value: TypeFilter; label: string; count: number }[] = [
    { value: "all", label: "All Clients", count: metrics.total },
    { value: "B2B", label: "Corporate B2B", count: metrics.business },
    { value: "B2C", label: "Individual B2C", count: metrics.individual },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="flex items-center gap-1 pb-1 text-xs font-medium uppercase tracking-[0.05em]">
            <span className="text-teal">{t("Statutory Database")}</span>
            <span className="text-muted">/</span>
            <span className="text-teal">{t("Fiscal Registry")}</span>
          </p>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.025em] text-ink">{t("Clients Directory")}</h1>
          <p className="max-w-lg pt-0.5 text-sm text-body">{t("Manage verified B2B corporate entities and B2C individual clients with statutory tax identification.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => downloadClientsCsv(filtered)} className="flex items-center gap-1 rounded bg-surface px-3 py-2 text-sm font-medium text-ink">
            <Download className="size-3" />
            {t("Export Registry")}
          </button>
          <button onClick={() => setModal("new")} className="flex items-center gap-1 rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <Plus className="size-3" />
            {t("Add New Client")}
          </button>
        </div>
      </div>

      <ClientMetrics metrics={metrics} />

      <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex rounded bg-surface-low p-1">
          {tabs.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => reset(setType)(value)}
              className={cn("whitespace-nowrap rounded px-3 py-1.5 text-sm", type === value ? "bg-card font-semibold text-primary-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : "font-medium text-body")}
            >
              {t(label)} ({count})
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <label className="relative min-w-60 max-w-xs flex-1">
            <Search className="absolute start-3.5 top-1/2 size-[13px] -translate-y-1/2 text-body" />
            <input
              value={query}
              onChange={(event) => reset(setQuery)(event.target.value)}
              placeholder={t("Search client name, NIF, RC, or contact email...")}
              className="h-10 w-full rounded bg-surface-low ps-9 pe-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <SelectDropdown label={t("Sort:")} value={sort} options={sortOptions} onChange={reset(setSort)} />
          <SelectDropdown label={t("Status:")} value={standing} options={standingOptions} onChange={reset(setStanding)} />
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <ClientsTable rows={visible} total={filtered.length} selectedId={selected?.client.id ?? null} onSelect={setSelectedId} page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        {selected && <ClientDossier row={selected} onEdit={() => setModal("edit")} />}
      </div>

      {modal && <ClientModal client={modal === "edit" ? (selected?.client ?? null) : null} onClose={() => setModal(null)} onSubmit={submit} />}
    </div>
  );
}
