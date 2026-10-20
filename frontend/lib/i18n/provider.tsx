"use client";

import { createContext, Fragment, useCallback, useContext, useMemo, useState } from "react";
import { createFormatters } from "@/lib/format";
import { LANG_COOKIE, LANG_META, type Lang } from "./config";
import { translate, type Params } from "./translate";

interface I18nValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Params) => string;
  /** Like t(), but placeholders are filled with React nodes (for text containing <strong>, links, etc.). */
  tx: (key: string, nodes: Record<string, React.ReactNode>) => React.ReactNode;
  formatAmount: (value: number) => string;
  formatWhole: (value: number) => string;
  formatDate: (iso: string) => string;
  formatLongDate: (iso: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = LANG_META[next].dir;
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: LANG_META[lang].dir,
      setLang,
      t: (key, params) => translate(lang, key, params),
      tx: (key, nodes) =>
        translate(lang, key)
          .split(/(\{\w+\})/)
          .map((part, i) => {
            const name = /^\{(\w+)\}$/.exec(part)?.[1];
            return <Fragment key={i}>{name && name in nodes ? nodes[name] : part}</Fragment>;
          }),
      ...createFormatters(LANG_META[lang].locale),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
