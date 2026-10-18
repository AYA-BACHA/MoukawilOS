"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";

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
    title: "Start here: 5,000,000 DZD Ceiling",
    description:
      "This is your statutory turnover tracker under Algerian Law 22-23. It monitors your 5,000,000 DZD annual ceiling and alerts you before reaching capacity.",
    placement: "bottom",
    path: "/dashboard",
  },
  {
    targetId: "tour-pending-inflow",
    title: "Cash-Basis Protection",
    description:
      "Under Executive Decree 23-197, you only recognize turnover upon cash clearance into your bank or CCP. Unpaid client invoices do not consume your ceiling.",
    placement: "top",
    path: "/dashboard",
  },
  {
    targetId: "tour-statutory-deadline",
    title: "0.5% Flat IFU Tax & Form G50-A",
    description:
      "Your sole fiscal obligation is a flat 0.5% IFU tax on cashed revenue, payable annually via declaration form G50-A before June 30th.",
    placement: "top",
    path: "/dashboard",
  },
  {
    targetId: "tour-sidebar-nav",
    title: "Operational Core",
    description:
      "Everything else: manage your commercial Invoices Ledger, verified B2B/B2C client directory, regulatory AI Assistant, and statutory settings.",
    placement: "right",
  },
  {
    targetId: "tour-new-invoice",
    title: "Compliant Commercial Invoicing",
    description:
      "Issue professional invoices with permanent 0% VAT exemption clauses, client tax ID verification (NIF/NIS), and official QR certification.",
    placement: "bottom",
  },
  {
    targetId: "tour-how-it-works",
    title: "Revisit This Guide Anytime",
    description:
      "Click 'How Moukawil Works' whenever you need a quick interactive refresher on fiscal rules or navigation. You're all set to go!",
    placement: "right",
  },
];

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpotlightTour({ isOpen, onClose }: SpotlightTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const step = TOUR_STEPS[currentStep];

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

  // Navigate if step requires specific path
  useEffect(() => {
    if (!isOpen || !step) return;

    if (step.path && pathname !== step.path) {
      router.push(step.path);
    }

    // Immediate measurement if element is already present
    updateRect();

    // Scroll element smoothly into view
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }

    // Keep measuring smoothly during scroll animation
    const interval = setInterval(updateRect, 30);
    const stopTimer = setTimeout(() => {
      clearInterval(interval);
      updateRect();
    }, 600);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, [isOpen, currentStep, step, pathname, router, updateRect]);

  // Listen to window scroll & resize
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* SVG Mask Spotlight Cutout */}
      <svg className="fixed inset-0 h-full w-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - PADDING}
                y={targetRect.top - PADDING}
                width={targetRect.width + PADDING * 2}
                height={targetRect.height + PADDING * 2}
                rx="18"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#tour-spotlight-mask)"
          className="backdrop-blur-xs"
        />
      </svg>

      {/* Spotlight Ring Border */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-2xl ring-4 ring-white shadow-2xl transition-all duration-300 ease-out"
          style={{
            left: targetRect.left - PADDING,
            top: targetRect.top - PADDING,
            width: targetRect.width + PADDING * 2,
            height: targetRect.height + PADDING * 2,
            zIndex: 55,
          }}
        />
      )}

      {/* Popover Card (matching user screenshot) */}
      <div
        style={tooltipStyle}
        className="w-[340px] rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Caret Arrow pointing to target */}
        {targetRect && (
          <>
            {arrowPlacement === "top" && (
              <div
                style={{ left: arrowOffset - 6 }}
                className="absolute -top-2 size-3 rotate-45 border-l border-t border-slate-100 bg-white"
              />
            )}
            {arrowPlacement === "bottom" && (
              <div
                style={{ left: arrowOffset - 6 }}
                className="absolute -bottom-2 size-3 rotate-45 border-b border-r border-slate-100 bg-white"
              />
            )}
            {arrowPlacement === "left" && (
              <div
                style={{ top: arrowOffset - 6 }}
                className="absolute -left-2 size-3 rotate-45 border-b border-l border-slate-100 bg-white"
              />
            )}
            {arrowPlacement === "right" && (
              <div
                style={{ top: arrowOffset - 6 }}
                className="absolute -right-2 size-3 rotate-45 border-r border-t border-slate-100 bg-white"
              />
            )}
          </>
        )}

        {/* Card Content */}
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-bold tracking-tight text-slate-900">{step.title}</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close walkthrough"
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{step.description}</p>

        {/* Card Footer: Step Counter + Pill Buttons */}
        <div className="mt-4 flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-500">
            {currentStep + 1} of {TOUR_STEPS.length}
          </span>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-slate-800 active:scale-95"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
