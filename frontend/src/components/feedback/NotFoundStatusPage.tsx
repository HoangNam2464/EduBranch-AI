import { useTranslation } from "react-i18next";
import { ChevronLeft, Compass, LayoutDashboard } from "lucide-react";
import { StatusPage } from "@/components/feedback/StatusPage";
import { SupportEmailLink, type StateActionTarget } from "@/components/feedback/StateButton";

/**
 * 01.5 — 404. Icon/compass 32 (stroke 1.36, #2A4E7F) on a #DFEDF9 tile.
 * Meta line "Đường dẫn: <path>"; Secondary MD "Quay lại trang trước"
 * (Icon/chevron-left, stroke 1.14, #2A4E7F) and Primary MD "Về trang chính"
 * (Icon/layout-dashboard, stroke 1.5, white); help line with the mailbox.
 */
export interface NotFoundStatusPageProps {
  /** "Quay lại trang trước". */
  back: StateActionTarget;
  /** "Về trang chính". */
  home: StateActionTarget;
  /** Requested path shown in the meta line (hidden when absent). */
  path?: string;
}

export function NotFoundStatusPage({ back, home, path }: NotFoundStatusPageProps) {
  const { t } = useTranslation();
  return (
    <StatusPage
      tone="info"
      icon={Compass}
      iconStrokeWidth={1.36}
      code={t("states.notFound.code")}
      title={t("states.notFound.title")}
      description={t("states.notFound.description")}
      meta={path ? t("states.notFound.path", { path }) : undefined}
      secondaryAction={{
        ...back,
        label: t("states.notFound.back"),
        icon: ChevronLeft,
        iconStrokeWidth: 1.14,
        iconClassName: "text-primary",
      }}
      primaryAction={{ ...home, label: t("states.notFound.home"), icon: LayoutDashboard, iconStrokeWidth: 1.5 }}
      help={
        <>
          {t("states.notFound.helpBefore")}
          <SupportEmailLink />
        </>
      }
    />
  );
}
