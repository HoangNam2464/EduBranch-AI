/**
 * EduBranch AI — i18n setup.
 *
 * Vietnamese is the default UI language. English is available and the user's
 * choice is remembered in localStorage. The browser language is ignored on
 * purpose so a first visit always opens in Vietnamese.
 *
 * Strings are added to locales/vi.json and locales/en.json with the same keys;
 * screens move their text into these files when they are reworked.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import viBase from "@/locales/vi.json";
import enBase from "@/locales/en.json";

/**
 * Feature locale files (`locales/<feature>.vi.json` / `<feature>.en.json`, e.g.
 * `states.vi.json`) each hold one top-level key and are merged on top of the base files.
 */
type LocaleTree = Record<string, unknown>;
function mergeFeatureLocales(base: LocaleTree, files: Record<string, unknown>): LocaleTree {
  const merged: LocaleTree = { ...base };
  for (const mod of Object.values(files)) Object.assign(merged, (mod as { default: LocaleTree }).default);
  return merged;
}
const vi = mergeFeatureLocales(viBase, import.meta.glob("../locales/*.vi.json", { eager: true }));
const en = mergeFeatureLocales(enBase, import.meta.glob("../locales/*.en.json", { eager: true }));

export const SUPPORTED_LANGUAGES = ["vi", "en"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: AppLanguage = "vi";
export const LANGUAGE_STORAGE_KEY = "edubranch-lang";

export const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
  });

export default i18n;
