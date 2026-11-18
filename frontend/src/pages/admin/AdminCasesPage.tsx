/**
 * Admin · Case Study toàn hệ thống — Figma page 08, frame 10.6 (535:7980).
 *
 * Real data only: case lists exist only per course (`GET /courses/:courseId/cases`) and
 * ADMIN cannot enumerate courses, so the status split, the mode chart, the recent list and
 * the case library are not rendered with values. Layout kept from Figma: analytics row
 * (478 + 678, gap 20) and the "All courses" library card, each showing the empty state.
 */
import { useTranslation } from "react-i18next";
import { ChartBarBig, ChartPie, GitBranch } from "lucide-react";
import { AdminNoData, AdminPanel } from "@/pages/admin/components/AdminPanel";

export function AdminCasesPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-stretch gap-5">
        <AdminPanel className="w-[478px] shrink-0" title={t("g6.cases.byStatus")}>
          <AdminNoData icon={ChartPie} description={false} />
        </AdminPanel>
        <AdminPanel className="flex-1" title={t("g6.cases.byMode")}>
          <AdminNoData icon={ChartBarBig} description={false} />
        </AdminPanel>
      </div>
      <AdminPanel title={t("g6.cases.library")}>
        <AdminNoData
          className="py-16"
          icon={GitBranch}
          title={t("g6.cases.emptyTitle")}
          description={t("g6.cases.emptyDescription")}
        />
      </AdminPanel>
    </div>
  );
}
