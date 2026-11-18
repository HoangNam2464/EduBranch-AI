/**
 * Local-only developer conveniences that are not part of the Figma design.
 *
 * The login page's quick-access block shows only when all of these hold:
 * - the app runs on the Vite dev server (never in a production build),
 * - `VITE_ENABLE_DEV_LOGIN=true` is set in `frontend/.env` or `.env.local`,
 * - localStorage `edubranch-hide-dev-tools` is not "1" (the UI audit sets it so
 *   screenshots match Figma exactly).
 */
export const HIDE_DEV_TOOLS_STORAGE_KEY = "edubranch-hide-dev-tools";

export function isDevQuickAccessEnabled(): boolean {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_LOGIN !== "true") return false;
  try {
    return localStorage.getItem(HIDE_DEV_TOOLS_STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}
