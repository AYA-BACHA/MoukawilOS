"use client";

import { useState } from "react";
import { Building2, Check, UserRound, X } from "lucide-react";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { Client, ClientInput, ClientType } from "@/types/models";
import { useI18n } from "@/lib/i18n/provider";
import { ActionFeedbackBanner, MoukawilSpinner, ShimmerProgressBar } from "@/components/ui/action-loading";

const blank: ClientInput = { name: "", type: "B2B", nif: null, nis: null, rc: null, email: null, phone: null, address: null };

interface ClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSubmit: (input: ClientInput) => Promise<{ success: boolean; error?: string } | void> | void;
}

export function ClientModal({ client, onClose, onSubmit }: ClientModalProps) {
  const { t } = useI18n();
  const [input, setInput] = useState<ClientInput>(client ?? blank);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const business = input.type === "B2B";

  const text = (key: keyof ClientInput) => ({
    className: inputClass,
    value: input[key] ?? "",
    disabled: status === "loading",
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setInput((current) => ({ ...current, [key]: event.target.value || null })),
  });

  const valid = input.name.trim().length > 0 && (!business || (input.nif ?? "").length === 15);

  const handleSubmit = async () => {
    if (!valid || status === "loading" || status === "success") return;
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await onSubmit(input);
      if (res && !res.success) {
        setStatus("error");
        setErrorMessage(res.error || t("Erreur lors de l'enregistrement de la fiche."));
        return;
      }
      setStatus("success");
      setTimeout(() => {
        onClose();
      }, 450);
    } catch (err: unknown) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : t("Erreur réseau lors de l'enregistrement.");
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in" onClick={status === "loading" ? undefined : onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
      >
        <ShimmerProgressBar active={status === "loading"} />

        <div className="flex items-center justify-between bg-surface-low px-4 py-3 border-b border-slate-100">
          <h2 id="client-modal-title" className="text-base sm:text-lg font-semibold leading-7 tracking-[-0.025em] text-ink truncate">
            {client ? t("Edit Client Record") : t("Add New Client")}
          </h2>
          <button
            type="button"
            aria-label={t("Close")}
            disabled={status === "loading"}
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-lg text-body hover:bg-slate-100 active:scale-95 disabled:opacity-40"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 overflow-y-auto">
          <ActionFeedbackBanner
            status={status}
            loadingText={client ? t("Enregistrement de la fiche client...") : t("Création du client...")}
            successText={client ? t("Fiche client enregistrée avec succès") : t("Nouveau client créé avec succès")}
            errorText={errorMessage}
          />

          <div className="flex rounded bg-surface-low p-1">
            {([["B2B", "Corporate B2B", Building2], ["B2C", "Individual B2C", UserRound]] as const).map(([type, label, Icon]) => (
              <button
                key={type}
                type="button"
                disabled={status === "loading"}
                onClick={() => setInput((current) => ({ ...current, type: type as ClientType }))}
                className={cn("flex flex-1 min-h-[40px] items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold", input.type === type ? "bg-card text-primary-ink shadow-xs" : "text-body", status === "loading" && "opacity-60")}
              >
                <Icon className="size-3.5" />
                {t(label)}
              </button>
            ))}
          </div>
          <Field label={business ? t("Company name") : t("Full name")}>
            <input {...text("name")} className={cn(inputClass, "text-base sm:text-xs")} />
          </Field>
          {business && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Field label={t("NIF")} hint={`${(input.nif ?? "").length}/15`}>
                <input {...text("nif")} maxLength={15} inputMode="numeric" className={cn(inputClass, "font-num text-base sm:text-xs")} />
              </Field>
              <Field label={t("RC")}>
                <input {...text("rc")} className={cn(inputClass, "font-num text-base sm:text-xs")} />
              </Field>
              <Field label={t("NIS")}>
                <input {...text("nis")} className={cn(inputClass, "font-num text-base sm:text-xs")} />
              </Field>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Field label={t("Email")}>
              <input {...text("email")} type="email" inputMode="email" className={cn(inputClass, "text-base sm:text-xs")} />
            </Field>
            <Field label={t("Phone")}>
              <input {...text("phone")} type="tel" inputMode="tel" className={cn(inputClass, "font-num text-base sm:text-xs")} />
            </Field>
          </div>
          <Field label={t("Address")}>
            <input {...text("address")} className={cn(inputClass, "text-base sm:text-xs")} />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2.5 bg-surface-low/80 p-4 border-t border-slate-100">
          <button
            type="button"
            disabled={status === "loading"}
            onClick={onClose}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-card px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            disabled={!valid || status === "loading" || status === "success"}
            aria-busy={status === "loading"}
            onClick={handleSubmit}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-ink disabled:opacity-40 active:scale-95 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <MoukawilSpinner size="sm" className="text-white" />
                <span>{client ? t("Enregistrement...") : t("Création...")}</span>
              </>
            ) : status === "success" ? (
              <>
                <Check className="size-4" />
                <span>{t("Enregistré !")}</span>
              </>
            ) : (
              <span>{client ? t("Save Record") : t("Add Client")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
