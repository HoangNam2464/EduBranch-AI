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
import { isAxiosError } from "axios";
import {
  Button,
  Field,
  FilterControl,
  MetricCard,
  SearchField,
  SubmissionBadge,
  cx,
} from "@/components/ds";
import { SubmissionReviewList } from "@/components/feedback";
import { formatDateTime } from "@/components/feedback/stateFormat";
import { useLecturerCourseCases } from "@/pages/statistics/useLecturerCourseCases";
import {
  FEEDBACK_MAX_LENGTH,
  FEEDBACK_MIN_LENGTH,
  lecturerFeedbackService,
  type SubmissionReviewItem,
} from "@/services/lecturerFeedbackService";

/**
 * 04.1 Hàng đợi Review và phản hồi lập luận & 05.3 Lecturer Student Submissions & Qualitative Feedback Workspace
 * Figma page EduBranch AI – Screens, node 483:14976 & Frame 05.3.
 *
 * AC-1: Display student submissions from both Review Study and completed Branching Study attempts.
 * AC-2: Client-side filtering by Learning Mode (All, Branching, Review) and mode-specific statuses.
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
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("ALL");
  const [learningMode, setLearningMode] = useState<"ALL" | "BRANCHING_STUDY" | "REVIEW_STUDY">("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState<"NEWEST" | "OLDEST">("NEWEST");

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
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
              ? err.message
              : String(err);
          setFetchError(msg);
          setSubmissions([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [course, routeCaseId]);

  // Compute metrics dynamically from loaded submissions
  const unknown = t("g4.common.unknownValue");
  const metrics = useMemo(() => {
    const hasData = submissions.length > 0;
    const total = isLoading ? "..." : hasData ? String(submissions.length) : unknown;
    const pending = isLoading
      ? "..."
      : hasData
        ? String(submissions.filter((s) => s.feedbackStatus === "PENDING").length)
        : unknown;
    const reviewed = isLoading
      ? "..."
      : hasData
        ? String(submissions.filter((s) => s.feedbackStatus === "REVIEWED").length)
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

  // Dynamic status options based on learning mode
  const statusOptions = useMemo(() => {
    if (learningMode === "REVIEW_STUDY") {
      return [
        { value: "ALL", label: t("g4.queue.status.all") },
        { value: "PENDING", label: t("g4.queue.status.pendingReview") },
        { value: "REVIEWED", label: t("g4.queue.status.reviewed") },
        { value: "REFLECTED", label: t("g4.queue.status.reflected") },
      ];
    }
    if (learningMode === "BRANCHING_STUDY") {
      return [
        { value: "ALL", label: t("g4.queue.status.all") },
        { value: "PENDING", label: t("g4.queue.status.pending") },
        { value: "REVIEWED", label: t("g4.queue.status.reviewed") },
        { value: "COMPLETED", label: t("g4.queue.status.completed") },
        { value: "REFLECTION_SUBMITTED", label: t("g4.queue.status.reflectionSubmitted") },
        { value: "REFLECTION_PENDING", label: t("g4.queue.status.reflectionPending") },
      ];
    }
    return [
      { value: "ALL", label: t("g4.queue.status.all") },
      { value: "PENDING", label: t("g4.queue.status.pending") },
      { value: "REVIEWED", label: t("g4.queue.status.reviewed") },
    ];
  }, [learningMode, t]);

  // Reset status filter if invalid for selected learning mode
  const handleModeChange = (newMode: string) => {
    const mode = newMode as "ALL" | "BRANCHING_STUDY" | "REVIEW_STUDY";
    setLearningMode(mode);
    setStatus("ALL");
  };

  // Filtered and sorted submissions (AC-2)
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((item) => {
        // Search filter
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const matchesStudent =
            item.studentName.toLowerCase().includes(q) ||
            (item.studentEmail?.toLowerCase().includes(q) ?? false);
          const matchesCase = item.caseTitle.toLowerCase().includes(q);
          const matchesCourse =
            item.courseName.toLowerCase().includes(q) ||
            (item.courseCode?.toLowerCase().includes(q) ?? false);
          if (!matchesStudent && !matchesCase && !matchesCourse) {
            return false;
          }
        }

        // Course filter
        if (course !== "ALL" && item.courseId !== course) {
          return false;
        }

        // Learning mode filter
        if (learningMode !== "ALL" && item.targetType !== learningMode) {
          return false;
        }

        // Status filter
        if (status !== "ALL") {
          if (learningMode === "REVIEW_STUDY") {
            if (status === "PENDING" && item.submissionStatus !== "SUBMITTED") return false;
            if (status === "REVIEWED" && item.submissionStatus !== "REVIEWED") return false;
            if (status === "REFLECTED" && item.submissionStatus !== "REFLECTED") return false;
          } else if (learningMode === "BRANCHING_STUDY") {
            if (status === "PENDING" && item.feedbackStatus !== "PENDING") return false;
            if (status === "REVIEWED" && item.feedbackStatus !== "REVIEWED") return false;
            if (status === "COMPLETED" && !item.isCompleted) return false;
            if (status === "REFLECTION_SUBMITTED" && item.reflectionStatus !== "SUBMITTED") return false;
            if (status === "REFLECTION_PENDING" && item.reflectionStatus === "SUBMITTED") return false;
          } else {
            // Mode ALL
            if (status === "PENDING" && item.feedbackStatus !== "PENDING") return false;
            if (status === "REVIEWED" && item.feedbackStatus !== "REVIEWED") return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.submittedAt).getTime() || 0;
        const timeB = new Date(b.submittedAt).getTime() || 0;
        return sort === "NEWEST" ? timeB - timeA : timeA - timeB;
      });
  }, [submissions, search, course, learningMode, status, sort]);

  // Select item for inspection & feedback
  const handleSelectItem = (item: SubmissionReviewItem) => {
    setSelectedItem(item);
    setFeedbackText(item.existingFeedback?.feedbackText || "");
    setValidationError(null);
    setSubmitSuccessMessage(null);
    setSubmitErrorMessage(null);
  };

  // Submit qualitative feedback (AC-3)
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
        reviewSubmissionId: isReview ? selectedItem.submissionId || selectedItem.id : undefined,
        branchingAttemptId: !isReview ? selectedItem.attemptId || selectedItem.id : undefined,
        feedbackText: trimmed,
      });

      const updatedFeedback = {
        id: res.id || `fb-${Date.now()}`,
        feedbackText: res.feedbackText || trimmed,
        createdAt: res.createdAt || new Date().toISOString(),
      };

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.id === selectedItem.id) {
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

      setSubmitSuccessMessage(t("g4.queue.inspector.feedbackSuccess"));
      setFeedbackText("");
    } catch (err: unknown) {
      const errorMsg = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
          ? err.message
          : String(err);
      setSubmitErrorMessage(t("g4.queue.inspector.feedbackFailed", { error: errorMsg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-4 gap-5">
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-[280px]"
          />
          <div className="flex flex-wrap items-center gap-3">
            <FilterControl
              label={t("g4.queue.courseFilter")}
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setIsLoading(true);
                setFetchError(null);
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
              onChange={(e) => handleModeChange(e.target.value)}
              options={[
                { value: "ALL", label: t("g4.queue.modes.all") },
                { value: "BRANCHING_STUDY", label: t("g4.queue.modes.branching") },
                { value: "REVIEW_STUDY", label: t("g4.queue.modes.review") },
              ]}
            />
            <FilterControl
              label={t("g4.queue.statusFilter")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
            <span className="text-[12px] leading-4 text-ink-secondary">{t("g4.queue.sortLabel")}</span>
            <FilterControl
              label={t("g4.queue.sortLabel")}
              value={sort}
              onChange={(e) => setSort(e.target.value as "NEWEST" | "OLDEST")}
              options={[
                { value: "NEWEST", label: t("g4.queue.sort.newest") },
                { value: "OLDEST", label: t("g4.queue.sort.oldest") },
              ]}
            />
          </div>
        </div>

        {/* Global Fetch Error if any */}
        {fetchError && (
          <div className="flex items-center gap-2 rounded-eb-md border border-error-border bg-error-bg p-3 text-[13px] text-error-text">
            <AlertCircle size={16} className="shrink-0 text-error" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* Content View: Master-Detail (Figma 05.3) or Full Table (Figma 04.1) */}
        {selectedItem ? (
          <div className="flex flex-1 gap-5 overflow-hidden">
            {/* Master List (360px left column) */}
            <div className="flex w-[360px] shrink-0 flex-col overflow-hidden rounded-eb-lg border border-default bg-canvas/40">
              <div className="flex items-center justify-between border-b border-default bg-canvas px-4 py-2.5">
                <span className="text-[12px] font-medium text-ink-secondary">
                  {t("g4.queue.listLabel")} ({filteredSubmissions.length})
                </span>
                <span className="text-[11px] text-ink-muted">
                  {learningMode === "ALL" ? t("g4.queue.modes.all") : learningMode}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SubmissionReviewList
                  items={filteredSubmissions}
                  selectedId={selectedItem.id}
                  onSelectItem={handleSelectItem}
                  isLoading={isLoading}
                  compact={true}
                />
              </div>
            </div>

            {/* Submission Inspection & Feedback Composer (Right column) */}
            <div className="flex flex-1 flex-col overflow-y-auto rounded-eb-lg border border-default bg-surface p-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-default pb-4">
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
                        "inline-flex items-center gap-1 rounded-eb-sm px-2 py-0.5 text-[11px] font-medium",
                        selectedItem.targetType === "REVIEW_STUDY"
                          ? "border border-accent/20 bg-sky-50 text-accent"
                          : "border border-primary/20 bg-primary/10 text-primary",
                      )}
                    >
                      {selectedItem.targetType === "REVIEW_STUDY" ? (
                        <>
                          <FileCheck2 size={12} />
                          <span>Review Study</span>
                        </>
                      ) : (
                        <>
                          <GitBranch size={12} />
                          <span>
                            Branching Study{" "}
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
                      <div className="rounded-eb-md border border-default bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
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
                      <div className="rounded-eb-md border border-default bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
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
                      <div className="rounded-eb-md border border-default bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
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
                      <div className="flex items-center gap-4 rounded-eb-md border border-default bg-canvas/60 p-3 text-[13px] text-ink">
                        {selectedItem.attemptNumber && (
                          <span>
                            {t("g4.queue.inspector.attemptNumber", {
                              n: selectedItem.attemptNumber,
                            })}
                          </span>
                        )}
                        {selectedItem.stepsCount !== undefined && (
                          <span>
                            {t("g4.queue.inspector.stepsCount", {
                              count: selectedItem.stepsCount,
                            })}
                          </span>
                        )}
                        {selectedItem.outcomeTitle && (
                          <span className="font-medium text-primary">
                            {t("g4.queue.inspector.outcome")}: {selectedItem.outcomeTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Retrospective Reasoning */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("g4.queue.inspector.reasoningTitle")}
                      </span>
                      <div className="rounded-eb-md border border-default bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
                        {selectedItem.reasoningText || (
                          <span className="italic text-ink-muted">—</span>
                        )}
                      </div>
                    </div>

                    {/* Post-Journey Reflection */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("g4.queue.inspector.reflectionTitle")}
                      </span>
                      <div className="rounded-eb-md border border-default bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
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

              {/* Qualitative Feedback Composer (AC-3, Frame 05.3) */}
              <div className="flex flex-col gap-3.5 rounded-eb-lg border border-default bg-surface-muted/50 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} className="text-primary" />
                    <h3 className="text-[15px] font-medium text-ink">
                      {t("g4.queue.inspector.composerTitle")}
                    </h3>
                  </div>
                  {selectedItem.feedbackStatus === "REVIEWED" && (
                    <SubmissionBadge status="reviewed">
                      {t("g4.queue.badges.reviewed")}
                    </SubmissionBadge>
                  )}
                </div>

                <p className="text-[12px] leading-4 text-ink-secondary">
                  {t("g4.queue.inspector.composerNotice")}
                </p>

                {/* Previously sent feedback display */}
                {selectedItem.existingFeedback && (
                  <div className="flex flex-col gap-1 rounded-eb-md border border-default bg-surface p-3.5 text-[13px] leading-5">
                    <span className="text-[11px] font-medium text-ink-secondary">
                      {t("g4.queue.inspector.previousFeedback")}{" "}
                      {selectedItem.existingFeedback.createdAt &&
                        t("g4.queue.inspector.sentAt", {
                          time: formatDateTime(new Date(selectedItem.existingFeedback.createdAt)),
                        })}
                    </span>
                    <p className="whitespace-pre-wrap text-ink">
                      {selectedItem.existingFeedback.feedbackText}
                    </p>
                  </div>
                )}

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

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitFeedback}
                    disabled={isSubmitting || feedbackText.trim().length < FEEDBACK_MIN_LENGTH}
                    className="inline-flex items-center gap-2"
                  >
                    <MessageSquareText size={16} />
                    <span>
                      {isSubmitting
                        ? t("g4.queue.inspector.submittingFeedback")
                        : t("g4.queue.inspector.submitFeedback")}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Table View (Figma 04.1) */
          <div className="flex flex-1 flex-col overflow-x-auto">
            <SubmissionReviewList
              items={filteredSubmissions}
              onSelectItem={handleSelectItem}
              isLoading={isLoading}
              compact={false}
            />
          </div>
        )}
      </section>
    </div>
  );
}
