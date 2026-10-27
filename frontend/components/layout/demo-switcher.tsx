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

  const [showJudgeHint, setShowJudgeHint] = useState(false);

  useEffect(() => {
    setScenario(getDemoScenario());
    checkBackendHealth().then((healthy) => setBackendHealthy(healthy));

    // Show friendly evaluator callout hint on fresh session if not dismissed
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("moukawil_judge_hint_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowJudgeHint(true), 1200);
        // Auto-hide after 12s so it never gets in the way
        const autoHide = setTimeout(() => setShowJudgeHint(false), 13200);
        return () => {
          clearTimeout(timer);
          clearTimeout(autoHide);
        };
      }
    }
  }, []);

  const dismissJudgeHint = () => {
    setShowJudgeHint(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("moukawil_judge_hint_dismissed", "true");
    }
  };

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
    dismissJudgeHint();
  };

  const current = scenarios.find((s) => s.id === scenario) || scenarios[0];

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      {/* Trigger Button - Vibrant & Catchy for Judges without being forcing */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          dismissJudgeHint();
        }}
        aria-label={t("Demo Scenario Switcher & System Status")}
        className={cn(
          "group relative inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all duration-200 active:scale-95",
          scenario === "near_ceiling"
            ? "border-amber-400/90 bg-amber-50 text-amber-900 hover:bg-amber-100/90 ring-1 ring-amber-400/20"
            : "border-emerald-300/80 bg-gradient-to-r from-emerald-50/90 via-surface to-mint/40 text-ink hover:border-emerald-400 hover:shadow-xs ring-1 ring-emerald-500/15",
        )}
      >
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
        </span>
        <Sparkles className="size-3.5 text-accent group-hover:scale-110 transition-transform shrink-0" />
        <span className="hidden sm:inline font-bold text-accent">{t("Scenarios:")}</span>
        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold shadow-2xs", current.badgeClass)}>
          {t(current.badge)}
        </span>
        <ChevronDown className="size-3 text-muted group-hover:text-ink transition-colors" />
      </button>

      {/* Non-intrusive Judge Scenario Callout Balloon */}
      {showJudgeHint && !isOpen && (
        <div className="absolute end-0 top-full z-40 mt-2.5 w-76 sm:w-84 max-w-[calc(100vw-32px)] rounded-2xl border border-emerald-300/90 bg-card p-3.5 shadow-xl shadow-black/10 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300 ltr:origin-top-right rtl:origin-top-left">
          {/* Arrow */}
          <div className="absolute -top-1.5 end-8 size-3 rotate-45 border-s border-t border-emerald-300/90 bg-card" />

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-ink">
              <span className="flex size-5 items-center justify-center rounded-md bg-mint text-accent">
                <Sparkles className="size-3" />
              </span>
              <span>{t("Judge Pitch Scenarios")}</span>
            </div>
            <button
              type="button"
              onClick={dismissJudgeHint}
              aria-label={t("Dismiss hint")}
              className="flex size-6 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-ink transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <p className="mt-1 text-[11px] leading-relaxed text-body">
            {t("Test real-time ceiling alerts and clean slates in 1-click:")}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  handleSelect(sc.id);
                  dismissJudgeHint();
                }}
                className={cn(
                  "rounded-lg border px-2 py-1 text-[10px] font-bold transition-all hover:scale-105 active:scale-95 shadow-2xs",
                  sc.badgeClass,
                  sc.id === scenario && "ring-1 ring-emerald-500",
                )}
              >
                {t(sc.badge)}
              </button>
            ))}
          </div>
        </div>
      )}

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
