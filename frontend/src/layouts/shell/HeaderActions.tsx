import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, Search, SlidersHorizontal } from "lucide-react";
import { LanguageSwitcher } from "@/components/ds";

/*
 * Figma: `EB/Header Actions` (762×40, gap 12) — shared by the three roles.
 * Search 320×40 · Language VI|EN 78×40 · Notifications · Settings (40×40)
 * · divider · account (avatar 40 + name/role).
 */

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const ICON_BUTTON = `relative flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-subtle text-primary hover:bg-primary-subtle-hover ${FOCUS}`;

interface HeaderActionsProps {
  searchPlaceholder: string;
  userName: string;
  roleLabel: string;
  initials: string;
  profilePath: string;
  settingsPath: string;
  /** Unread notifications; the red dot only shows when > 0 (no fake badge). */
  unreadCount?: number;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function HeaderActions({
  searchPlaceholder,
  userName,
  roleLabel,
  initials,
  profilePath,
  settingsPath,
  unreadCount = 0,
}: HeaderActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const urlQuery = new URLSearchParams(location.search).get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);

  // Keep the box in sync when the URL query changes (e.g. "Xóa tìm kiếm" on a page).
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  // Ctrl K / ⌘K focuses the search box.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Search runs on the current screen: the keyword is written to ?q= and screens filter by it.
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    const keyword = query.trim();
    if (keyword) params.set("q", keyword);
    else params.delete("q");
    const qs = params.toString();
    navigate({ pathname: location.pathname, search: qs ? `?${qs}` : "" });
  }

  return (
    <div className="flex h-10 items-center gap-3">
      <form role="search" onSubmit={onSubmit} className="h-10 w-56 min-[1440px]:w-80">
        <label
          className={`flex h-10 w-full items-center gap-2.5 rounded-[10px] border border-line bg-surface-muted pr-2 pl-3.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus`}
        >
          <Search size={18} strokeWidth={2.13} className="shrink-0 text-ink-muted" aria-hidden="true" />
          <span className="sr-only">{t("shell.searchLabel")}</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-ink placeholder:text-ink-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="flex h-6 shrink-0 items-center rounded-eb-sm border border-line bg-surface px-2 font-sans text-xs leading-4 font-medium text-ink-secondary">
            {isMac ? "⌘ K" : "Ctrl K"}
          </kbd>
        </label>
      </form>

      <LanguageSwitcher />

      <button
        type="button"
        className={ICON_BUTTON}
        aria-label={unreadCount > 0 ? t("shell.notificationsUnread", { count: unreadCount }) : t("shell.notifications")}
        title={t("shell.notifications")}
      >
        <Bell size={18} strokeWidth={1.78} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-2 left-[25px] size-2 rounded-full bg-error ring-2 ring-white" aria-hidden="true" />
        )}
      </button>

      <Link to={settingsPath} className={ICON_BUTTON} aria-label={t("shell.settings")} title={t("shell.settings")}>
        <SlidersHorizontal size={18} strokeWidth={1.07} aria-hidden="true" />
      </Link>

      <span data-shell="divider" className="h-7 w-px shrink-0 bg-line" aria-hidden="true" />

      <Link to={profilePath} className={`flex h-10 items-center gap-2.5 rounded-[10px] ${FOCUS}`} aria-label={t("shell.account")}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm leading-5 font-medium text-ink-inverse">
          {initials}
        </span>
        <span className="hidden max-w-[160px] flex-col gap-0.5 xl:flex">
          <span className="truncate text-sm leading-5 font-medium text-ink">{userName}</span>
          <span className="truncate text-xs leading-4 font-normal text-ink-muted">{roleLabel}</span>
        </span>
      </Link>
    </div>
  );
}
