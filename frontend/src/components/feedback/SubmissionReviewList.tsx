/**
 * EduBranch AI — SubmissionReviewList Component
 * Displays the list of student submissions across Branching Study and Review Study
 * for lecturer inspection and qualitative review (AC-1, AC-2, Figma 04.1 / 05.3).
 */

import { useTranslation } from "react-i18next";
import {
  FileCheck2,
  GitBranch,
  MessageSquareText,
  Clock,
  CheckCircle2,
  Inbox,
  User,
} from "lucide-react";
import { cx, Button, SubmissionBadge } from "@/components/ds";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDateTime } from "@/components/feedback/stateFormat";
import type { SubmissionReviewItem } from "@/services/lecturerFeedbackService";

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
          <p className="text-[11px] text-ink-muted mt-1">{t("g4.queue.emptyDescription")}</p>
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
          const submittedDate = item.submittedAt ? new Date(item.submittedAt) : null;
          const formattedDate = submittedDate && !Number.isNaN(submittedDate.getTime()) ? formatDateTime(submittedDate) : item.submittedAt;

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
                <span className="shrink-0 text-[11px] leading-4 text-ink-secondary">
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={cx(
                  "inline-flex items-center gap-1 rounded-eb-sm px-1.5 py-0.5 text-[10px] leading-3 font-medium",
                  isReviewStudy ? "bg-sky-50 text-accent border border-accent/20" : "bg-primary/10 text-primary border border-primary/20",
                )}>
                  {isReviewStudy ? <FileCheck2 size={11} /> : <GitBranch size={11} />}
                  <span>{isReviewStudy ? t("g4.queue.modes.review") : `${t("g4.queue.modes.branching")} ${item.attemptNumber ? `#${item.attemptNumber}` : ""}`}</span>
                </span>
                <span className="truncate text-[12px] leading-4 text-ink-secondary" title={item.caseTitle}>
                  {item.caseTitle}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                {isReviewStudy ? (
                  <div>
                    {item.submissionStatus === "SUBMITTED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[10px] leading-3 font-medium text-status-approved-text">
                        <span className="size-1.5 rounded-full bg-warning" />
                        {t("g4.queue.badges.pending")}
                      </span>
                    )}
                    {item.submissionStatus === "REVIEWED" && (
                      <SubmissionBadge status="reviewed">
                        {t("g4.queue.badges.reviewed")}
                      </SubmissionBadge>
                    )}
                    {item.submissionStatus === "REFLECTED" && (
                      <SubmissionBadge status="reflected">
                        {t("g4.queue.badges.reflected")}
                      </SubmissionBadge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {item.feedbackStatus === "REVIEWED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[10px] leading-3 font-medium text-success-text">
                        <CheckCircle2 size={11} className="text-success" />
                        {t("g4.queue.badges.reviewed")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[10px] leading-3 font-medium text-status-approved-text">
                        <span className="size-1.5 rounded-full bg-warning" />
                        {t("g4.queue.badges.pending")}
                      </span>
                    )}
                    {item.reflectionStatus === "SUBMITTED" && (
                      <span className="text-[10px] leading-3 text-success font-medium">
                        {t("g4.queue.badges.reflected")}
                      </span>
                    )}
                  </div>
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
      <table className="w-full table-fixed border-separate border-spacing-0" aria-label={t("g4.queue.listLabel")}>
        <thead>
          <tr className="h-10">
            <th scope="col" className="w-[200px] rounded-l-eb-md bg-canvas pl-4 text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.student")}
            </th>
            <th scope="col" className="w-[140px] bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.mode")}
            </th>
            <th scope="col" className="w-[280px] bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.case")}
            </th>
            <th scope="col" className="w-[100px] bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.attempt")}
            </th>
            <th scope="col" className="w-[150px] bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.submittedAt")}
            </th>
            <th scope="col" className="w-[180px] bg-canvas text-left text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.status")}
            </th>
            <th scope="col" className="w-[120px] rounded-r-eb-md bg-canvas pr-4 text-right text-[12px] leading-4 font-normal text-ink-secondary">
              {t("g4.queue.columns.action")}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isSelected = selectedId === item.targetId;
            const isReviewStudy = item.targetType === "REVIEW_STUDY";
            const submittedDate = item.submittedAt ? new Date(item.submittedAt) : null;
            const formattedDate = submittedDate && !Number.isNaN(submittedDate.getTime()) ? formatDateTime(submittedDate) : item.submittedAt;

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
                {/* Student */}
                <td className="pl-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-selected text-link">
                      <User size={16} />
                    </div>
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

                {/* Mode */}
                <td>
                  <span className={cx(
                    "inline-flex items-center gap-1.5 rounded-eb-sm px-2 py-0.5 text-[12px] leading-4 font-medium",
                    isReviewStudy ? "bg-sky-50 text-accent border border-accent/20" : "bg-primary/10 text-primary border border-primary/20",
                  )}>
                    {isReviewStudy ? (
                      <>
                        <FileCheck2 size={13} className="shrink-0" />
                        <span>{t("g4.queue.modes.review")}</span>
                      </>
                    ) : (
                      <>
                        <GitBranch size={13} className="shrink-0" />
                        <span>{t("g4.queue.modes.branching")}</span>
                      </>
                    )}
                  </span>
                </td>

                {/* Case & Course */}
                <td>
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-[14px] leading-5 text-ink" title={item.caseTitle}>
                      {item.caseTitle}
                    </p>
                    <p className="truncate text-[12px] leading-4 text-ink-secondary" title={item.courseName}>
                      {item.courseCode ? `${item.courseCode} · ` : ""}{item.courseName}
                    </p>
                  </div>
                </td>

                {/* Attempt / Mode specifics */}
                <td>
                  <span className="text-[13px] leading-4 text-ink-secondary">
                    {item.attemptNumber ? `#${item.attemptNumber}` : "—"}
                  </span>
                </td>

                {/* Submitted At */}
                <td>
                  <div className="flex items-center gap-1.5 text-[12px] leading-4 text-ink-secondary">
                    <Clock size={13} className="shrink-0 text-ink-muted" />
                    <span className="truncate">{formattedDate}</span>
                  </div>
                </td>

                {/* Review Status */}
                <td>
                  <div className="flex flex-col gap-1 pr-2">
                    {isReviewStudy ? (
                      <div>
                        {item.submissionStatus === "SUBMITTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[11px] leading-4 font-medium text-status-approved-text">
                            <span className="size-1.5 rounded-full bg-warning" />
                            {t("g4.queue.status.pendingReview")}
                          </span>
                        )}
                        {item.submissionStatus === "REVIEWED" && (
                          <SubmissionBadge status="reviewed">
                            {t("g4.queue.status.reviewed")}
                          </SubmissionBadge>
                        )}
                        {item.submissionStatus === "REFLECTED" && (
                          <SubmissionBadge status="reflected">
                            {t("g4.queue.status.reflected")}
                          </SubmissionBadge>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.feedbackStatus === "REVIEWED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[11px] leading-4 font-medium text-success-text">
                            <CheckCircle2 size={12} className="text-success" />
                            {t("g4.queue.badges.reviewed")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[11px] leading-4 font-medium text-status-approved-text">
                            <span className="size-1.5 rounded-full bg-warning" />
                            {t("g4.queue.badges.pending")}
                          </span>
                        )}
                        {item.reflectionStatus === "SUBMITTED" ? (
                          <span className="text-[11px] leading-3 text-success font-medium">
                            {t("g4.queue.status.reflectionSubmitted")}
                          </span>
                        ) : (
                          <span className="text-[11px] leading-3 text-ink-muted">
                            {t("g4.queue.status.reflectionPending")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Action */}
                <td className="pr-4 text-right">
                  <Button
                    variant={isSelected ? "primary" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <MessageSquareText size={14} />
                    <span>{t("g4.queue.actions.review")}</span>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
