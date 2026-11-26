import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ROLE_HOME } from "@/routes/paths";
import { SessionExpiredDialog } from "@/components/feedback";
import type { Role } from "@/types";
import { Sidebar } from "@/layouts/shell/Sidebar";
import { HeaderActions } from "@/layouts/shell/HeaderActions";
import { AppFooter } from "@/layouts/shell/AppFooter";
import { useSidebarCollapsed } from "@/layouts/shell/useSidebarCollapsed";
import { ShellTitleProvider, useShellHeaderExtras, useShellTitleOverride } from "@/layouts/shell/ShellTitleContext";
import { HEADER_BACK_BUTTON, HEADER_FOCUS } from "@/layouts/shell/headerButtonStyles";
import {
  ROLE_SEARCH_PLACEHOLDER,
  ROLE_SHELL_LINKS,
  initialsOf,
  resolveShellNav,
  resolveTitleKey,
} from "@/layouts/shell/shellRoutes";

/*
 * Shared app shell for Lecturer / Student / Admin (Figma page EduBranch AI – Screens, FE-025):
 * white page · Navigation/Sidebar (224 / 72) · "Main Content" panel
 * (bg/canvas #F3F6FC, radius 18, padding-top 8) holding Header (h 84),
 * the screen and EB/App Footer.
 */

const ROLE_LABEL_KEY: Record<Role, string> = {
  LECTURER: "shell.roles.lecturer",
  STUDENT: "shell.roles.student",
  ADMIN: "shell.roles.admin",
};

function ShellFrame({ role }: { role: Role }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, sessionExpired } = useAuthStore();
  const { collapsed, toggle } = useSidebarCollapsed();
  const titleOverride = useShellTitleOverride();
  const headerExtras = useShellHeaderExtras();

  const nav = resolveShellNav(role, location);
  const titleKey = resolveTitleKey(location);
  const title = titleOverride ?? (titleKey ? t(titleKey) : "");
  const links = ROLE_SHELL_LINKS[role];
  const userName = user?.fullName ?? "";
  const initials = initialsOf(userName);

  function signOut() {
    logout();
    navigate(links.signedOut, { replace: true });
  }

  // Figma 01.6: after a 401 the dialog covers the current screen; signing in
  // again returns the user to where they were.
  function signInAgain() {
    logout();
    navigate(links.signedOut, { replace: true, state: { from: location } });
  }

  return (
    <div className="flex min-h-screen bg-page">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-eb-md bg-primary px-4 py-2 text-sm text-ink-inverse focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t("shell.skipToContent")}
      </a>

      <Sidebar
        nav={nav}
        collapsed={collapsed}
        onToggleCollapsed={toggle}
        homePath={ROLE_HOME[role]}
        userName={userName}
        userEmail={user?.email ?? ""}
        initials={initials}
        onSignOut={signOut}
      />

      <div className="flex min-h-[calc(100vh-24px)] min-w-0 flex-1 flex-col my-2 mr-2 sm:my-3 sm:mr-3 rounded-[18px] bg-canvas pt-2">
        {/* Fluid content (PO decision 2026-11-21, spec 006): app screens use the full width next to the
            sidebar with fixed side gutters; only the public landing and auth pages stay capped at max-w-7xl. */}
        <div className="flex w-full min-w-0 flex-1 flex-col px-3 sm:px-6 lg:px-8">
          {/* Title column takes its full width first; the actions column gets the rest and only its search
              shrinks (Rule F3; below 1280 px it collapses to a button); a title that still does not fit wraps. */}
          <header className="grid h-[84px] shrink-0 grid-cols-[minmax(0,max-content)_minmax(min-content,1fr)] items-center gap-6 px-2 sm:px-4">
            <div className="flex min-w-0 items-center gap-4">
              {/* Figma 10.8 "Back" (40×40, chevron-left 20) — only when a screen declares it. */}
              {headerExtras?.back && (
                <Link
                  to={headerExtras.back.to}
                  aria-label={headerExtras.back.label}
                  title={headerExtras.back.label}
                  className={HEADER_BACK_BUTTON}
                >
                  <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
                </Link>
              )}
              <div className="flex min-w-0 flex-col gap-0.5">
                {/* R01: a page title may wrap but is not cut; a long title takes a second line at 1024–1280. */}
                <h1 title={title} className="min-w-0 line-clamp-2 break-words text-[22px] leading-7 font-normal tracking-normal text-ink">{title}</h1>
                {/* Figma 10.8 "Breadcrumb" (12/16, chevron-right 10) under the page heading. */}
                {headerExtras?.crumbs && headerExtras.crumbs.length > 0 && (
                  <nav aria-label={t("shell.breadcrumb")} className="w-max">
                    <ol className="flex items-center gap-2 text-[12px] leading-4">
                      {headerExtras.crumbs.map((crumb, index) => {
                        const last = index === headerExtras.crumbs!.length - 1;
                        return (
                          <li key={`${index}-${crumb.label}`} className="flex shrink-0 items-center gap-2">
                            {index > 0 && <ChevronRight size={10} strokeWidth={2} aria-hidden="true" className="shrink-0 text-ink-muted" />}
                            {crumb.to && !last ? (
                              <Link
                                to={crumb.to}
                                className={`whitespace-nowrap rounded-eb-sm text-ink-muted hover:text-ink hover:underline ${HEADER_FOCUS}`}
                              >
                                {crumb.label}
                              </Link>
                            ) : (
                              <span aria-current={last ? "page" : undefined} className="whitespace-nowrap font-medium text-primary">
                                {crumb.label}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </nav>
                )}
              </div>
            </div>
            <HeaderActions
              searchPlaceholder={t(ROLE_SEARCH_PLACEHOLDER[role])}
              userName={userName}
              roleLabel={t(ROLE_LABEL_KEY[role])}
              initials={initials}
              profilePath={links.profile}
              settingsPath={links.settings}
            />
          </header>

          <main id="main-content" tabIndex={-1} className="flex min-w-0 flex-1 flex-col px-2 sm:px-4 focus:outline-none">
            <Outlet />
          </main>

          <AppFooter />
        </div>
      </div>

      <SessionExpiredDialog open={sessionExpired} signIn={{ onClick: signInAgain }} />
    </div>
  );
}

export function AppShell({ role }: { role: Role }) {
  return (
    <ShellTitleProvider>
      <ShellFrame role={role} />
    </ShellTitleProvider>
  );
}
