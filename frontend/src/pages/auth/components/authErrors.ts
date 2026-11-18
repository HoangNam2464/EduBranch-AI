import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

/**
 * Maps a failed `authService` call to the message shown in the form's error Alert.
 * No Figma frame draws an auth error state, so the existing `Alert` (variant "error") is used.
 *  - no response (server unreachable / network) → g1.errors.network
 *  - 401 → wrong email or password (login) · 409 → email already registered (register)
 *  - 400 → invalid data · 429 → too many attempts · 502/503/504 → network · anything else → generic
 */
export function authErrorMessage(error: unknown, t: TFunction, flow: "login" | "register"): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (!error.response || status === 502 || status === 503 || status === 504) return t("g1.errors.network");
    if (status === 429) return t("g1.errors.tooManyAttempts");
    if (status === 401 && flow === "login") return t("g1.errors.invalidCredentials");
    if (status === 409 && flow === "register") return t("g1.errors.emailTaken");
    if (status === 400) return t("g1.errors.invalidData");
  }
  return t("g1.errors.generic");
}
