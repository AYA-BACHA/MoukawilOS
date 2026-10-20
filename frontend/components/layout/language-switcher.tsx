"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LANGS, LANG_META } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("Change language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg p-2 text-xs font-semibold text-body transition-colors hover:bg-surface hover:text-ink"
      >
        <Globe className="size-[18px]" />
        {LANG_META[lang].short}
      </button>

      {open && (
        <ul role="listbox" className="absolute end-0 z-50 mt-2 w-40 rounded-xl border border-slate-200 bg-card p-1.5 shadow-xl shadow-black/8">
          {LANGS.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === lang}
                lang={code}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium text-body transition-colors hover:bg-surface-low hover:text-ink"
              >
                {LANG_META[code].label}
                {code === lang && <Check className="size-3.5 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
