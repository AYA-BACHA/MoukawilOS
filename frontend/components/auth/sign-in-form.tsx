"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { buttonClass } from "@/components/ui/button";
import { demoSignInAction, signInAction, type AuthState } from "@/lib/auth-actions";
import { useI18n } from "@/lib/i18n/provider";

export function SignInForm() {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signInAction, {});

  return (
    <AuthShell
      title={t("Welcome back")}
      subtitle={t("Sign in to your MoukawilOS workspace.")}
      footer={
        <>
          {t("New to MoukawilOS?")}{" "}
          <Link href="/sign-up" className="font-semibold text-accent hover:underline">
            {t("Create an account")}
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <AuthField id="email" name="email" type="email" label={t("Email")} icon={Mail} placeholder="name@example.dz" autoComplete="email" defaultValue={state.email} error={state.field === "email" ? state.error : undefined} />
        <AuthField id="password" name="password" type="password" label={t("Password")} icon={Lock} placeholder="••••••••" autoComplete="current-password" error={state.field === "password" ? state.error : undefined} />
        <button type="submit" disabled={pending} className={buttonClass("primary", "h-11 justify-center rounded-lg text-sm disabled:opacity-60")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("Sign in")}
          {!pending && <ArrowRight className="size-4 rtl:-scale-x-100" />}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[11px] font-medium uppercase text-muted">
        <span className="h-px flex-1 bg-slate-200" />
        {t("or")}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form
        action={demoSignInAction}
        onSubmit={() => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("moukawil_session_tour_shown");
            sessionStorage.setItem("moukawil_demo_login", "true");
          }
        }}
        className="flex flex-col gap-2"
      >
        <button type="submit" className={buttonClass("outline", "h-11 justify-center gap-2 rounded-lg text-sm border-slate-300 font-semibold hover:bg-surface-low")}>
          <Sparkles className="size-4 text-accent shrink-0" />
          {t("Continue with the demo account")}
        </button>
        <p className="text-center text-[11px] text-muted">{t("Demo environment: no real account is created or stored.")}</p>
      </form>
    </AuthShell>
  );
}
