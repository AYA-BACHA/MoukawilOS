"use client";

import { useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { SelectDropdown, type Option } from "@/components/ui/select-dropdown";
import type { ClientType } from "@/types/models";

export type StatusFilter = "all" | "paid" | "pending" | "draft";
export type ClientFilter = ClientType | "all";

interface FiltersProps {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
  query: string;
  onQueryChange: (query: string) => void;
  clientType: ClientFilter;
  onClientTypeChange: (type: ClientFilter) => void;
}

const tabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "draft", label: "Drafts" },
];

const clientOptions: Option<ClientFilter>[] = [
  { value: "all", label: "All Types" },
  { value: "B2B", label: "B2B", badge: "Corporate" },
  { value: "B2C", label: "B2C", badge: "Individual" },
];

const yearOptions: Option<string>[] = [
  { value: "2026", label: "FY 2026" },
  { value: "2025", label: "FY 2025" },
];

export function Filters({
  status,
  onStatusChange,
  counts,
  query,
  onQueryChange,
  clientType,
  onClientTypeChange,
}: FiltersProps) {
  const [fiscalYear, setFiscalYear] = useState("2026");

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-card p-3 shadow-xs">
      {/* Status Filter Tabs */}
      <div className="flex rounded-lg bg-surface-low p-1">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              status === value
                ? "bg-card font-bold text-ink shadow-xs"
                : "text-body hover:text-ink",
            )}
          >
            {label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 font-num text-[11px]",
                status === value ? "bg-slate-100 text-ink font-semibold" : "text-muted",
              )}
            >
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Custom Dropdowns */}
      <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5">
        <label className="relative min-w-56 flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search client or invoice ref..."
            className="h-10 w-full rounded-lg border border-slate-200/80 bg-surface-low pl-9 pr-3 text-xs text-ink placeholder:text-muted transition-all focus:border-primary/40 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {/* Custom Client Type Dropdown - Replaces ugly native select */}
        <SelectDropdown<ClientFilter>
          label="Client:"
          value={clientType}
          options={clientOptions}
          onChange={onClientTypeChange}
        />

        {/* Fiscal Year Filter */}
        <SelectDropdown<string>
          value={fiscalYear}
          options={yearOptions}
          onChange={setFiscalYear}
          icon={<CalendarDays className="size-3.5 text-accent" />}
        />
      </div>
    </div>
  );
}
