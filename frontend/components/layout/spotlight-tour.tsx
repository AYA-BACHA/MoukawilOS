"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/provider";

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
  path?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-ceiling-card",
    title: "Step 1: 5,000,000 DZD Annual Ceiling",
    description:
      "Under Algerian Law 22-23 (Art. 2), auto-entrepreneurs can collect up to 5,000,000 DZD per fiscal year. This real-time gauge tracks your collected turnover and alerts you before reaching statutory capacity.",
    placement: "bottom",
    path: "/dashboard",
  },
  {
    targetId: "tour-pending-inflow",
    title: "Step 2: Cash-Basis Protection",
    description:
      "Crucial protection: under Executive Decree 23-197, issued or pending client invoices do NOT consume your 5M cap until the funds are officially credited to your bank account or CCP. You never pay tax on uncashed invoices.",
    placement: "top",
    path: "/dashboard",
  },
  {
    targetId: "tour-statutory-deadline",
    title: "Step 3: 0.5% Flat IFU Tax & G50-A Deadline",
    description:
      "Your sole fiscal obligation is a single flat 0.5% IFU rate on collected turnover. MoukawilOS tracks your annual G50-A declaration deadline (June 30th) to ensure timely filing without audits or penalties.",
    placement: "top",
    path: "/dashboard",
  },
  {
    targetId: "tour-operational-indicators",
    title: "Step 4: 0% VAT Exemption & Social Security",
    description:
      "As an auto-entrepreneur, you operate with 0% VAT exemption legally certified on all vouchers, full CASNOS healthcare and retirement coverage, and automated real-time IFU tax estimation.",
    placement: "top",
    path: "/dashboard",
  },
  {
    targetId: "tour-recent-invoices",
    title: "Step 5: Payment Clearance & Official Receipts",
    description:
      "Track your billing pipeline in real time. When a debtor settles via BNA, CPA, or CCP, click 'Mark as Paid' to verify settlement details and print decree-compliant realization receipts.",
    placement: "top",
    path: "/dashboard",
  },
  {
    targetId: "tour-new-invoice",
    title: "Step 6: Generating Compliant Invoices",
    description:
      "Create professional invoices in seconds. Every invoice includes your official ANAE registration number, mandatory 0% VAT legal citation, client tax identification (NIF/NIS), and instant PDF generation.",
    placement: "bottom",
  },
  {
    targetId: "tour-fiscal-year",
    title: "Step 7: Multi-Year Fiscal Cycle",
    description:
      "Auto-entrepreneurs can maintain this status for up to 3 consecutive fiscal years. Switch between active and closed fiscal years (2026, 2025, 2024) with complete accounting separation.",
    placement: "bottom",
  },
  {
    targetId: "tour-notifications",
    title: "Step 8: Automated Regulatory Sentinel",
    description:
      "Get proactive compliance alerts for approaching filing deadlines, statutory ceiling milestone warnings at 80% and 90%, and ANAE national card registry renewals.",
    placement: "bottom",
  },
  {
    targetId: "tour-sidebar-nav",
    title: "Step 9: Ledger, Clients & AI Legal Assistant",
    description:
      "Navigate your complete commercial operations: the Invoices Ledger, client dossiers with NIF validation, and the AI Assistant trained on Algerian tax legislation to answer any legal question.",
    placement: "right",
  },
  {
    targetId: "tour-how-it-works",
    title: "Step 10: Permanent Interactive Help",
    description:
      "Whenever you have a doubt about tax rates, invoice rules, or ceiling limits, click 'How Moukawil Works' to reopen this guided walkthrough anytime. You are ready to succeed!",
    placement: "right",
  },
];

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpotlightTour({ isOpen, onClose }: SpotlightTourProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const step = TOUR_STEPS[currentStep];

  // Helper to check if element is already comfortably in view
  const isElementInViewport = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 70 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 70 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // Update target bounding rect
  const updateRect = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, step]);

  // Always reset to step 0 when tour is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Navigate if step requires specific path & smooth-scroll only if needed
  useEffect(() => {
    if (!isOpen || !step) return;

    if (step.path && pathname !== step.path) {
      router.push(step.path);
    }

    // Measure target element
    const checkAndMeasure = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        if (!isElementInViewport(el)) {
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          const scrollTimer = setTimeout(updateRect, 400);
          return () => clearTimeout(scrollTimer);
        } else {
          updateRect();
        }
      }
    };

    // Run measurement immediately and after a short mount tick
    checkAndMeasure();
    const timer = setTimeout(checkAndMeasure, 120);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep, step, pathname, router, updateRect]);

  // RAF-throttled scroll & resize listener for 60/120fps smoothness
  useEffect(() => {
    if (!isOpen) return;

    let rafId: number | null = null;
    const handleScrollOrResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateRect);
    };

    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize);
    };
  }, [isOpen, updateRect]);

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        if (currentStep < TOUR_STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          onClose();
        }
      } else if (event.key === "ArrowLeft") {
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, onClose]);

  if (!isOpen) return null;

  // Calculate popover coordinates
  const PADDING = 8;
  const TOOLTIP_WIDTH = 340;
  const TOOLTIP_HEIGHT = 160;

  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 60,
    transition: "top 400ms cubic-bezier(0.16, 1, 0.3, 1), left 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
  };

  let arrowPlacement: "top" | "bottom" | "left" | "right" = "top";
  let arrowOffset = 24;

  if (targetRect) {
    let placement = step.placement ?? "bottom";

    // Auto-flip if tooltip would exceed screen boundary
    if (placement === "bottom" && targetRect.bottom + PADDING + 12 + TOOLTIP_HEIGHT > window.innerHeight - 16) {
      placement = "top";
    } else if (placement === "top" && targetRect.top - PADDING - TOOLTIP_HEIGHT - 12 < 16) {
      placement = "bottom";
    } else if (placement === "right" && targetRect.right + PADDING + 12 + TOOLTIP_WIDTH > window.innerWidth - 16) {
      placement = "left";
    } else if (placement === "left" && targetRect.left - PADDING - TOOLTIP_WIDTH - 12 < 16) {
      placement = "right";
    }

    if (placement === "bottom") {
      const top = targetRect.bottom + PADDING + 12;
      const left = Math.max(16, Math.min(window.innerWidth - TOOLTIP_WIDTH - 16, targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2));
      tooltipStyle = { ...tooltipStyle, top, left };
      arrowPlacement = "top";
      arrowOffset = Math.max(16, Math.min(TOOLTIP_WIDTH - 24, targetRect.left + targetRect.width / 2 - left));
    } else if (placement === "top") {
      const top = Math.max(16, targetRect.top - PADDING - TOOLTIP_HEIGHT - 12);
      const left = Math.max(16, Math.min(window.innerWidth - TOOLTIP_WIDTH - 16, targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2));
      tooltipStyle = { ...tooltipStyle, top, left };
      arrowPlacement = "bottom";
      arrowOffset = Math.max(16, Math.min(TOOLTIP_WIDTH - 24, targetRect.left + targetRect.width / 2 - left));
    } else if (placement === "right") {
      const left = targetRect.right + PADDING + 12;
      const top = Math.max(16, Math.min(window.innerHeight - TOOLTIP_HEIGHT - 16, targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT / 2));
      tooltipStyle = { ...tooltipStyle, top, left };
      arrowPlacement = "left";
      arrowOffset = Math.max(16, Math.min(TOOLTIP_HEIGHT - 24, targetRect.top + targetRect.height / 2 - top));
    } else if (placement === "left") {
      const left = Math.max(16, targetRect.left - PADDING - TOOLTIP_WIDTH - 12);
      const top = Math.max(16, Math.min(window.innerHeight - TOOLTIP_HEIGHT - 16, targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT / 2));
      tooltipStyle = { ...tooltipStyle, top, left };
      arrowPlacement = "right";
      arrowOffset = Math.max(16, Math.min(TOOLTIP_HEIGHT - 24, targetRect.top + targetRect.height / 2 - top));
    }
  } else {
    // Center fallback if target element not yet found
    tooltipStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 60,
      transition: "top 400ms cubic-bezier(0.16, 1, 0.3, 1), left 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
    };
  }

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("moukawil_spotlight_tour_done", "true");
      }
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Invisible backdrop click-listener to close when clicking the dark area */}
      <div
        className="fixed inset-0 z-40 pointer-events-auto"
        onClick={onClose}
      />

      {/* Fallback dark overlay when targetRect is calculating */}
      {!targetRect && (
        <div className="fixed inset-0 z-45 bg-slate-950/65 transition-opacity duration-300" />
      )}

      {/* Crystal-Clear Spotlight Hole with Outward-Only Dark Overlay & Crisp White Ring */}
      {targetRect && (
        <div
          className="fixed rounded-2xl pointer-events-none"
          style={{
            left: targetRect.left - PADDING,
            top: targetRect.top - PADDING,
            width: targetRect.width + PADDING * 2,
            height: targetRect.height + PADDING * 2,
            borderRadius: "18px",
            boxShadow: "0 0 0 3.5px #ffffff, 0 0 0 9999px rgba(15, 23, 42, 0.68), 0 12px 35px -8px rgba(0, 0, 0, 0.45)",
            zIndex: 50,
            transition: "top 400ms cubic-bezier(0.16, 1, 0.3, 1), left 400ms cubic-bezier(0.16, 1, 0.3, 1), width 400ms cubic-bezier(0.16, 1, 0.3, 1), height 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      )}

      {/* Popover Card (matching user screenshot) */}
      <div
        style={tooltipStyle}
        className="pointer-events-auto w-[340px] rounded-2xl border border-slate-100 bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Caret Arrow pointing to target */}
        {targetRect && (
          <>
            {arrowPlacement === "top" && (
              <div
                style={{ left: arrowOffset - 6, transition: "left 400ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                className="absolute -top-2 size-3 rotate-45 border-s border-t border-slate-100 bg-card"
              />
            )}
            {arrowPlacement === "bottom" && (
              <div
                style={{ left: arrowOffset - 6, transition: "left 400ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                className="absolute -bottom-2 size-3 rotate-45 border-b border-e border-slate-100 bg-card"
              />
            )}
            {arrowPlacement === "left" && (
              <div
                style={{ top: arrowOffset - 6, transition: "top 400ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                className="absolute -start-2 size-3 rotate-45 border-b border-s border-slate-100 bg-card"
              />
            )}
            {arrowPlacement === "right" && (
              <div
                style={{ top: arrowOffset - 6, transition: "top 400ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                className="absolute -end-2 size-3 rotate-45 border-e border-t border-slate-100 bg-card"
              />
            )}
          </>
        )}

        {/* Card Content with crossfade */}
        <div key={currentStep} className="animate-in fade-in duration-200">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-bold tracking-tight text-slate-900">{t(step.title)}</h4>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("Close walkthrough")}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{t(step.description)}</p>
        </div>

        {/* Card Footer: Step Counter + Progress Dots + Pill Buttons */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {t("Step {v1} of {length}", { v1: currentStep + 1, length: TOUR_STEPS.length })}
            </span>
            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    idx === currentStep ? "w-3.5 bg-primary" : "w-1 bg-slate-200 dark:bg-slate-700",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-slate-200 bg-card px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all hover:bg-slate-50 active:scale-95"
              >
                {t("Back")}
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-ink active:scale-95"
            >
              {currentStep === TOUR_STEPS.length - 1 ? t("Finish") : t("Next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
