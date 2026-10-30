"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { MoukawilSpinner } from "@/components/ui/action-loading";
import { setupDemoSessionAction } from "@/lib/auth-actions";
import { useI18n } from "@/lib/i18n/provider";

export type DemoButtonVariant = "outline" | "primary" | "nav" | "cta";

interface DemoLoginButtonProps {
  variant?: DemoButtonVariant;
  className?: string;
  showSubtext?: boolean;
}

export function DemoLoginButton({
  variant = "outline",
  className,
  showSubtext = true,
}: DemoLoginButtonProps) {
  const { t } = useI18n();
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutGuardRef = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    {
      title: t("Waking up the demo…"),
      desc: t("The server may take a moment to start. Thanks for your patience."),
    },
    {
      title: t("Connecting to the server…"),
      desc: t("The server may take a moment to start. Thanks for your patience."),
    },
    {
      title: t("Loading your demo workspace…"),
      desc: t("The server may take a moment to start. Thanks for your patience."),
    },
    {
      title: t("Almost there…"),
      desc: t("The server may take a moment to start. Thanks for your patience."),
    },
  ];

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
    };
  }, []);

  const handleLaunch = async () => {
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);
    setStepIndex(0);

    // Clean session flags for fresh demo experience
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("moukawil_session_tour_shown");
        sessionStorage.setItem("moukawil_demo_login", "true");
      } catch {
        // ignore
      }
    }

    // Step progression timer
    let currentStep = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      currentStep += 1;
      if (currentStep < steps.length) {
        setStepIndex(currentStep);
      }
    }, 3500);

    // Safety timeout: if server is completely unresponsive after 22s
    if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
    timeoutGuardRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus("error");
      setErrorMessage(
        t("The demo server took too long to respond. The server may still be spinning up.")
      );
    }, 22000);

    try {
      const res = await setupDemoSessionAction();
      if (!res.success) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
        setStatus("error");
        setErrorMessage(res.error || t("Unable to connect to the demo server."));
        return;
      }

      // Navigate directly to demo workspace without duplicate RSC re-fetching
      window.location.href = "/dashboard?tour=true";
    } catch (err: unknown) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
      setStatus("error");
      const msg = err instanceof Error ? err.message : t("Unable to connect to the demo server.");
      setErrorMessage(msg);
    }
  };

  // Base styling per variant
  const getButtonStyles = () => {
    switch (variant) {
      case "primary":
        return "flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-xs hover:bg-primary-ink active:scale-98 transition-all group-hover:shadow-md group-hover:shadow-primary/20 disabled:opacity-75 disabled:cursor-wait";
      case "nav":
        return "flex h-9 items-center gap-1.5 rounded-lg border border-emerald-300/80 bg-mint px-2.5 sm:px-3 text-xs font-bold text-mint-ink shadow-2xs hover:bg-mint/80 active:scale-95 transition-all disabled:opacity-75 disabled:cursor-wait";
      case "cta":
        return "flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#0c312d] shadow-lg hover:bg-white/90 active:scale-95 transition-all disabled:opacity-75 disabled:cursor-wait";
      case "outline":
      default:
        return buttonClass(
          "outline",
          "h-11 w-full justify-center gap-2 rounded-lg text-sm border-slate-300 font-semibold hover:bg-surface-low disabled:opacity-75 disabled:cursor-wait"
        );
    }
  };

  const currentStep = steps[stepIndex] || steps[0];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={handleLaunch}
        disabled={status === "loading"}
        aria-busy={status === "loading"}
        className={cn(getButtonStyles(), status === "loading" && "pointer-events-none")}
      >
        {status === "loading" ? (
          <>
            <MoukawilSpinner
              size="sm"
              className={variant === "primary" ? "text-white" : "text-primary"}
            />
            <span className="truncate">{currentStep.title}</span>
          </>
        ) : (
          <>
            <Sparkles
              className={cn(
                "size-4 shrink-0",
                variant === "cta" ? "text-emerald-700" : "text-accent"
              )}
            />
            <span>
              {variant === "nav"
                ? t("Try Demo")
                : variant === "primary"
                ? t("Launch Demo Mode")
                : variant === "cta"
                ? t("Try Demo Account (Instant)")
                : t("Continue with the demo account")}
            </span>
            {variant === "primary" && (
              <ArrowRight className="size-3.5 rtl:-scale-x-100 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            )}
          </>
        )}
      </button>

      {/* Loading state indicator with progressive messages */}
      {status === "loading" && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-1 rounded-xl border border-emerald-300/70 bg-mint/30 p-2.5 text-center animate-in fade-in slide-in-from-top-1"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-mint-ink">
            <span className="size-2 rounded-full bg-emerald-600 animate-ping" />
            <span>{currentStep.title}</span>
          </div>
          <p className="text-[11px] text-body leading-relaxed">
            {currentStep.desc}
          </p>
        </div>
      )}

      {/* Error state with retry action */}
      {status === "error" && (
        <div
          role="alert"
          aria-live="polite"
          className="flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-start animate-in fade-in"
        >
          <p className="text-xs font-semibold text-rose-900 leading-snug">
            {errorMessage || t("Unable to connect to the demo server.")}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLaunch}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all"
            >
              <RefreshCw className="size-3.5" />
              <span>{t("Retry")}</span>
            </button>
            <span className="text-[10px] text-rose-700">
              {t("Preserves your state without refreshing the page.")}
            </span>
          </div>
        </div>
      )}

      {status === "idle" && showSubtext && (
        <p className="text-center text-[11px] text-muted">
          {variant === "primary"
            ? t("No registration required")
            : t("Demo environment: no real account is created or stored.")}
        </p>
      )}
    </div>
  );
}
