import type { Lang } from "./config";
import { fr } from "./dictionaries/fr";
import { ar } from "./dictionaries/ar";

export type Params = Record<string, string | number>;

// English text is the key. Anything missing from a dictionary falls back to the English text.
const dictionaries: Record<Lang, Record<string, string>> = { en: {}, fr, ar };

export function translate(lang: Lang, key: string, params?: Params): string {
  const text = dictionaries[lang][key] ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
