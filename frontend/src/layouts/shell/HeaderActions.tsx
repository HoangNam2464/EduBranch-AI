import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, Search, SlidersHorizontal } from "lucide-react";
import { LanguageSwitcher } from "@/components/ds";
import { HEADER_FOCUS, HEADER_ICON_BUTTON } from "@/layouts/shell/headerButtonStyles";

/*
 * Figma: `EB/Header Actions` (762×40, gap 12) — shared by the three roles.
 * Search 320×40 · Language VI|EN 78×40 · Notifications · Settings (40×40)
 * · divider · account (avatar 40 + name/role).
 */

const FOCUS = HEADER_FOCUS;
const ICON_BUTTON = HEADER_ICON_BUTTON;

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

/** Below this width the search is a 40×40 button that opens the field, so the page title keeps its room. */
const INLINE_SEARCH_QUERY = "(min-width: 1280px)";

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
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const searchId = useId();
  // Only used below 1280 px, where the search field opens as a panel under its button.
  const [searchOpen, setSearchOpen] = useState(false);
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
        if (window.matchMedia(INLINE_SEARCH_QUERY).matches) {
          inputRef.current?.focus();
          inputRef.current?.select();
        } else {
          setSearchOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Opened panel: focus the field; a click outside the header actions closes it.
  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    inputRef.current?.select();
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    toggleRef.current?.focus();
  }

  // Search runs on the current screen: the keyword is written to ?q= and screens filter by it.
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    const keyword = query.trim();
    if (keyword) params.set("q", keyword);
    else params.delete("q");
    const qs = params.toString();
    navigate({ pathname: location.pathname, search: qs ? `?${qs}` : "" });
    setSearchOpen(false);
  }

  return (
    // Rule F3: from 1280 px the search is based on 160 px and only grows into free space (up to 224, or
    // 320 at ≥1440), so the header's minimum width never forces the page title to give way first.
    // Below 1280 px it is a 40×40 button opening the same field as a panel under the header actions.
    <div ref={rootRef} className="relative flex h-10 min-w-0 items-center justify-end gap-3">
      <button
        ref={toggleRef}
        type="button"
        className={`${ICON_BUTTON} xl:hidden`}
        aria-label={t("shell.searchLabel")}
        title={t("shell.searchLabel")}
        aria-expanded={searchOpen}
        aria-controls={searchId}
        onClick={() => setSearchOpen((open) => !open)}
      >
        <Search size={18} strokeWidth={2.13} aria-hidden="true" />
      </button>
      <form
        id={searchId}
        role="search"
        onSubmit={onSubmit}
        onKeyDown={(event) => {
          if (event.key === "Escape" && searchOpen) {
            event.preventDefault();
            closeSearch();
          }
        }}
        className={`h-10 max-w-56 min-[1440px]:max-w-80 xl:static xl:mt-0 xl:block xl:w-40 xl:grow xl:shadow-none ${
          searchOpen ? "absolute top-full right-0 z-30 mt-3 w-80 max-xl:max-w-none rounded-[10px] shadow-eb-dialog" : "hidden"
        }`}
      >
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

      <LanguageSwitcher className="shrink-0" />

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

      <Link to={profilePath} className={`flex h-10 shrink-0 items-center gap-2.5 rounded-[10px] ${FOCUS}`} aria-label={t("shell.account")}>
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
