"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Database,
  Play,
  Server,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { checkBackendHealth, getDemoScenario, setDemoScenario, type DemoScenario } from "@/lib/api";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

interface DemoSwitcherProps {
  onStartTour?: () => void;
}

const scenarios: {
  id: DemoScenario;
  title: string;
  badge: string;
  badgeClass: string;
  utilization: string;
  description: string;
}[] = [
  {
    id: "standard",
    title: "Standard Active Freelancer",
    badge: "40% Ceiling",
    badgeClass: "bg-mint text-mint-ink border-emerald-300",
    utilization: "2,000,000 DZD",
    description: "Healthy operations, 3M DZD capacity available. Compliant with Law 22-23 cash-basis rules.",
  },
  {
    id: "near_ceiling",
    title: "Near Statutory Cap Warning",
    badge: "94% Alert",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    utilization: "4,700,000 DZD",
    description: "Triggers statutory warning banner under Law 22-23 Art. 13 (only 300,000 DZD remaining).",
  },
  {
    id: "new_user",
    title: "Fresh Auto-Entrepreneur",
    badge: "0% Clean Slate",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-300",
    utilization: "0 DZD",
    description: "New registration, clean ledger, full 5,000,000 DZD headroom available.",
  },
];

export function DemoSwitcher({ onStartTour }: DemoSwitcherProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [scenario, setScenario] = useState<DemoScenario>("standard");
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScenario(getDemoScenario());
    checkBackendHealth().then((healthy) => setBackendHealthy(healthy));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selected: DemoScenario) => {
    setScenario(selected);
    setDemoScenario(selected);
    setIsOpen(false);
  };

  const current = scenarios.find((s) => s.id === scenario) || scenarios[0];

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("Demo Scenario Switcher & System Status")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all active:scale-95",
          scenario === "near_ceiling"
            ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
            : "border-slate-200/80 bg-surface-low text-ink hover:bg-surface hover:border-slate-300",
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full",
            backendHealthy ? "bg-emerald-500 animate-pulse" : "bg-teal",
          )}
          title={backendHealthy ? "FastAPI Backend Connected" : "Backend Ready"}
        />
        <span className="hidden sm:inline font-medium text-body">{t("Scenario:")}</span>
        <span className="font-bold">{t(current.badge)}</span>
        <ChevronDown className="size-3 text-muted" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute end-0 top-full z-50 mt-2 w-84 sm:w-96 rounded-2xl border border-slate-200 bg-card p-4 shadow-2xl animate-in fade-in zoom-in-95 ltr:origin-top-right rtl:origin-top-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary-ink">
                <Sparkles className="size-4 text-accent" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-ink">{t("Judge Demo & Scenario Control")}</h4>
                <p className="text-[11px] text-muted">{t("1-click interactive simulation for pitch demos")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Backend Architecture Live Status Badge */}
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Server className="size-3.5 text-emerald-700" />
                <span className="font-semibold text-emerald-950">FastAPI & Supabase PostgreSQL</span>
              </div>
              <span className="flex items-center gap-1 font-bold text-[10px] uppercase text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {backendHealthy ? t("Live Connected") : t("Active & Resilient")}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-900/80">
              {t("Live client-server sync with automated fallback to Law 22-23 statutory engine.")}
            </p>
          </div>

          {/* Scenarios List */}
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted px-1">
              {t("Choose Turnover Simulation:")}
            </p>
            {scenarios.map((sc) => {
              const active = sc.id === scenario;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelect(sc.id)}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border p-3 text-start transition-all duration-150 active:scale-[0.99]",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                      : "border-slate-200/80 bg-surface-low hover:bg-surface hover:border-slate-300",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">{t(sc.title)}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-bold", sc.badgeClass)}>
                        {t(sc.badge)}
                      </span>
                      {active && <Check className="size-3.5 text-accent stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-body">{t(sc.description)}</p>
                </button>
              );
            })}
          </div>

          {/* Interactive Guided Pitch Mode Trigger */}
          {onStartTour && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onStartTour();
                }}
                className="flex w-full min-h-[40px] items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary-ink active:scale-95"
              >
                <Play className="size-3.5 fill-white" />
                {t("Launch Guided 2-Min Pitch Walkthrough")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
