/**
 * Admin · Khóa học toàn hệ thống — Figma page 08, frame 10.5 (535:7402).
 *
 * Real data only: `GET /courses` is LECTURER-only and returns the caller's own courses;
 * there is no system-wide course endpoint for ADMIN. The course cards, the search /
 * status filter, the pagination and the "Chi tiết khóa học" panel are therefore not
 * rendered. The "Filters" header card (white, radius 18, padding 20, title 16/24)
 * stays, followed by the shared empty state.
 */
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/feedback";

export function AdminCoursesPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex h-[72px] items-center rounded-eb-xl bg-surface p-5">
        <h2 className="text-[16px] leading-6 font-normal tracking-normal text-ink">{t("g6.courses.title")}</h2>
      </div>
      <EmptyState icon={BookOpen} title={t("g6.courses.emptyTitle")} description={t("g6.courses.emptyDescription")} />
    </div>
  );
}
