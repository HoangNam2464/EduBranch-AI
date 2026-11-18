import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/authStore";
import { ROLE_HOME } from "@/routes/paths";
import { SessionExpiredDialog } from "@/components/feedback";
import type { Role } from "@/types";
import { Sidebar } from "@/layouts/shell/Sidebar";
import { HeaderActions } from "@/layouts/shell/HeaderActions";
import { AppFooter } from "@/layouts/shell/AppFooter";
import { useSidebarCollapsed } from "@/layouts/shell/useSidebarCollapsed";
import { ShellTitleProvider, useShellTitleOverride } from "@/layouts/shell/ShellTitleContext";
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
        {/* Content is capped at max-w-7xl (1280px) and centred, per reference frontend UX & PO decision 5,
            so wide screens (1920, 2K) keep generous, comfortable side margins and do not stretch cards. */}
        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col px-3 sm:px-6 lg:px-8">
          <header className="flex h-[84px] shrink-0 items-center justify-between gap-6 px-2 sm:px-4">
            <h1 className="min-w-0 truncate text-[22px] leading-7 font-normal tracking-normal text-ink">{title}</h1>
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
