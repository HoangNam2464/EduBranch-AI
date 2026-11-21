import { useTranslation } from "react-i18next";
import { CircleAlert, LayoutDashboard, RotateCcw } from "lucide-react";
import { StatusPage } from "@/components/feedback/StatusPage";
import type { StateActionTarget } from "@/components/feedback/StateButton";
import { formatDateTime, isValidDate } from "@/components/feedback/stateFormat";

/**
 * 01.7 — 500. Icon/circle-alert 32 (stroke 1.5, #D11F1F) on a #FFE5E5 tile.
 * Meta line "Mã sự cố: <id> · dd/MM/yyyy HH:mm"; Secondary MD "Về trang chính"
 * (Icon/layout-dashboard, stroke 1.5, #2A4E7F) and Primary MD "Tải lại trang"
 * (Icon/rotate-ccw, stroke 1.7, white). Figma has no help line on this frame.
 */
export interface ServerErrorStatusPageProps {
  /** "Về trang chính". */
  home: StateActionTarget;
  /** "Tải lại trang". */
  reload: StateActionTarget;
  /** Incident / request id from the server (meta line hidden when absent). */
  incidentId?: string;
  occurredAt?: Date;
}

export function ServerErrorStatusPage({ home, reload, incidentId, occurredAt }: ServerErrorStatusPageProps) {
  const { t } = useTranslation();
  const meta = incidentId
    ? isValidDate(occurredAt)
      ? t("states.serverError.incident", { id: incidentId, time: formatDateTime(occurredAt) })
      : t("states.serverError.incidentNoTime", { id: incidentId })
    : undefined;

  return (
    <StatusPage
      tone="error"
      icon={CircleAlert}
      iconStrokeWidth={1.5}
      code={t("states.serverError.code")}
      title={t("states.serverError.title")}
      description={t("states.serverError.description")}
      meta={meta}
      secondaryAction={{
        ...home,
        label: t("states.serverError.home"),
        icon: LayoutDashboard,
        iconStrokeWidth: 1.5,
        iconClassName: "text-primary",
      }}
      primaryAction={{ ...reload, label: t("states.serverError.reload"), icon: RotateCcw, iconStrokeWidth: 1.7 }}
    />
  );
}
