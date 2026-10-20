"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/provider";

export interface Option<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

interface SelectDropdownProps<T extends string> {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
  icon?: React.ReactNode;
}

export function SelectDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  buttonClassName,
  icon,
}: SelectDropdownProps<T>) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative inline-block text-start", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200/80 bg-surface-low px-3 py-1.5 text-xs font-medium tracking-[0.01em] text-body transition-all hover:border-slate-300 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20",
          open && "border-primary/40 ring-2 ring-primary/20",
          buttonClassName,
        )}
      >
        {icon}
        {label && <span className="font-normal text-muted">{label}</span>}
        <span className="font-semibold text-ink">{t(selected?.label ?? value)}</span>
        {selected?.badge && (
          <span className="rounded bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-mint-ink">
            {t(selected.badge)}
          </span>
        )}
        <ChevronDown
          className={cn("size-3.5 text-muted transition-transform duration-200", open && "rotate-180 text-accent")}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[180px] origin-top rounded-xl border border-slate-200 bg-card p-1 shadow-xl shadow-black/8 backdrop-blur-sm animate-in fade-in zoom-in-95",
            className?.includes("w-full") ? "start-0 end-0 w-full" : "end-0",
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-mint/50 font-semibold text-primary-ink"
                    : "text-body hover:bg-surface-low hover:text-ink",
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{t(option.label)}</span>
                  {option.badge && (
                    <span className="rounded bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-mint-ink">
                      {t(option.badge)}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="size-3.5 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
