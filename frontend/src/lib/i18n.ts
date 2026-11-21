/**
 * EduBranch AI — i18n setup.
 *
 * Vietnamese is the default UI language. English is available and the user's
 * choice is remembered in localStorage. The browser language is ignored on
 * purpose so a first visit always opens in Vietnamese.
 *
 * Aligned to the reference template: all strings are maintained directly
 * in locales/vi.json and locales/en.json.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";

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
