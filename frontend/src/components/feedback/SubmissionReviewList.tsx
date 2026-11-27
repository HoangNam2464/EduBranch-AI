/**
 * EduBranch AI — SubmissionReviewList Component
 * Displays the list of student submissions across Branching Study and Review Study
 * for lecturer inspection and qualitative review (AC-1, AC-2, Figma 04.1 / 05.3).
 */

import { useTranslation } from "react-i18next";
import {
  FileCheck2,
  GitBranch,
  Clock,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { cx, Button, Avatar } from "@/components/ds";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { SubmissionReviewItem } from "@/services/lecturerFeedbackService";
import {
  formatSubmissionDate,
  getSubmissionQueueStatus,
  initialsOf,
} from "@/pages/feedback/lecturerFeedbackLogic";

export interface SubmissionReviewListProps {
  items: SubmissionReviewItem[];
  selectedId?: string;
  onSelectItem: (item: SubmissionReviewItem) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export function SubmissionReviewList({
  items,
  selectedId,
  onSelectItem,
  isLoading = false,
  compact = false,
}: SubmissionReviewListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={cx("flex flex-col gap-3", compact ? "p-3" : "p-4")} role="status" aria-label={t("common.loading")}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className={cx("w-full rounded-eb-md bg-canvas motion-safe:animate-pulse", compact ? "h-16" : "h-14")} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    if (compact) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <Inbox size={32} className="text-ink-muted mb-2" />
          <p className="text-[13px] font-medium text-ink-secondary">{t("g4.queue.emptyTitle")}</p>
          <p className="text-[12px] text-ink-muted mt-1">{t("g4.queue.emptyDescription")}</p>
        </div>
      );
    }
    return (
      <EmptyState
        framed={false}
        className="m-auto py-12"
        icon={Inbox}
        title={t("g4.queue.emptyTitle")}
        description={t("g4.queue.emptyDescription")}
      />
    );
  }

  if (compact) {
    return (
      <div className="flex flex-col divide-y divide-surface-hover overflow-y-auto" role="list">
        {items.map((item) => {
          const isSelected = selectedId === item.targetId;
          const isReviewStudy = item.targetType === "REVIEW_STUDY";
          const formattedDate = formatSubmissionDate(item.submittedAt);
          const queueStatus = getSubmissionQueueStatus(item);

          return (
            <button
              type="button"
              key={`${item.targetType}-${item.targetId}`}
              onClick={() => onSelectItem(item)}
              className={cx(
                "flex flex-col gap-1.5 p-3.5 text-left transition-colors border-l-4",
                isSelected
                  ? "bg-selected/70 border-primary font-medium"
                  : "border-transparent hover:bg-surface-hover/60"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] leading-5 font-medium text-ink">
                  {item.studentName}
                </span>
                <span className="shrink-0 text-[12px] leading-4 text-ink-secondary">
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={cx(
                  "inline-flex items-center gap-1 rounded-eb-sm px-1.5 py-0.5 text-[12px] leading-3 font-medium",
                  isReviewStudy ? "bg-selected text-link border border-selected" : "bg-primary/10 text-primary border border-primary/20",
                )}>
                  {isReviewStudy ? <FileCheck2 size={11} /> : <GitBranch size={11} />}
                  <span>{isReviewStudy ? t("g4.queue.modes.review") : `${t("g4.queue.modes.branching")} ${item.attemptNumber ? `#${item.attemptNumber}` : ""}`}</span>
                </span>
                <span className="truncate text-[12px] leading-4 text-ink-secondary" title={item.caseTitle}>
                  {item.caseTitle}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                {queueStatus === "PENDING" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[12px] leading-3 font-medium text-status-approved-text">
                    <Clock size={11} className="text-warning" />
                    <span>{t("g4.queue.badges.pending")}</span>
                  </span>
                )}
                {queueStatus === "REVIEWED" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-selected px-2 py-0.5 text-[12px] leading-3 font-medium text-link">
                    <CheckCircle2 size={11} className="text-link" />
                    <span>{t("g4.queue.badges.reviewed")}</span>
                  </span>
                )}
                {queueStatus === "REFLECTED" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[12px] leading-3 font-medium text-status-published-text">
                    <CheckCircle2 size={11} className="text-status-published-text" />
                    <span>{t("g4.queue.badges.reflected")}</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[960px] table-fixed border-separate border-spacing-0" aria-label={t("g4.queue.listLabel")}>
        <thead>
          <tr className="h-10">
            <th scope="col" className="w-[216px] rounded-l-eb-md bg-canvas pl-4 text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.student")}
              <span aria-hidden="true" className="ml-1 text-[12px] leading-[14px]">↕</span>
            </th>
            <th scope="col" className="w-[150px] bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.submittedAt")}
              <span aria-hidden="true" className="ml-1 text-[12px] leading-[14px]">↕</span>
            </th>
            <th scope="col" className="bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.case")}
              <span aria-hidden="true" className="ml-1 text-[12px] leading-[14px]">↕</span>
            </th>
            <th scope="col" className="w-[72px] bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.attempt")}
              <span aria-hidden="true" className="ml-1 text-[12px] leading-[14px]">↕</span>
            </th>
            <th scope="col" className="w-[152px] bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.action")}
              <span aria-hidden="true" className="ml-1 text-[12px] leading-[14px]">↕</span>
            </th>
            <th scope="col" className="w-[148px] rounded-r-eb-md bg-canvas pr-4 text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.status")}
              <span aria-hidden="true" className="ml-1 text-[12px] leading-[14px]">↕</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isSelected = selectedId === item.targetId;
            const isReviewStudy = item.targetType === "REVIEW_STUDY";
            const formattedDate = formatSubmissionDate(item.submittedAt);
            const queueStatus = getSubmissionQueueStatus(item);
            const modeText = isReviewStudy ? t("g4.queue.modes.review") : t("g4.queue.modes.branching");
            const subLine = `${modeText} · ${item.courseName}`;

            return (
              <tr
                key={`${item.targetType}-${item.targetId}`}
                onClick={() => onSelectItem(item)}
                className={cx(
                  "group h-16 cursor-pointer border-b border-surface-hover transition-colors",
                  isSelected
                    ? "bg-selected/70 font-medium"
                    : "hover:bg-surface-hover/60",
                )}
              >
                {/* 1. Student */}
                <td className="pl-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={initialsOf(item.studentName)} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] leading-5 font-medium text-ink">
                        {item.studentName}
                      </p>
                      {item.studentEmail && (
                        <p className="truncate text-[12px] leading-4 text-ink-secondary">
                          {item.studentEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. Submitted At */}
                <td>
                  <span className="truncate text-[12px] leading-4 text-ink-secondary">
                    {formattedDate}
                  </span>
                </td>

                {/* 3. Case Study & Course */}
                <td>
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-[14px] leading-5 font-medium text-ink" title={item.caseTitle}>
                      {item.caseTitle}
                    </p>
                    <p className="truncate text-[12px] leading-4 text-ink-secondary" title={item.courseName}>
                      {subLine}
                    </p>
                  </div>
                </td>

                {/* 4. Attempt */}
                <td>
                  <span className="text-[13px] leading-4 text-ink-secondary">
                    {item.attemptNumber ? `#${item.attemptNumber}` : "—"}
                  </span>
                </td>

                {/* 5. Action */}
                <td>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                  >
                    <span>
                      {item.existingFeedback
                        ? t("g4.queue.actions.viewFeedback")
                        : t("g4.queue.actions.review")}
                    </span>
                  </Button>
                </td>

                {/* 6. Status */}
                <td className="pr-4">
                  {queueStatus === "PENDING" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-0.5 text-[12px] leading-4 font-medium text-status-approved-text">
                      <Clock size={12} className="text-warning" />
                      <span>{t("g4.queue.badges.pending")}</span>
                    </span>
                  )}
                  {queueStatus === "REVIEWED" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-selected px-2.5 py-0.5 text-[12px] leading-4 font-medium text-link">
                      <CheckCircle2 size={12} className="text-link" />
                      <span>{t("g4.queue.badges.reviewed")}</span>
                    </span>
                  )}
                  {queueStatus === "REFLECTED" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[12px] leading-4 font-medium text-status-published-text">
                      <CheckCircle2 size={12} className="text-status-published-text" />
                      <span>{t("g4.queue.badges.reflected")}</span>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
