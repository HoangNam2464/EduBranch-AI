/**
 * CaseRubricPage — Giảng viên · Rubric nghiên cứu chất lượng tình huống (Figma frame 07.8).
 * Routes: /lecturer/cases/:caseId/rubric and /lecturer/rubric.
 *
 * Real data integration with BE-033 (`rubricService`).
 * Zero student grading or score logic — strictly evaluates case artifacts for academic research.
 * Height of rubric cards self-adjusts based on content (AC-2).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  ClipboardList,
  GitBranch,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { BadgeBase, Button, Field, SectionHeading, Toast, ToastRegion, cx } from "@/components/ds";
import { SkeletonLine, SkeletonRegion, StateCard } from "@/components/feedback";
import { caseService } from "@/services/caseService";
import { courseService } from "@/services/courseService";
import { rubricService, calculateAverageScore, toRubricScores } from "@/services/rubricService";
import { useAuthStore } from "@/stores/authStore";
import type { Case, CaseDetail, Course, RubricCriterionItem, RubricEvaluation } from "@/types";
import { PATHS } from "@/routes/paths";

const SCALE = [1, 2, 3, 4, 5];
const NOTE_MAX = 1000;

const DEFAULT_CRITERIA_KEYS = [
  { id: "realism", key: "realism", defaultScore: 5 },
  { id: "difficulty", key: "difficulty", defaultScore: 4 },
  { id: "curriculumFit", key: "curriculumFit", defaultScore: 5 },
] as const;

const MODE_TONE: Record<CaseDetail["learningMode"], string> = {
  BRANCHING_STUDY: "bg-primary-subtle text-primary",
  REVIEW_STUDY: "bg-mode-review-bg text-mode-review-text",
};

function errorCodeOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

export interface RubricViewProps {
  initialCaseId?: string;
  role?: "LECTURER" | "ADMIN";
}

export function RubricView({ initialCaseId, role = "LECTURER" }: RubricViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Active case selection
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(initialCaseId);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [availableCases, setAvailableCases] = useState<Case[]>([]);
  const [loadingCase, setLoadingCase] = useState(Boolean(initialCaseId));
  const [caseError, setCaseError] = useState<{ code?: number; at: Date } | null>(null);

  // Rubric state
  const [criteria, setCriteria] = useState<RubricCriterionItem[]>(() =>
    DEFAULT_CRITERIA_KEYS.map((c) => ({
      id: c.id,
      name: t(`rubric.criteria.${c.key}.name`),
      description: t(`rubric.criteria.${c.key}.description`),
      score: c.defaultScore,
      maxScore: 5,
    })),
  );
  const [note, setNote] = useState("");
  const [savedEvaluations, setSavedEvaluations] = useState<RubricEvaluation[]>([]);
  const [loadingRubrics, setLoadingRubrics] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUserId = useAuthStore((state) => state.user?.id);

  // Sync initial criteria names when language changes
  useEffect(() => {
    setCriteria((prev) =>
      prev.map((item) => {
        const found = DEFAULT_CRITERIA_KEYS.find((k) => k.id === item.id);
        if (found) {
          return {
            ...item,
            name: t(`rubric.criteria.${found.key}.name`),
            description: t(`rubric.criteria.${found.key}.description`),
          };
        }
        return item;
      }),
    );
  }, [t]);

  // Load case detail and related course
  const loadCase = useCallback(
    async (id: string) => {
      setLoadingCase(true);
      setCaseError(null);
      try {
        const c = await caseService.getCaseById(id);
        setCaseData(c);
        if (c.courseId) {
          try {
            const co = await courseService.getCourseById(c.courseId);
            setCourse(co);
          } catch {
            // Course is secondary metadata
            setCourse(null);
          }
        }
      } catch (err) {
        setCaseError({ code: errorCodeOf(err), at: new Date() });
      } finally {
        setLoadingCase(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (selectedCaseId) {
      void loadCase(selectedCaseId);
    }
  }, [selectedCaseId, loadCase]);

  // Load saved evaluations
  const loadEvaluations = useCallback(async (caseIdFilter?: string) => {
    setLoadingRubrics(true);
    setApiError(null);
    try {
      const list = await rubricService.getRubrics(caseIdFilter ? { caseId: caseIdFilter } : undefined);
      setSavedEvaluations(list);
    } catch (err: unknown) {
      const status = errorCodeOf(err);
      // 404: the selected case no longer exists, so there is nothing to list.
      if (status === 404) {
        setSavedEvaluations([]);
      } else {
        setApiError(t("rubric.scoring.loadError"));
      }
    } finally {
      setLoadingRubrics(false);
    }
  }, [t]);

  useEffect(() => {
    void loadEvaluations(selectedCaseId);
  }, [selectedCaseId, loadEvaluations]);

  // If no case is selected, fetch available courses/cases to populate picker
  useEffect(() => {
    if (!initialCaseId) {
      courseService
        .getMyCourses()
        .then(async (courses: Course[]) => {
          if (courses.length > 0) {
            const first = courses[0];
            const cases = await caseService.getCasesByCourse(first.id);
            setAvailableCases(cases);
            if (cases.length > 0 && !selectedCaseId) {
              setSelectedCaseId(cases[0].id);
            }
          }
        })
        .catch(() => {
          // Keep picker empty on error
        });
    }
  }, [initialCaseId, selectedCaseId]);

  // Current average score
  const currentAverage = useMemo(() => calculateAverageScore(criteria), [criteria]);

  // Criterion score selection
  const handleScoreChange = (index: number, score: number) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, score } : c)),
    );
  };

  // Save or update evaluation
  const handleSubmit = async () => {
    if (!selectedCaseId && !caseData?.id) {
      setApiError(t("rubric.case.noneDescription"));
      return;
    }
    const targetCaseId = selectedCaseId || caseData?.id || "";

    setSaving(true);
    setApiError(null);
    try {
      const scores = toRubricScores(criteria);
      if (editingId) {
        const updated = await rubricService.updateRubric(editingId, { ...scores, notes: note.trim() });
        setSavedEvaluations((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        setToastMessage(t("rubric.scoring.updateSuccess"));
        setEditingId(null);
      } else {
        const created = await rubricService.createRubric({
          caseId: targetCaseId,
          ...scores,
          notes: note.trim() || undefined,
        });
        setSavedEvaluations((prev) => [created, ...prev]);
        setToastMessage(t("rubric.scoring.saveSuccess"));
      }
      setNote("");
    } catch (err: unknown) {
      // Nothing is shown as saved unless the API confirmed it (no local fallback).
      setApiError(
        errorCodeOf(err) === 409 ? t("rubric.scoring.duplicateError") : t("rubric.scoring.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  // Start editing a saved evaluation
  const handleEdit = (evaluation: RubricEvaluation) => {
    setEditingId(evaluation.id);
    if (evaluation.criteria && evaluation.criteria.length > 0) {
      setCriteria(
        evaluation.criteria.map((c) => ({
          ...c,
          name: t(`rubric.criteria.${c.id}.name`),
          description: t(`rubric.criteria.${c.id}.description`),
          maxScore: c.maxScore ?? 5,
        })),
      );
    }
    setNote(evaluation.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setNote("");
    setCriteria(
      DEFAULT_CRITERIA_KEYS.map((c) => ({
        id: c.id,
        name: t(`rubric.criteria.${c.key}.name`),
        description: t(`rubric.criteria.${c.key}.description`),
        score: c.defaultScore,
        maxScore: 5,
      })),
    );
  };

  // Delete a saved evaluation
  const handleDelete = async (id: string) => {
    if (!window.confirm(t("rubric.scoring.deleteConfirm"))) return;
    try {
      await rubricService.deleteRubric(id);
    } catch {
      setApiError(t("rubric.scoring.deleteError"));
      return;
    }
    setSavedEvaluations((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      handleCancelEdit();
    }
    setToastMessage(t("rubric.scoring.deleteSuccess"));
  };

  const backLink = role === "ADMIN" ? PATHS.ADMIN.CASES : PATHS.LECTURER.CASES;
  const courseLabel = course ? [course.courseCode, course.name].filter(Boolean).join(" - ") : "";

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Toast Region */}
      {toastMessage && (
        <ToastRegion>
          <Toast
            type="success"
            title={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        </ToastRegion>
      )}

      {/* Breadcrumb / Top Navigation */}
      <div className="flex items-center gap-2 text-[14px] leading-5 text-ink-secondary">
        <button
          type="button"
          onClick={() => navigate(backLink)}
          className="flex items-center gap-1 hover:text-primary transition-colors"
          aria-label={t("caseReview.bar.back")}
        >
          <ArrowLeft size={16} />
          <span>Case Study</span>
        </button>
        <ChevronRight size={14} className="text-ink-muted" />
        <span className="font-medium text-ink">{t("rubric.case.crumb", "Rubric nghiên cứu")}</span>
      </div>

      {/* Case Header Card (Figma 07.8 / 10.8) */}
      <section
        aria-label={t("rubric.case.regionLabel")}
        className="flex flex-wrap items-center justify-between gap-6 rounded-eb-xl bg-surface p-5 shadow-eb-card"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-eb-lg bg-primary-subtle text-primary">
            <GitBranch size={24} strokeWidth={1.7} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {loadingCase ? (
              <SkeletonRegion label={t("rubric.case.loading")} className="flex flex-col gap-2">
                <SkeletonLine width="60%" />
                <SkeletonLine width={200} size="sm" />
              </SkeletonRegion>
            ) : caseError ? (
              <div className="flex items-center gap-2 text-error text-[14px]">
                <AlertCircle size={16} />
                <span>{t("rubric.case.errorTitle")}</span>
              </div>
            ) : caseData ? (
              <>
                <h2 className="truncate text-[16px] leading-6 font-medium text-ink" title={caseData.title}>
                  {caseData.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <BadgeBase toneClassName={MODE_TONE[caseData.learningMode]}>
                    {t(`rubric.case.mode.${caseData.learningMode}`)}
                  </BadgeBase>
                  {courseLabel && (
                    <span className="text-[12px] leading-4 text-ink-secondary">{courseLabel}</span>
                  )}
                </div>
              </>
            ) : availableCases.length > 0 ? (
              <div className="flex flex-col gap-1">
                <label htmlFor="case-select" className="text-[12px] font-medium text-ink-secondary">
                  {t("rubric.case.regionLabel")}
                </label>
                <select
                  id="case-select"
                  value={selectedCaseId || ""}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="rounded-eb-md border border-line bg-canvas px-3 py-1.5 text-[14px] text-ink focus:border-primary focus:outline-none"
                >
                  {availableCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <h2 className="text-[16px] leading-6 font-medium text-ink">{t("rubric.case.noneTitle")}</h2>
                <p className="text-[12px] leading-4 text-ink-secondary">{t("rubric.case.noneDescription")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div aria-hidden="true" className="hidden h-14 w-px bg-line sm:block" />

        {/* Average Score Box */}
        <div className="flex shrink-0 flex-col gap-0.5 sm:min-w-[140px] sm:items-end">
          <span className="text-[12px] leading-4 text-ink-secondary">{t("rubric.average.label")}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] leading-8 font-semibold text-ink">
              {currentAverage.toFixed(1)}
            </span>
            <span className="text-[16px] leading-6 text-ink-muted">/ 5</span>
          </div>
          <span className="text-[12px] leading-4 text-ink-muted">
            {t("rubric.average.fromCount", { count: criteria.length })}
          </span>
        </div>
      </section>

      {/* Main Content Layout (777px Scoring Form + 379px Saved List) */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left Column: Scoring Form */}
        <section
          aria-labelledby="rubric-scoring-title"
          className="flex min-w-0 flex-1 flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card"
        >
          <div className="flex flex-col gap-1">
            <SectionHeading id="rubric-scoring-title" title={t("rubric.scoring.title")} />
            <p className="text-[14px] leading-5 text-ink-secondary">{t("rubric.scoring.description")}</p>
          </div>

          {/* API Error Notification */}
          {apiError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-eb-md border border-error-border bg-error-bg p-3 text-[14px] text-error-text"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0 text-error" />
                <span>{apiError}</span>
              </div>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-error-text hover:opacity-80"
                aria-label={t("caseReview.toast.close")}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Criteria List */}
          <div className="flex flex-col gap-3">
            {criteria.map((item, index) => (
              <div
                key={item.id || item.name}
                className="flex flex-col gap-3 rounded-eb-lg bg-canvas p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                {/* Score tile on the left */}
                <div className="flex size-14 shrink-0 items-center justify-center rounded-eb-lg bg-selected">
                  <span className="text-[18px] leading-6 font-bold text-link">
                    {item.score}/5
                  </span>
                </div>

                {/* Criterion title & description */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[15px] leading-5 font-medium text-ink">
                      {index + 1}. {item.name}
                    </h3>
                  </div>
                  {item.description && (
                    <p className="text-[13px] leading-4 text-ink-secondary">{item.description}</p>
                  )}
                </div>

                {/* 1-5 Radio Scale */}
                <div
                  role="radiogroup"
                  aria-label={item.name}
                  className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto"
                >
                  {SCALE.map((val) => {
                    const isSelected = item.score === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleScoreChange(index, val)}
                        className={cx(
                          "flex size-8 items-center justify-center rounded-eb-md text-[14px] leading-5 font-medium transition-all duration-150",
                          isSelected
                            ? "bg-primary text-white font-semibold shadow-sm"
                            : "bg-surface text-ink-secondary hover:bg-surface-hover border border-line",
                        )}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Notes textarea */}
          <Field
            multiline
            label={t("rubric.note.label")}
            placeholder={t("rubric.note.placeholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            helper={t("rubric.note.counter", { count: note.length, max: NOTE_MAX })}
            maxLength={NOTE_MAX}
          />

          {/* Submission action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {editingId && (
              <Button variant="secondary" onClick={handleCancelEdit} disabled={saving}>
                {t("rubric.scoring.cancelEdit", "Hủy chỉnh sửa")}
              </Button>
            )}
            <Button
              variant="primary"
              leadingIcon={editingId ? Check : Save}
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving
                ? t("rubric.scoring.saving")
                : editingId
                ? t("rubric.scoring.update")
                : t("rubric.scoring.save")}
            </Button>
          </div>
        </section>

        {/* Right Column: Saved Evaluations (Figma 07.8 / 10.8) */}
        <section
          aria-labelledby="rubric-saved-title"
          className="flex w-full shrink-0 flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card lg:w-[379px]"
        >
          <SectionHeading
            id="rubric-saved-title"
            title={
              savedEvaluations.length > 0
                ? t("rubric.saved.titleWithCount", { count: savedEvaluations.length })
                : t("rubric.saved.title")
            }
          />

          {loadingRubrics ? (
            <SkeletonRegion label={t("states.loading.label")} className="flex flex-col gap-3">
              <SkeletonLine width="100%" />
              <SkeletonLine width="80%" />
              <SkeletonLine width="60%" />
            </SkeletonRegion>
          ) : savedEvaluations.length === 0 ? (
            <StateCard
              tone="empty"
              icon={ClipboardList}
              titleAs="h3"
              title={t("rubric.saved.emptyTitle")}
              description={t("rubric.saved.emptyDescription")}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {savedEvaluations.map((evalItem, idx) => (
                <div
                  key={evalItem.id}
                  className={cx(
                    "flex h-auto flex-col gap-3 rounded-eb-lg bg-canvas p-4 transition-all duration-150 border",
                    editingId === evalItem.id
                      ? "border-primary bg-selected/20 shadow-sm"
                      : "border-transparent hover:border-line hover:bg-surface-hover",
                  )}
                >
                  {/* Card Header: Case Title or Identifier + Action Buttons */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="truncate text-[14px] leading-5 font-semibold text-ink" title={evalItem.caseTitle}>
                      {evalItem.caseTitle || t("rubric.saved.fallbackTitle", { index: idx + 1 })}
                    </h4>
                    {evalItem.evaluatorId === currentUserId && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(evalItem)}
                        className="rounded p-1 text-ink-secondary hover:bg-surface hover:text-primary transition-colors"
                        title={t("rubric.saved.edit")}
                        aria-label={`${t("rubric.saved.edit")} ${evalItem.caseTitle || ""}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(evalItem.id)}
                        className="rounded p-1 text-ink-secondary hover:bg-surface hover:text-error transition-colors"
                        title={t("rubric.saved.delete")}
                        aria-label={`${t("rubric.saved.delete")} ${evalItem.caseTitle || ""}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    )}
                  </div>

                  {/* Criteria Score Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {evalItem.criteria.map((c) => (
                      <span
                        key={c.id}
                        className="rounded-eb-md bg-primary-subtle px-2 py-0.5 text-[12px] font-medium text-primary"
                      >
                        {t(`rubric.criteria.${c.id}.name`)} {c.score}/5
                      </span>
                    ))}
                  </div>

                  {/* Note block */}
                  {evalItem.notes && (
                    <div className="flex flex-col gap-0.5 pt-1 border-t border-line/60">
                      <span className="text-[12px] font-medium text-ink-secondary">
                        {t("rubric.saved.noteLabel")}
                      </span>
                      <p className="text-[13px] leading-5 text-ink break-words">
                        {evalItem.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function CaseRubricPage() {
  const { caseId } = useParams<{ caseId?: string }>();
  return <RubricView initialCaseId={caseId} role="LECTURER" />;
}
