/**
 * Review Study · Student Workspace — Figma 06.1 (form) & 06.2 (submitted, awaiting feedback).
 *
 * Route: /student/cases/:caseId/review-study
 *
 * Rules (feature-review-study.md & Task FE-018 / EBA-413):
 * 1. Accessible only for PUBLISHED cases with learning_mode = 'REVIEW_STUDY'.
 * 2. Displays context_text and problem_text from the backend case.
 * 3. Form input:
 *    - student_analysis (optional, max 3000 chars)
 *    - proposed_solution (required, min 10 chars, max 3000 chars)
 *    - reasoning_text (required, min 10 chars, max 3000 chars)
 * 4. Single submission gate: each student is permitted exactly ONE submission per case (UNIQUE(student_id, case_id)).
 * 5. Once submitted (or when existing submission is loaded), transitions to Read-Only Submitted state (Figma 06.2).
 * 6. No retries / re-submissions permitted.
 * 7. Completely isolated from Branching Study attempts.
 * 8. Real API communication, validation & API error handling without faking success.
 * 9. Loading, submitting, success, and error states properly represented.
 */
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { SubmissionBadge } from "@/components/ds/SubmissionBadge";
import { formatDateTime, isValidDate } from "@/components/feedback/stateFormat";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";
import { ActionBar, Card, CardTitle, KeyValueList } from "@/pages/branching/components/parts";
import { BarButton } from "@/pages/branching/ReflectionPage";
import { PlayerError } from "@/pages/branching/BranchingCasePlayerPage";
import { errorMessage, useLoad } from "@/pages/branching/components/useStudentCase";
import { caseService } from "@/services/caseService";
import { courseService } from "@/services/courseService";
import {
  reviewStudyService,
  PROPOSED_SOLUTION_MIN_LENGTH,
  REASONING_MIN_LENGTH,
  PROPOSED_SOLUTION_MAX_LENGTH,
  STUDENT_ANALYSIS_MAX_LENGTH,
  REASONING_MAX_LENGTH,
} from "@/services/reviewStudyService";
import type { Case, Course, ReviewStudySubmission } from "@/types";

export interface ReviewStudyWorkspaceContext {
  caseData: Case;
  course: Course;
  initialSubmission: ReviewStudySubmission | null;
}

async function loadReviewStudyWorkspace(caseId: string): Promise<ReviewStudyWorkspaceContext> {
  const caseData = await caseService.getCaseById(caseId);
  const course = await courseService.getCourseById(caseData.courseId);
  let initialSubmission: ReviewStudySubmission | null = null;
  try {
    initialSubmission = await reviewStudyService.getMySubmission(caseId);
  } catch (err: unknown) {
    if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
      initialSubmission = null;
    } else {
      throw err;
    }
  }
  return { caseData, course, initialSubmission };
}

function formatSubmissionDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isValidDate(d) ? formatDateTime(d) : dateStr;
}

export function ReviewStudyPage() {
  const { t } = useTranslation();
  const { caseId = "" } = useParams();
  const [state, reload] = useLoad(() => loadReviewStudyWorkspace(caseId), [caseId]);

  if (state.status === "loading") {
    return (
      <div
        role="status"
        aria-label={t("g5.common.loading")}
        className="h-[684px] rounded-eb-xl bg-surface motion-safe:animate-pulse"
      />
    );
  }
  if (state.status === "error") {
    return <PlayerError code={state.code} at={state.at} onRetry={reload} />;
  }
  if (state.data.caseData.learningMode !== "REVIEW_STUDY") {
    return <Navigate to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId })} replace />;
  }
  return <Workspace ctx={state.data} />;
}

function AnswerCard({
  id,
  title,
  placeholder,
  value,
  maxLength,
  onChange,
  disabled = false,
  error,
}: {
  id: string;
  title: string;
  placeholder: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="gap-[23px]">
      <CardTitle>
        <label htmlFor={id}>{title}</label>
      </CardTitle>
      <div className="flex flex-col gap-1.5">
        <textarea
          id={id}
          rows={3}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={`${id}-count ${error ? `${id}-error` : ""}`}
          aria-invalid={Boolean(error)}
          className={`min-h-[88px] w-full resize-y rounded-eb-md border px-4 py-3 text-[14px] leading-5 text-ink outline-none transition-colors placeholder:text-ink-muted focus:shadow-eb-focus disabled:bg-surface-muted disabled:text-ink-secondary ${
            error ? "border-danger focus:border-danger" : "border-line-strong bg-surface focus:border-accent"
          }`}
        />
        <div className="flex items-center justify-between">
          {error ? (
            <span id={`${id}-error`} role="alert" className="flex items-center gap-1 text-[12px] leading-4 text-danger">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </span>
          ) : (
            <span />
          )}
          <span id={`${id}-count`} className="text-[12px] leading-4 text-ink-secondary">
            {t("g5.common.charCount", { count: value.length, max: maxLength })}
          </span>
        </div>
      </div>
    </Card>
  );
}

function ReadOnlyAnswerCard({
  title,
  value,
  emptyFallback,
}: {
  title: string;
  value?: string | null;
  emptyFallback?: string;
}) {
  return (
    <Card className="gap-3">
      <CardTitle>{title}</CardTitle>
      <div className="rounded-eb-md bg-surface-muted p-4 text-[14px] leading-6 whitespace-pre-line text-ink">
        {value && value.trim().length > 0 ? value : <span className="text-ink-muted italic">{emptyFallback ?? "—"}</span>}
      </div>
    </Card>
  );
}

function Workspace({
  ctx,
}: {
  ctx: ReviewStudyWorkspaceContext;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseData, course, initialSubmission } = ctx;
  useShellTitle(caseData.title);

  const [submission, setSubmission] = useState<ReviewStudySubmission | null>(initialSubmission);
  const [analysis, setAnalysis] = useState("");
  const [solution, setSolution] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ solution?: string; reasoning?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleSubmit = async () => {
    setApiError(null);
    const errors: { solution?: string; reasoning?: string } = {};

    const trimmedSolution = solution.trim();
    const trimmedReasoning = reasoning.trim();
    const trimmedAnalysis = analysis.trim();

    if (trimmedSolution.length < PROPOSED_SOLUTION_MIN_LENGTH) {
      errors.solution = t("g5.reviewStudy.validation.solutionMin");
    }
    if (trimmedReasoning.length < REASONING_MIN_LENGTH) {
      errors.reasoning = t("g5.reviewStudy.validation.reasoningMin");
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    try {
      const res = await reviewStudyService.submitReviewStudy(caseData.id, {
        studentAnalysis: trimmedAnalysis.length > 0 ? trimmedAnalysis : undefined,
        proposedSolution: trimmedSolution,
        reasoningText: trimmedReasoning,
      });
      setSubmission(res);
      setSuccessBanner(t("g5.reviewStudy.submitSuccess"));
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setApiError(t("g5.reviewStudy.duplicateSubmission"));
        try {
          const existing = await reviewStudyService.getMySubmission(caseData.id);
          if (existing) {
            setSubmission(existing);
            return;
          }
        } catch {
          // Keep showing duplicate error
        }
      } else {
        const msg =
          errorMessage(err) ??
          (isAxiosError(err) && err.response?.status ? `HTTP ${err.response.status}` : undefined);
        setApiError(msg ? t("g5.reviewStudy.submitFailed", { error: msg }) : t("g5.reviewStudy.submitFailedGeneric"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitted = submission !== null;

  return (
    <>
      {successBanner && (
        <div
          role="status"
          className="mb-5 flex items-center gap-3 rounded-eb-xl border border-success/30 bg-success-bg p-4 text-success-text"
        >
          <CheckCircle2 size={20} className="shrink-0 text-success" />
          <p className="text-[14px] leading-5 font-medium">{successBanner}</p>
        </div>
      )}

      {isSubmitted && (
        <div
          role="status"
          className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-eb-xl border border-line-default bg-surface p-5 shadow-eb-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-eb-md bg-success-bg text-success">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] leading-6 font-medium text-ink">
                  {t("g5.reviewStudy.submittedStatus")}
                </span>
                <SubmissionBadge status="submitted">{t("g5.reviewStudy.submittedBadge")}</SubmissionBadge>
              </div>
              <p className="mt-0.5 text-[12px] leading-4 text-ink-secondary">
                {t("g5.reviewStudy.submittedNotice")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] leading-4 text-ink-secondary">
            <Clock size={14} className="text-ink-muted" />
            <span>{t("g5.reviewStudy.submittedAt", { time: formatSubmissionDate(submission.submittedAt) })}</span>
          </div>
        </div>
      )}

      {apiError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-eb-xl border border-danger/30 bg-danger-bg p-4 text-danger-text"
        >
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-danger" />
          <div className="flex-1 text-[14px] leading-5">
            <p className="font-medium">{t("g5.reviewStudy.submitFailedGeneric")}</p>
            <p className="mt-1 text-[12px] opacity-90">{apiError}</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Card className="gap-6">
            <CardTitle>{t("g5.reviewStudy.contextTitle")}</CardTitle>
            <p className="text-[14px] leading-5 whitespace-pre-line text-ink">
              {caseData.contextText ?? caseData.description ?? "—"}
            </p>
            {caseData.problemText && (
              <div className="flex flex-col gap-1.5 rounded-eb-lg bg-selected p-4">
                <span className="text-[12px] leading-4 font-medium text-link">{t("g5.reviewStudy.problem")}</span>
                <p className="text-[14px] leading-5 whitespace-pre-line text-ink">{caseData.problemText}</p>
              </div>
            )}
          </Card>

          {isSubmitted ? (
            <>
              <ReadOnlyAnswerCard
                title={t("g5.reviewStudy.submittedAnalysisTitle")}
                value={submission.studentAnalysis}
                emptyFallback={t("g5.reviewStudy.emptyAnalysis")}
              />
              <ReadOnlyAnswerCard
                title={t("g5.reviewStudy.submittedSolutionTitle")}
                value={submission.proposedSolution}
              />
              <ReadOnlyAnswerCard
                title={t("g5.reviewStudy.submittedReasoningTitle")}
                value={submission.reasoningText}
              />
            </>
          ) : (
            <>
              <AnswerCard
                id="rs-analysis"
                title={t("g5.reviewStudy.analysis")}
                placeholder={t("g5.reviewStudy.analysisPlaceholder")}
                value={analysis}
                maxLength={STUDENT_ANALYSIS_MAX_LENGTH}
                onChange={setAnalysis}
                disabled={isSubmitting}
              />
              <AnswerCard
                id="rs-solution"
                title={t("g5.reviewStudy.solution")}
                placeholder={t("g5.reviewStudy.solutionPlaceholder")}
                value={solution}
                maxLength={PROPOSED_SOLUTION_MAX_LENGTH}
                onChange={setSolution}
                disabled={isSubmitting}
                error={validationErrors.solution}
              />
              <AnswerCard
                id="rs-reasoning"
                title={t("g5.reviewStudy.reasoning")}
                placeholder={t("g5.reviewStudy.reasoningPlaceholder")}
                value={reasoning}
                maxLength={REASONING_MAX_LENGTH}
                onChange={setReasoning}
                disabled={isSubmitting}
                error={validationErrors.reasoning}
              />
            </>
          )}
        </div>

        <div className="flex w-[478px] shrink-0 flex-col gap-5">
          <Card className="gap-[23px]">
            <CardTitle>{t("g5.reviewStudy.infoTitle")}</CardTitle>
            <KeyValueList
              rows={[
                { label: t("g5.reviewStudy.mode"), value: t("g5.common.modeReview") },
                { label: t("g5.common.course"), value: course.name },
                { label: t("g5.reviewStudy.format"), value: t("g5.reviewStudy.formatValue") },
                { label: t("g5.common.grading"), value: t("g5.common.notGraded") },
                ...(isSubmitted
                  ? [
                      {
                        label: t("g5.reviewStudy.status"),
                        value: (
                          <SubmissionBadge status="submitted">
                            {t("g5.reviewStudy.submittedBadge")}
                          </SubmissionBadge>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Card>

          <Card className="gap-[23px]">
            <CardTitle>{t("g5.reviewStudy.requirementsTitle")}</CardTitle>
            <ol className="flex flex-col gap-2">
              {(["solution", "reasoning"] as const).map((key) => (
                <li key={key} className="border-b border-surface-hover py-2 text-[14px] leading-5 text-ink">
                  {t(`g5.reviewStudy.requirement.${key}`)}
                </li>
              ))}
            </ol>
            <p className="text-[12px] leading-4 text-ink-secondary">
              {t("g5.reviewStudy.oneSubmissionNote")}
            </p>
          </Card>
        </div>
      </div>

      <ActionBar
        start={
          <BarButton variant="outline" onClick={() => navigate(PATHS.STUDENT.COURSES)}>
            {t("g5.reviewStudy.back")}
          </BarButton>
        }
        note={isSubmitted ? t("g5.reviewStudy.oneSubmissionNote") : t("g5.reviewStudy.finalNote")}
        end={
          isSubmitted ? (
            <SubmissionBadge status="submitted">{t("g5.reviewStudy.submittedBadge")}</SubmissionBadge>
          ) : (
            <BarButton
              variant="primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? t("g5.reviewStudy.submitting") : t("g5.reviewStudy.submit")}
            </BarButton>
          )
        }
      />
    </>
  );
}
