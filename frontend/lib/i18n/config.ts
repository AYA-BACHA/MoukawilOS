export const LANGS = ["en", "fr", "ar"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "moukawil_lang";

export const LANG_META: Record<Lang, { label: string; short: string; dir: "ltr" | "rtl"; locale: string }> = {
  en: { label: "English", short: "EN", dir: "ltr", locale: "en-US" },
  fr: { label: "Français", short: "FR", dir: "ltr", locale: "fr-FR" },
  // Latin digits (nu-latn) are the everyday convention in Algeria.
  ar: { label: "العربية", short: "AR", dir: "rtl", locale: "ar-DZ-u-nu-latn" },
};

export const isLang = (value: unknown): value is Lang => typeof value === "string" && (LANGS as readonly string[]).includes(value);
