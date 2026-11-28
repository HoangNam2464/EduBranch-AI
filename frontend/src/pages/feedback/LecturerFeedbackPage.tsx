import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  CircleCheck,
  Clock,
  FileCheck2,
  GitBranch,
  MessageSquareText,
  UserCheck,
  X,
  User,
} from "lucide-react";
import {
  Button,
  Field,
  FilterControl,
  MetricCard,
  Pagination,
  ResultCount,
  SearchField,
  cx,
} from "@/components/ds";
import { SubmissionReviewList } from "@/components/feedback";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDateTime } from "@/components/feedback/stateFormat";
import { useLecturerCourseCases } from "@/pages/statistics/useLecturerCourseCases";
import {
  FEEDBACK_MAX_LENGTH,
  FEEDBACK_MIN_LENGTH,
  lecturerFeedbackService,
  type LecturerFeedbackDto,
  type SubmissionReviewItem,
} from "@/services/lecturerFeedbackService";
import {
  countPendingSubmissions,
  filterSubmissions,
  getHttpStatus,
  mapErrorToI18nKey,
} from "./lecturerFeedbackLogic";

/**
 * 04.1 Hàng đợi Review và phản hồi lập luận & 05.3 Lecturer Student Submissions & Qualitative Feedback Workspace
 * Figma page EduBranch AI – Screens, node 483:14976 & Frame 05.3.
 *
 * AC-1: Display student submissions from both Review Study and completed Branching Study attempts.
 * AC-2: Client-side filtering by course, status with pending count, and sorting.
 * AC-3: Qualitative feedback composer for lecturers (min 10 chars, strictly no AI grading / scores),
 *       saving feedback, transitioning Review Study status to REVIEWED.
 */
export function LecturerFeedbackPage() {
  const { t } = useTranslation();
  const { caseId: routeCaseId } = useParams<{ caseId?: string }>();
  const { state: coursesState } = useLecturerCourseCases();

  // Data states
  const [submissions, setSubmissions] = useState<SubmissionReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErrorKey, setFetchErrorKey] = useState<string | null>(null);
  const [fetchErrorCode, setFetchErrorCode] = useState<number | undefined>(undefined);
  const [reloadCounter, setReloadCounter] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  // FE-019 AC: filter by learning mode; each mode keeps its own status rules (lecturerFeedbackLogic).
  const [learningMode, setLearningMode] = useState<"ALL" | "BRANCHING_STUDY" | "REVIEW_STUDY">("ALL");
  const [sort, setSort] = useState<"NEWEST" | "OLDEST">("NEWEST");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection & Feedback composer states
  const [selectedItem, setSelectedItem] = useState<SubmissionReviewItem | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const courses = coursesState.status === "ready" ? coursesState.data.map(({ course: c }) => c) : [];

  // Fetch submissions queue
  useEffect(() => {
    let isMounted = true;

    lecturerFeedbackService
      .getQueueSubmissions({
        courseId: course !== "ALL" ? course : undefined,
        caseId: routeCaseId,
      })
      .then((data) => {
        if (isMounted) {
          setSubmissions(data);
          setFetchErrorKey(null);
          setFetchErrorCode(undefined);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setFetchErrorKey(mapErrorToI18nKey(err));
          setFetchErrorCode(getHttpStatus(err));
          setSubmissions([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [course, routeCaseId, reloadCounter]);

  const handleRetry = () => {
    setIsLoading(true);
    setFetchErrorKey(null);
    setFetchErrorCode(undefined);
    setReloadCounter((prev) => prev + 1);
  };

  // Compute metrics dynamically from loaded submissions
  const unknown = t("g4.common.unknownValue");
  const metrics = useMemo(() => {
    const hasData = submissions.length > 0;
    const total = isLoading ? "..." : hasData ? String(submissions.length) : unknown;
    const pending = isLoading
      ? "..."
      : hasData
        ? String(submissions.filter((s) => !s.existingFeedback).length)
        : unknown;
    const reviewed = isLoading
      ? "..."
      : hasData
        ? String(submissions.filter((s) => Boolean(s.existingFeedback)).length)
        : unknown;
    const uniqueCases = isLoading
      ? "..."
      : hasData
        ? String(new Set(submissions.map((s) => s.caseId)).size)
        : unknown;

    return [
      { icon: FileCheck2, stroke: 1.7, label: t("g4.queue.metrics.total"), value: total },
      { icon: Clock, stroke: 1.51, label: t("g4.queue.metrics.pending"), value: pending },
      { icon: CircleCheck, stroke: 0.85, label: t("g4.queue.metrics.reviewed"), value: reviewed },
      { icon: GitBranch, stroke: 1.5, label: t("g4.queue.metrics.cases"), value: uniqueCases },
    ];
  }, [submissions, isLoading, unknown, t]);

  // Pending count from loaded items for status filter label
  const pendingCount = useMemo(() => countPendingSubmissions(submissions), [submissions]);

  // Dynamic status options showing pending count from loaded items
  const statusOptions = useMemo(() => {
    return [
      {
        value: "ALL",
        label: `${t("g4.queue.status.pending")} (${pendingCount})`,
      },
      { value: "PENDING", label: t("g4.queue.status.pending") },
      { value: "REVIEWED", label: t("g4.queue.status.reviewed") },
      { value: "REFLECTED", label: t("g4.queue.status.reflected") },
    ];
  }, [pendingCount, t]);

  // Filtered and sorted submissions (AC-2)
  const filteredSubmissions = useMemo(() => {
    return filterSubmissions(submissions, {
      search,
      course,
      learningMode,
      status,
      sort,
    });
  }, [submissions, search, course, learningMode, status, sort]);

  // Pagination calculation
  const pageCount = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const paginatedSubmissions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, page, pageSize]);

  // Select item for inspection & feedback
  const handleSelectItem = (item: SubmissionReviewItem) => {
    setSelectedItem(item);
    setFeedbackText(item.existingFeedback?.feedbackText || "");
    setValidationError(null);
    setSubmitSuccessMessage(null);
    setSubmitErrorMessage(null);
  };

  // Submit qualitative feedback (AC-3, E6)
  const handleSubmitFeedback = async () => {
    if (!selectedItem) return;
    const trimmed = feedbackText.trim();
    if (trimmed.length < FEEDBACK_MIN_LENGTH) {
      setValidationError(t("g4.queue.inspector.feedbackMin"));
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorMessage(null);
    setSubmitSuccessMessage(null);

    try {
      const isReview = selectedItem.targetType === "REVIEW_STUDY";
      const res = await lecturerFeedbackService.submitFeedback({
        reviewSubmissionId: isReview ? selectedItem.targetId : undefined,
        branchingAttemptId: !isReview ? selectedItem.targetId : undefined,
        feedbackText: trimmed,
      });

      // Refetch queue submissions to guarantee real server data without synthesis
      try {
        const refreshed = await lecturerFeedbackService.getQueueSubmissions({
          courseId: course !== "ALL" ? course : undefined,
          caseId: routeCaseId,
        });
        setSubmissions(refreshed);
        const updatedItem = refreshed.find(
          (s) => s.targetId === selectedItem.targetId && s.targetType === selectedItem.targetType,
        );
        if (updatedItem) {
          setSelectedItem(updatedItem);
        } else if (res?.id && res?.createdAt) {
          const updatedFeedback: LecturerFeedbackDto = {
            id: res.id,
            lecturerId: res.lecturerId,
            branchingAttemptId: res.branchingAttemptId ?? null,
            reviewSubmissionId: res.reviewSubmissionId ?? null,
            feedbackText: res.feedbackText || trimmed,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt || res.createdAt,
          };
          setSelectedItem((prev) =>
            prev
              ? {
                  ...prev,
                  feedbackStatus: "REVIEWED" as const,
                  submissionStatus: isReview ? ("REVIEWED" as const) : prev.submissionStatus,
                  existingFeedback: updatedFeedback,
                }
              : null,
          );
        }
      } catch {
        // Fallback only if server response contains full fields
        if (res?.id && res?.createdAt) {
          const updatedFeedback: LecturerFeedbackDto = {
            id: res.id,
            lecturerId: res.lecturerId,
            branchingAttemptId: res.branchingAttemptId ?? null,
            reviewSubmissionId: res.reviewSubmissionId ?? null,
            feedbackText: res.feedbackText || trimmed,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt || res.createdAt,
          };
          setSubmissions((prev) =>
            prev.map((s) => {
              if (s.targetId === selectedItem.targetId && s.targetType === selectedItem.targetType) {
                return {
                  ...s,
                  feedbackStatus: "REVIEWED" as const,
                  submissionStatus: isReview ? ("REVIEWED" as const) : s.submissionStatus,
                  existingFeedback: updatedFeedback,
                };
              }
              return s;
            }),
          );
          setSelectedItem((prev) =>
            prev
              ? {
                  ...prev,
                  feedbackStatus: "REVIEWED" as const,
                  submissionStatus: isReview ? ("REVIEWED" as const) : prev.submissionStatus,
                  existingFeedback: updatedFeedback,
                }
              : null,
          );
        }
      }

      setSubmitSuccessMessage(t("g4.queue.inspector.feedbackSuccess"));
      setFeedbackText("");
    } catch (err: unknown) {
      const errorKey = mapErrorToI18nKey(err);
      setSubmitErrorMessage(t("g4.queue.inspector.feedbackFailed", { error: t(errorKey) }));

      // C2-A: A 409 on submit maps to conflict message and triggers a refetch
      if (getHttpStatus(err) === 409) {
        try {
          const refreshed = await lecturerFeedbackService.getQueueSubmissions({
            courseId: course !== "ALL" ? course : undefined,
            caseId: routeCaseId,
          });
          setSubmissions(refreshed);
          const updatedItem = refreshed.find(
            (s) => s.targetId === selectedItem.targetId && s.targetType === selectedItem.targetType,
          );
          if (updatedItem) {
            setSelectedItem(updatedItem);
          }
        } catch {
          // ignore refetch failure; conflict error message stays visible
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard
            key={m.label}
            variant="stacked"
            icon={m.icon}
            iconStrokeWidth={m.stroke}
            label={m.label}
            value={m.value}
          />
        ))}
      </div>

      {/* Main Workspace */}
      <section
        className="flex min-h-[646px] flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card"
        aria-label={t("g4.queue.listLabel")}
      >
        {/* Toolbar with Search and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchField
            label={t("g4.queue.searchLabel")}
            placeholder={t("g4.queue.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-[280px]"
          />
          <div className="flex flex-wrap items-center gap-3">
            <FilterControl
              label={t("g4.queue.courseFilter")}
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setPage(1);
                setIsLoading(true);
                setFetchErrorKey(null);
                setFetchErrorCode(undefined);
              }}
              options={[
                { value: "ALL", label: t("g4.queue.allCourses") },
                ...courses.map((c) => ({
                  value: c.id,
                  label: c.courseCode ? `${c.courseCode} · ${c.name}` : c.name,
                })),
              ]}
            />
            <FilterControl
              label={t("g4.queue.modeFilter")}
              value={learningMode}
              onChange={(e) => {
                setLearningMode(e.target.value as "ALL" | "BRANCHING_STUDY" | "REVIEW_STUDY");
                setPage(1);
              }}
              options={[
                { value: "ALL", label: t("g4.queue.allModes") },
                { value: "BRANCHING_STUDY", label: t("g4.queue.modes.branching") },
                { value: "REVIEW_STUDY", label: t("g4.queue.modes.review") },
              ]}
            />
            <FilterControl
              label={t("g4.queue.statusFilter")}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={statusOptions}
            />
            <span className="text-[12px] leading-4 text-ink-secondary">{t("g4.queue.sortLabel")}</span>
            <FilterControl
              label={t("g4.queue.sortLabel")}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as "NEWEST" | "OLDEST");
                setPage(1);
              }}
              options={[
                { value: "NEWEST", label: t("g4.queue.sort.newest") },
                { value: "OLDEST", label: t("g4.queue.sort.oldest") },
              ]}
            />
          </div>
        </div>

        {/* Content View: Error State, Master-Detail (Figma 05.3), or Full Table (Figma 04.1) */}
        {fetchErrorKey ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <ErrorState
              framed={false}
              title={t("g4.queue.errors.loadTitle")}
              description={t(fetchErrorKey)}
              errorCode={fetchErrorCode}
              onRetry={handleRetry}
            />
          </div>
        ) : selectedItem ? (
          <div className="flex flex-1 gap-5 overflow-hidden">
            {/* Master List (360px left column) */}
            <div className="hidden w-[320px] shrink-0 flex-col overflow-hidden rounded-eb-lg border border-line bg-canvas/40 xl:flex 2xl:w-[360px]">
              <div className="flex items-center justify-between border-b border-line bg-canvas px-4 py-2.5">
                <span className="text-[12px] font-medium text-ink-secondary">
                  {t("g4.queue.listLabel")} ({filteredSubmissions.length})
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SubmissionReviewList
                  items={filteredSubmissions}
                  selectedId={selectedItem.targetId}
                  onSelectItem={handleSelectItem}
                  isLoading={isLoading}
                  compact={true}
                />
              </div>
            </div>

            {/* Submission Inspection & Feedback Composer (Right column) */}
            <div className="flex flex-1 flex-col overflow-y-auto rounded-eb-lg border border-line bg-surface p-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-line pb-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-selected text-link">
                      <User size={18} />
                    </div>
                    <div>
                      <h2 className="text-[16px] font-medium text-ink">
                        {selectedItem.studentName}
                      </h2>
                      {selectedItem.studentEmail && (
                        <p className="text-[12px] text-ink-secondary">
                          {selectedItem.studentEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px] text-ink-secondary">
                    <span
                      className={cx(
                        "inline-flex items-center gap-1 rounded-eb-sm px-2 py-0.5 text-[12px] font-medium",
                        selectedItem.targetType === "REVIEW_STUDY"
                          ? "border border-selected bg-selected text-link"
                          : "border border-primary/20 bg-primary/10 text-primary",
                      )}
                    >
                      {selectedItem.targetType === "REVIEW_STUDY" ? (
                        <>
                          <FileCheck2 size={12} />
                          <span>{t("g4.queue.modes.review")}</span>
                        </>
                      ) : (
                        <>
                          <GitBranch size={12} />
                          <span>
                            {t("g4.queue.modes.branching")}{" "}
                            {selectedItem.attemptNumber ? `#${selectedItem.attemptNumber}` : ""}
                          </span>
                        </>
                      )}
                    </span>
                    <span>·</span>
                    <span className="font-medium text-ink">{selectedItem.caseTitle}</span>
                    <span>·</span>
                    <span>
                      {selectedItem.courseCode ? `${selectedItem.courseCode} · ` : ""}
                      {selectedItem.courseName}
                    </span>
                    <span>·</span>
                    <span>
                      {selectedItem.submittedAt
                        ? formatDateTime(new Date(selectedItem.submittedAt))
                        : "—"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                  className="inline-flex items-center gap-1 text-ink-secondary hover:text-ink"
                  aria-label={t("g4.queue.inspector.close")}
                >
                  <X size={16} />
                  <span>{t("g4.queue.inspector.close")}</span>
                </Button>
              </div>

              {/* Student Work Section */}
              <div className="flex flex-col gap-4 py-5">
                <h3 className="text-[14px] font-medium text-ink">
                  {t("g4.queue.inspector.submissionDetails")}
                </h3>

                {selectedItem.targetType === "REVIEW_STUDY" ? (
                  <div className="flex flex-col gap-4">
                    {/* Situation Analysis */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("g4.queue.inspector.analysisTitle")}
                      </span>
                      <div className="rounded-eb-md border border-line bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
                        {selectedItem.studentAnalysis || (
                          <span className="italic text-ink-muted">
                            {t("g4.queue.inspector.emptyAnalysis")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Proposed Solution */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("g4.queue.inspector.solutionTitle")}
                      </span>
                      <div className="rounded-eb-md border border-line bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
                        {selectedItem.proposedSolution || (
                          <span className="italic text-ink-muted">—</span>
                        )}
                      </div>
                    </div>

                    {/* Supporting Reasoning */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("g4.queue.inspector.reasoningTitle")}
                      </span>
                      <div className="rounded-eb-md border border-line bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
                        {selectedItem.reasoningText || (
                          <span className="italic text-ink-muted">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Journey Details */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("g4.queue.inspector.journeyTitle")}
                      </span>
                      <div className="flex flex-wrap items-center gap-4 rounded-eb-md border border-line bg-canvas/60 p-3 text-[13px] text-ink">
                        {selectedItem.attemptNumber !== undefined && (
                          <span>
                            {t("g4.queue.inspector.attemptNumber", {
                              n: selectedItem.attemptNumber,
                            })}
                          </span>
                        )}
                        <span>
                          {t("g4.queue.inspector.stepsCount", {
                            count: selectedItem.steps?.length ?? selectedItem.stepsCount ?? 0,
                          })}
                        </span>
                        {selectedItem.outcomeSituation && (
                          <span className="font-medium text-primary">
                            {t("g4.queue.inspector.outcome")}: {selectedItem.outcomeSituation}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Journey Steps in Order */}
                    <div className="flex flex-col gap-3">
                      {selectedItem.steps && selectedItem.steps.length > 0 ? (
                        selectedItem.steps.map((step, idx) => (
                          <div
                            key={step.nodeId || idx}
                            className="flex flex-col gap-2 rounded-eb-md border border-line bg-canvas/40 p-3.5"
                          >
                            <div className="flex items-center justify-between border-b border-line/60 pb-2">
                              <span className="text-[12px] font-medium text-primary">
                                {t("g4.queue.inspector.stepNumber", { n: idx + 1 })}
                              </span>
                            </div>

                            {/* Situation */}
                            <div className="text-[13px] leading-5 text-ink">
                              <span className="font-medium text-ink-secondary">
                                {t("g4.queue.inspector.situation")}:{" "}
                              </span>
                              <span>{step.situation}</span>
                            </div>

                            {/* Chosen Option */}
                            <div className="text-[13px] leading-5 text-ink">
                              <span className="font-medium text-ink-secondary">
                                {t("g4.queue.inspector.selectedOption")}{" "}
                              </span>
                              <span className="font-medium text-link">{step.selectedOptionText}</span>
                            </div>

                            {/* Retrospective Reasoning */}
                            <div className="flex flex-col gap-1 pt-1">
                              <span className="text-[12px] font-medium text-ink-secondary">
                                {t("g4.queue.inspector.stepReasoningTitle")}
                              </span>
                              <div className="rounded-eb-sm border border-line/80 bg-surface p-2.5 text-[13px] leading-5 text-ink">
                                {step.reasoningText && step.reasoningText.trim() ? (
                                  step.reasoningText
                                ) : (
                                  <span className="italic text-ink-muted">
                                    {t("g4.queue.inspector.emptyStepReasoning")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-eb-md border border-line bg-canvas/40 p-3 text-[13px] text-ink-muted italic">
                          {t("g4.queue.inspector.emptySteps")}
                        </div>
                      )}
                    </div>

                    {/* Post-Journey Reflection */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("g4.queue.inspector.reflectionTitle")}
                      </span>
                      <div className="rounded-eb-md border border-line bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
                        {selectedItem.reflectionText || (
                          <span className="italic text-ink-muted">
                            {t("g4.queue.inspector.emptyReflection")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Qualitative Feedback Composer (AC-3, Frame 05.3, Fix 4: C2-A) */}
              <div className="flex flex-col gap-3.5 rounded-eb-lg border border-line bg-surface-muted/50 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} className="text-primary" />
                    <h3 className="text-[15px] font-medium text-ink">
                      {t("g4.queue.inspector.composerTitle")}
                    </h3>
                  </div>
                  {selectedItem.feedbackStatus === "REVIEWED" && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-selected px-2.5 py-0.5 text-[12px] leading-4 font-medium whitespace-nowrap text-link">
                      {t("g4.queue.badges.reviewed")}
                    </span>
                  )}
                </div>

                <p className="text-[12px] leading-4 text-ink-secondary">
                  {t("g4.queue.inspector.composerNotice")}
                </p>

                {/* When existingFeedback is present, show read-only card and hide composer */}
                {selectedItem.existingFeedback ? (
                  <div className="flex flex-col gap-2 rounded-eb-md border border-line bg-surface p-4 text-[13px] leading-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("g4.queue.inspector.previousFeedback")}
                      </span>
                      {selectedItem.existingFeedback.createdAt && (
                        <span className="text-[12px] text-ink-muted">
                          {t("g4.queue.inspector.sentAt", {
                            time: formatDateTime(new Date(selectedItem.existingFeedback.createdAt)),
                          })}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap rounded-eb-sm bg-canvas/60 p-3 text-ink">
                      {selectedItem.existingFeedback.feedbackText}
                    </p>
                    <p className="text-[12px] text-ink-muted italic">
                      {t("g4.queue.inspector.alreadyReviewedNotice")}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Feedback Input Field */}
                    <Field
                      multiline
                      rows={4}
                      label={t("g4.queue.inspector.feedbackLabel")}
                      placeholder={t("g4.queue.inspector.feedbackPlaceholder")}
                      value={feedbackText}
                      onChange={(e) => {
                        setFeedbackText(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      helper={`${feedbackText.length} / ${FEEDBACK_MAX_LENGTH}`}
                      error={validationError}
                      maxLength={FEEDBACK_MAX_LENGTH}
                    />

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleSubmitFeedback}
                        disabled={isSubmitting || feedbackText.trim().length < FEEDBACK_MIN_LENGTH}
                        leadingIcon={MessageSquareText}
                      >
                        {isSubmitting ? t("g4.queue.inspector.submittingFeedback") : t("g4.queue.inspector.submitFeedback")}
                      </Button>
                    </div>
                  </>
                )}

                {/* Feedback Submission Alerts */}
                {submitSuccessMessage && (
                  <div className="flex items-center gap-2 rounded-eb-md border border-success-border bg-success-bg p-3 text-[13px] text-success-text">
                    <CheckCircle2 size={16} className="shrink-0 text-success" />
                    <span>{submitSuccessMessage}</span>
                  </div>
                )}
                {submitErrorMessage && (
                  <div className="flex items-center gap-2 rounded-eb-md border border-error-border bg-error-bg p-3 text-[13px] text-error-text">
                    <AlertCircle size={16} className="shrink-0 text-error" />
                    <span>{submitErrorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Full Table View (Figma 04.1) */
          <div className="flex flex-1 flex-col gap-4">
            <SubmissionReviewList
              items={paginatedSubmissions}
              onSelectItem={handleSelectItem}
              isLoading={isLoading}
              compact={false}
            />
            {!isLoading && filteredSubmissions.length > 0 && (
              <div className="flex items-center justify-between pt-2">
                <ResultCount
                  leadingLabel={t("g4.queue.pagination.showing")}
                  trailingLabel={t("g4.queue.pagination.ofTotal", { count: filteredSubmissions.length })}
                  pageSize={pageSize}
                  pageSizeOptions={[10, 20, 50]}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  pageSizeLabel={t("g4.queue.pagination.pageSize")}
                />
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onPageChange={setPage}
                  labels={{
                    nav: t("g4.queue.pagination.nav"),
                    previous: t("g4.queue.pagination.previous"),
                    next: t("g4.queue.pagination.next"),
                    page: (n) => t("g4.queue.pagination.pageN", { page: n }),
                  }}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
