/**
 * Admin · Nhật ký hệ thống — Figma page EduBranch AI – Screens, frame 10.9 (536:7923).
 *
 * Real data only: the backend writes no activity log that an API exposes (no
 * `@Roles("ADMIN")` controller), so the KPI cards and the log table are not rendered.
 * The list area shows the shared empty state until `GET /admin/logs` exists.
 */
import { useTranslation } from "react-i18next";
import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/feedback";

export function AdminLogsPage() {
  const { t } = useTranslation();
  return (
    <EmptyState icon={ScrollText} title={t("g6.logs.emptyTitle")} description={t("g6.logs.emptyDescription")} />
  );
}
