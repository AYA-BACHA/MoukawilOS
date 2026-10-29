"use client";

import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface MoukawilSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MoukawilSpinner({ className, size = "md" }: MoukawilSpinnerProps) {
  const sizeMap = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-6",
  };

  return (
    <span
      className={cn("relative inline-flex items-center justify-center shrink-0", sizeMap[size], className)}
      role="status"
      aria-label="Chargement"
    >
      {/* Outer spinning dual-tone arc */}
      <svg
        className="size-full animate-spin motion-reduce:animate-none"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeWidth="2.5"
          className="opacity-20"
        />
        <path
          d="M12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 14.1567 3.21852 16.1458 4.42857 17.75"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="opacity-95"
        />
      </svg>
      {/* Subtle inner institutional pulse */}
      <span className="absolute size-1.5 rounded-full bg-current opacity-75 animate-ping motion-reduce:hidden" />
    </span>
  );
}

interface ActionFeedbackBannerProps {
  status: "idle" | "loading" | "success" | "error";
  loadingText?: string;
  successText?: string;
  errorText?: string | null;
  className?: string;
}

export function ActionFeedbackBanner({
  status,
  loadingText = "Traitement officiel en cours...",
  successText = "Opération enregistrée avec succès",
  errorText,
  className,
}: ActionFeedbackBannerProps) {
  if (status === "idle") return null;

  return (
    <div
      role={status === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-[-0.01em] transition-all duration-200 animate-in fade-in slide-in-from-top-1",
        status === "loading" && "bg-surface-low border border-slate-200/80 text-ink",
        status === "success" && "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 text-emerald-800 dark:text-emerald-300",
        status === "error" && "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 text-rose-800 dark:text-rose-300",
        className
      )}
    >
      {status === "loading" && (
        <>
          <MoukawilSpinner size="sm" className="text-primary" />
          <span className="flex-1">{loadingText}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted opacity-80">
            Loi 22-23
          </span>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="flex-1">{successText}</span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="size-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="flex-1">{errorText || "Une erreur est survenue lors de l'enregistrement."}</span>
        </>
      )}
    </div>
  );
}

export function ShimmerProgressBar({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="relative h-0.5 w-full bg-slate-100 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-y-0 w-1/3 bg-primary animate-[shimmer_1.4s_infinite_cubic-bezier(0.4,0,0.2,1)]" />
    </div>
  );
}

