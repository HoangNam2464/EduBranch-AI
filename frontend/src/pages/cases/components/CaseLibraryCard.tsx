import { useTranslation } from "react-i18next";
import { Clock3 } from "lucide-react";
import { BadgeBase, Button, StatusPill, cx } from "@/components/ds";
import { InstructorLine } from "@/components/ds/courseParts";
import { PATHS, buildPath } from "@/routes/paths";
import type { Case } from "@/types";
import { MODE_UI, STATUS_PILL_TONE, formatDay, isEditable } from "@/pages/cases/caseUi";

/*
 * 03.1 "Course card" of the case library: 272 wide (4 per row, gap 16), #F3F6FC, radius 14,
 * padding 16, column gap 20.
 *  - Media 240x160 radius 8 (mode tone) with a 48px Lucide icon (padding 34/24/16/24),
 *    status pill (StatusPill md) at 6,6.
 *  - Information column gap 8: mode tag + node count (16/24 #2A4E7F) · title 16/24 · course line.
 *  - Footer: clock 12 (stroke 1.3) + "Cập nhật dd/mm/yyyy" 12/16 · Secondary SM "Chỉnh sửa" / "Xem".
 */
export interface CaseLibraryCardProps {
  item: Case;
  courseName: string;
  instructorInitials: string;
  /** Number of tree nodes (Branching Study); undefined while it is loading. */
  nodeCount?: number;
}

export function CaseLibraryCard({ item, courseName, instructorInitials, nodeCount }: CaseLibraryCardProps) {
  const { t } = useTranslation();
  const mode = MODE_UI[item.learningMode];
  const Icon = mode.icon;
  const editable = isEditable(item.status);
  const structure =
    item.learningMode === "REVIEW_STUDY"
      ? t("g3.list.noTree")
      : nodeCount === undefined
        ? ""
        : t("g3.list.nodes", { count: nodeCount });

  return (
    <article className="flex flex-col gap-5 rounded-[14px] bg-canvas p-4">
      <div className="relative h-40">
        <div className={cx("flex h-full items-center justify-center rounded-eb-md px-6 pt-[34px] pb-4", mode.tile)}>
          <Icon aria-hidden="true" size={48} absoluteStrokeWidth strokeWidth={mode.iconStroke} />
        </div>
        <StatusPill tone={STATUS_PILL_TONE[item.status]} size="md" className="absolute top-1.5 left-1.5">
          {t(`g3.status.${item.status}`)}
        </StatusPill>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex h-6 items-center justify-between gap-2">
          <BadgeBase
            toneClassName={mode.tag}
            metricsClassName="gap-[5px] rounded-full px-2 py-[5px] text-[12px] leading-4 font-normal"
          >
            {t(`g3.mode.${item.learningMode}`)}
          </BadgeBase>
          <span className="truncate text-[16px] leading-6 text-link">{structure}</span>
        </div>
        <h3 className="truncate text-[16px] leading-6 font-normal text-ink" title={item.title}>
          {item.title}
        </h3>
        <InstructorLine name={courseName} initials={instructorInitials} avatarTone="accent" />
      </div>
      <div className="flex h-6 items-center justify-between gap-2">
        <span className="flex items-center gap-[5px] text-[12px] leading-4 text-ink-secondary">
          <Clock3 aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={1.3} />
          {t("g3.list.updated", { date: formatDay(item.updatedAt) })}
        </span>
        <Button variant="secondary" size="sm" to={buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: item.id })}>
          {editable ? t("g3.list.edit") : t("g3.list.view")}
        </Button>
      </div>
    </article>
  );
}
