import { CalendarDays, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
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

const fieldClass = "h-10 rounded bg-surface-low shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]";

export function Filters({ status, onStatusChange, counts, query, onQueryChange, clientType, onClientTypeChange }: FiltersProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex rounded bg-surface-low p-1">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusChange(value)}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs tracking-[0.02em]",
              status === value ? "bg-white font-semibold text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : "font-medium text-body",
            )}
          >
            {label}
            <span className="font-num font-normal text-muted">{counts[value]}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <label className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-[14px] -translate-y-1/2 text-body" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search client or invoice ref"
            className={cn(fieldClass, "w-full pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30")}
          />
        </label>
        <label className={cn(fieldClass, "relative flex items-center gap-1 pl-3 pr-8 text-sm")}>
          <span className="font-medium text-muted">Client:</span>
          <select
            value={clientType}
            onChange={(event) => onClientTypeChange(event.target.value as ClientFilter)}
            className="appearance-none bg-transparent font-semibold text-ink outline-none"
          >
            <option value="all">All Types</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-3 text-body" />
        </label>
        <div className={cn(fieldClass, "flex items-center gap-1.5 px-3 text-sm font-semibold text-ink")}>
          <CalendarDays className="size-3.5 text-body" />
          FY 2026
          <ChevronDown className="size-3 text-body" />
        </div>
      </div>
    </div>
  );
}
