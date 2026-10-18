"use client";

import { useState } from "react";
import { Building2, UserRound, X } from "lucide-react";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { Client, ClientInput, ClientType } from "@/types/models";

const blank: ClientInput = { name: "", type: "B2B", nif: null, nis: null, rc: null, email: null, phone: null, address: null };

interface ClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSubmit: (input: ClientInput) => void;
}

export function ClientModal({ client, onClose, onSubmit }: ClientModalProps) {
  const [input, setInput] = useState<ClientInput>(client ?? blank);
  const business = input.type === "B2B";

  const text = (key: keyof ClientInput) => ({
    className: inputClass,
    value: input[key] ?? "",
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setInput((current) => ({ ...current, [key]: event.target.value || null })),
  });

  const valid = input.name.trim().length > 0 && (!business || (input.nif ?? "").length === 15);

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-ink/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="client-modal-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between bg-surface-low p-4">
          <h2 id="client-modal-title" className="text-xl font-semibold leading-7 tracking-[-0.025em] text-ink">
            {client ? "Edit Client Record" : "Add New Client"}
          </h2>
          <button aria-label="Close" onClick={onClose} className="rounded p-1 text-body">
            <X className="size-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex rounded bg-surface-low p-1">
            {([["B2B", "Corporate B2B", Building2], ["B2C", "Individual B2C", UserRound]] as const).map(([type, label, Icon]) => (
              <button
                key={type}
                onClick={() => setInput((current) => ({ ...current, type: type as ClientType }))}
                className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm", input.type === type ? "bg-white font-semibold text-primary-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : "font-medium text-body")}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
          <Field label={business ? "Company name" : "Full name"}>
            <input {...text("name")} />
          </Field>
          {business && (
            <div className="grid grid-cols-3 gap-3">
              <Field label="NIF" hint={`${(input.nif ?? "").length}/15`}>
                <input {...text("nif")} maxLength={15} inputMode="numeric" className={cn(inputClass, "font-num")} />
              </Field>
              <Field label="RC">
                <input {...text("rc")} className={cn(inputClass, "font-num")} />
              </Field>
              <Field label="NIS">
                <input {...text("nis")} className={cn(inputClass, "font-num")} />
              </Field>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input {...text("email")} type="email" />
            </Field>
            <Field label="Phone">
              <input {...text("phone")} type="tel" className={cn(inputClass, "font-num")} />
            </Field>
          </div>
          <Field label="Address">
            <input {...text("address")} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 bg-surface-low p-4">
          <button onClick={onClose} className="rounded bg-white px-3 py-2 text-sm font-medium text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            Cancel
          </button>
          <button disabled={!valid} onClick={() => onSubmit(input)} className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {client ? "Save Record" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
