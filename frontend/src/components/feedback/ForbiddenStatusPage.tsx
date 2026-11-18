import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Lock, LogOut } from "lucide-react";
import { StatusPage } from "@/components/feedback/StatusPage";
import { SupportEmailLink, type StateActionTarget } from "@/components/feedback/StateButton";

/**
 * 01.4 — 403. Icon/lock 32 (stroke 1.7, #B86800) on a #FFF1DE tile.
 * Secondary MD "Đăng nhập tài khoản khác" (Icon/log-out, stroke 1.33, #202124)
 * and Primary MD "Về trang của tôi" (Icon/layout-dashboard, stroke 1.5, white).
 */
export interface ForbiddenStatusPageProps {
  /** "Đăng nhập tài khoản khác": sign out and go to sign-in. */
  switchAccount: StateActionTarget;
  /** "Về trang của tôi": the user's own portal home. */
  home: StateActionTarget;
  /** Names used by the role sentence; when all three are given the Figma text is shown. */
  pageName?: string;
  allowedRole?: string;
  currentRole?: string;
  /** Full override of the description. */
  description?: ReactNode;
}

export function ForbiddenStatusPage({
  switchAccount,
  home,
  pageName,
  allowedRole,
  currentRole,
  description,
}: ForbiddenStatusPageProps) {
  const { t } = useTranslation();
  const roleSentence =
    pageName && allowedRole && currentRole
      ? t("states.forbidden.descriptionWithRole", { page: pageName, allowedRole, currentRole })
      : t("states.forbidden.description");

  return (
    <StatusPage
      tone="warning"
      icon={Lock}
      iconStrokeWidth={1.7}
      code={t("states.forbidden.code")}
      title={t("states.forbidden.title")}
      description={description ?? roleSentence}
      secondaryAction={{ ...switchAccount, label: t("states.forbidden.switchAccount"), icon: LogOut, iconStrokeWidth: 1.33 }}
      primaryAction={{ ...home, label: t("states.forbidden.home"), icon: LayoutDashboard, iconStrokeWidth: 1.5 }}
      help={
        <>
          {t("states.forbidden.helpBefore")}
          <SupportEmailLink />
          {t("states.forbidden.helpAfter")}
        </>
      }
    />
  );
}
