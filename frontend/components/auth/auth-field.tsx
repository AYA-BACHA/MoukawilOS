"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface AuthFieldProps {
  id: string;
  name: string;
  label: string;
  icon: LucideIcon;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  optional?: boolean;
}

export function AuthField({ id, name, label, icon: Icon, type = "text", placeholder, autoComplete, defaultValue, error, optional }: AuthFieldProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center justify-between text-xs font-semibold text-ink">
        {label}
        {optional && <span className="font-medium text-muted">{t("Optional")}</span>}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          id={id}
          name={name}
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          dir={type === "email" || isPassword ? "ltr" : undefined}
          className="h-11 w-full rounded-lg border border-slate-300 bg-card ps-10 pe-10 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/15 text-start"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? t("Hide password") : t("Show password")}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition-colors hover:text-ink"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] font-medium text-danger">{t(error)}</p>}
    </div>
  );
}
