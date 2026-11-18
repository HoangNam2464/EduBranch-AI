import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

/**
 * App-wide providers in one place (i18n today; data-fetching or theme
 * providers are added here so main.tsx stays a thin entry point).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
