/**
 * Admin · Nghiên cứu & Rubric — Figma page EduBranch AI – Screens, frame 10.8 (536:8408).
 *
 * In MVP since OPD-011 → A (FEATURE-EVALUATION-AND-RESEARCH, FR-EVAL-01..05). Real data only:
 * the backend `evaluation` module has no endpoint yet, and the route carries no case, so
 * the case header, the 1–5 rubric form and the saved forms are not rendered.
 * Layout: rubric card (777) + saved forms card (379), gap 20; the case header row and the
 * header back button / breadcrumb need a case context and a shell header slot.
 */
import { useTranslation } from "react-i18next";
import { ClipboardList, FlaskConical } from "lucide-react";
import { AdminNoData, AdminPanel } from "@/pages/admin/components/AdminPanel";

export function AdminRubricPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 items-start gap-5">
      <AdminPanel className="w-[777px] shrink-0" title={t("g6.rubric.title")}>
        <p className="text-[14px] leading-5 text-ink-secondary">{t("g6.rubric.description")}</p>
        <AdminNoData
          className="py-16"
          icon={FlaskConical}
          title={t("g6.rubric.emptyTitle")}
          description={t("g6.rubric.emptyDescription")}
        />
      </AdminPanel>
      <AdminPanel className="min-w-0 flex-1" title={t("g6.rubric.saved")}>
        <AdminNoData className="py-6" icon={ClipboardList} description={false} />
      </AdminPanel>
    </div>
  );
}
