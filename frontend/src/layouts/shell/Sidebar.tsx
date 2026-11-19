import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";
import { SHELL_ICONS } from "@/layouts/shell/icons";
import type { ShellNav, ShellNavItem } from "@/layouts/shell/shellRoutes";

/*
 * Figma: component `Navigation/Sidebar` (Role × Collapsed) + `Navigation/Nav Item`
 * (Default #FFFFFF/#696A70 Regular · Hover #F3F6FC/#202124 · Active #2A4E7F/#FFFFFF Medium).
 * Expanded 224px, collapsed 72px. Lucide strokeWidth is in 24-unit space:
 * a 16px icon drawn at 1.33px in Figma = strokeWidth 2.
 */

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

interface SidebarProps {
  nav: ShellNav;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  homePath: string;
  userName: string;
  userEmail: string;
  initials: string;
  onSignOut: () => void;
}

function NavItem({ item, collapsed }: { item: ShellNavItem; collapsed: boolean }) {
  const { t } = useTranslation();
  const Icon = SHELL_ICONS[item.icon];
  const label = t(item.labelKey);
  const shape = `flex h-11 items-center rounded-r-eb-md ${collapsed ? "w-12 pl-4" : "w-[204px] gap-[14px] px-4"}`;
  const tone = item.active
    ? "bg-primary text-ink-inverse font-medium"
    : "bg-surface text-ink-secondary font-normal hover:bg-canvas hover:text-ink";
  const content = (
    <>
      <Icon size={16} strokeWidth={item.active ? 2.5 : 2} aria-hidden="true" className="shrink-0" />
      {!collapsed && <span className="truncate text-sm leading-5">{label}</span>}
    </>
  );

  if (!item.to) {
    const hint = item.disabledHintKey ? t(item.disabledHintKey) : undefined;
    return (
      <span
        role="link"
        aria-disabled="true"
        aria-label={collapsed ? label : undefined}
        title={hint ?? (collapsed ? label : undefined)}
        className={`${shape} cursor-not-allowed bg-surface font-normal text-ink-muted`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      to={item.to}
      aria-current={item.active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      className={`${shape} ${tone} transition-colors ${FOCUS}`}
    >
      {content}
    </Link>
  );
}

export function Sidebar({
  nav,
  collapsed,
  onToggleCollapsed,
  homePath,
  userName,
  userEmail,
  initials,
  onSignOut,
}: SidebarProps) {
  const { t } = useTranslation();

  const handleBrandClick = (e: React.MouseEvent) => {
    if (window.location.pathname === homePath) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <aside
      aria-label={t("shell.sidebar")}
      className={`sticky top-0 flex h-screen max-h-screen shrink-0 flex-col overflow-hidden bg-surface transition-[width] duration-200 motion-reduce:transition-none ${
        collapsed ? "w-[72px]" : "w-56"
      }`}
    >
      {/* Brand area */}
      {collapsed ? (
        <div className="flex h-20 shrink-0 flex-col items-center pt-7 pb-6">
          <Link
            to={homePath}
            onClick={handleBrandClick}
            aria-label={t("common.appName")}
            title={`${t("common.appName")} — ${t("common.backHome")}`}
            className={`rounded-eb-md transition-opacity hover:opacity-85 ${FOCUS}`}
          >
            <LogoMark />
          </Link>
        </div>
      ) : (
        <div className="flex h-[102px] shrink-0 flex-col gap-1.5 pt-7 pr-5 pb-6 pl-8">
          <Link
            to={homePath}
            onClick={handleBrandClick}
            title={`${t("common.appName")} — ${t("common.backHome")}`}
            className={`flex h-7 items-center gap-2.5 rounded-eb-md transition-opacity hover:opacity-85 ${FOCUS}`}
          >
            <LogoMark />
            <span className="text-xl leading-7 font-normal text-ink">{t("common.appName")}</span>
          </Link>
          {/* Figma: text-case UPPER, letter-spacing 4% */}
          <span className="text-[11px] leading-4 font-medium tracking-[0.04em] text-ink-muted uppercase">
            {t(nav.workspaceKey)}
          </span>
        </div>
      )}

      {/* Navigation — scrollable area when viewport height is constrained (e.g. 8 items in Admin on 768p/scaled screens) */}
      <nav
        aria-label={t("shell.mainNav")}
        className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line ${
          collapsed ? "px-3" : "pr-5"
        }`}
      >
        <ul className="flex flex-col gap-2.5 py-1">
          {nav.items.map((item) => (
            <li key={item.id}>
              <NavItem item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Account — pinned footer that never overflows or gets clipped offscreen */}
      {collapsed ? (
        <div className="mt-auto flex shrink-0 flex-col items-center gap-2 border-t border-line-soft pt-3 pb-5">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={t("shell.expand")}
            aria-expanded="false"
            title={t("shell.expand")}
            className={`flex h-9 w-12 items-center justify-center rounded-eb-md text-ink-secondary hover:bg-canvas ${FOCUS}`}
          >
            <ChevronRight size={16} strokeWidth={1.71} aria-hidden="true" />
          </button>
          <div className="flex h-9 w-12 items-center justify-center" title={`${userName} · ${userEmail}`}>
            <span className="flex size-9 items-center justify-center rounded-eb-md bg-selected text-sm leading-5 font-medium text-link">
              {initials}
            </span>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label={t("common.logout")}
            title={t("common.logout")}
            className={`flex h-9 w-12 items-center justify-center rounded-eb-md text-ink-secondary hover:bg-canvas ${FOCUS}`}
          >
            <LogOut size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-auto flex shrink-0 flex-col gap-3 border-t border-line-soft px-5 pt-3.5 pb-5">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded="true"
            className={`flex h-9 w-full items-center gap-[14px] rounded-eb-md text-left text-xs leading-4 font-normal text-ink-secondary hover:bg-canvas ${FOCUS}`}
          >
            <ChevronLeft size={16} strokeWidth={1.71} aria-hidden="true" className="shrink-0" />
            {t("shell.collapse")}
          </button>
          <div className="flex h-10 items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-eb-md bg-selected text-sm leading-5 font-medium text-link">
              {initials}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm leading-5 font-medium text-ink">{userName}</span>
              <span className="truncate text-xs leading-4 font-normal text-ink-secondary">{userEmail}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className={`flex h-9 w-fit items-center gap-[14px] rounded-eb-md pr-0 pl-2 text-sm leading-5 font-normal text-ink-secondary hover:bg-canvas ${FOCUS}`}
          >
            <LogOut size={16} strokeWidth={2} aria-hidden="true" />
            {t("common.logout")}
          </button>
        </div>
      )}
    </aside>
  );
}
