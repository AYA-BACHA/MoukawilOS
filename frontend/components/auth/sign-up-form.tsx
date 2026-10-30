"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Loader2, Lock, Mail, User } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { DemoLoginButton } from "@/components/auth/demo-login-button";
import { buttonClass } from "@/components/ui/button";
import { signUpAction, type AuthState } from "@/lib/auth-actions";
import { useI18n } from "@/lib/i18n/provider";

export function SignUpForm() {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUpAction, {});

  return (
    <AuthShell
      title={t("Create your workspace")}
      subtitle={t("Set up MoukawilOS in a minute and start tracking your ceiling.")}
      footer={
        <>
          {t("Already have an account?")}{" "}
          <Link href="/sign-in" className="font-semibold text-accent hover:underline">
            {t("Sign in")}
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <AuthField id="name" name="name" label={t("Full name")} icon={User} placeholder={t("As on your ANAE card")} autoComplete="name" defaultValue={state.name} error={state.field === "name" ? state.error : undefined} />
        <AuthField id="email" name="email" type="email" label={t("Email")} icon={Mail} placeholder="name@example.dz" autoComplete="email" defaultValue={state.email} error={state.field === "email" ? state.error : undefined} />
        <AuthField id="password" name="password" type="password" label={t("Password")} icon={Lock} placeholder={t("At least 8 characters")} autoComplete="new-password" error={state.field === "password" ? state.error : undefined} />
        <AuthField id="anae" name="anae" label={t("ANAE registration number")} icon={BadgeCheck} placeholder="AE-16-0492" optional />

        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 text-xs leading-5 text-body">
            <input type="checkbox" name="terms" className="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-[#154b46]" />
            <span>{t("I understand MoukawilOS provides compliance tooling, not legal or tax advice.")}</span>
          </label>
          {state.field === "terms" && state.error && <p className="text-[11px] font-medium text-danger">{t(state.error)}</p>}
        </div>

        <button type="submit" disabled={pending} className={buttonClass("primary", "h-11 justify-center rounded-lg text-sm disabled:opacity-60")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("Create account")}
          {!pending && <ArrowRight className="size-4 rtl:-scale-x-100" />}
        </button>
      </form>

      <DemoLoginButton variant="outline" />
    </AuthShell>
  );
}
