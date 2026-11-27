/**
 * RubricWorkspace — Shared view for case-quality rubric (Figma 07.8 lecturer & 10.8 admin).
 *
 * Rules & PO decisions:
 *  - D3a: without a caseId, render no scoring form; show guidance linking to the cases list + full-width saved list.
 *  - D3b: saved list always loads GET /evaluation/rubrics (without caseId); edit/delete only on own evaluations;
 *         editing an evaluation for another case navigates to that case's rubric route.
 *  - D3d: criteria start unselected; average shows "—" and submit stays disabled until all 3 criteria are scored;
 *         if the current user already has an evaluation for the open case, open the form in edit mode with saved values.
 *  - Rates the case artefact for academic research only; never displays or computes student grades or ranks.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { AlertCircle, ClipboardList, FileCheck2, GitBranch, Pencil, Save, Trash2, X } from "lucide-react";
import {
  Button,
  Dialog,
  Field,
  LearningModeBadge,
  SectionHeading,
  Toast,
  ToastRegion,
  cx,
  FOCUS_RING,
  type ToastType,
} from "@/components/ds";
import { ErrorState, SkeletonBlock, SkeletonLine, SkeletonRegion, StateCard } from "@/components/feedback";
import { caseService } from "@/services/caseService";
import { courseService } from "@/services/courseService";
import {
  RUBRIC_CRITERIA,
  calculateAverageScore,
  canModifyRubricEvaluation,
  isRubricFormComplete,
  rubricService,
  toRubricScores,
} from "@/services/rubricService";
import type { RubricCriterionId, RubricDraftScores } from "@/services/mappers/rubric";
import { useAuthStore } from "@/stores/authStore";
import { useShellHeader } from "@/layouts/shell/ShellTitleContext";
import { rubricBackPath, rubricCasePath, rubricCasesPath } from "@/pages/rubric/rubricNavigation";
import type { CaseDetail, Course, RubricEvaluation } from "@/types";

const SCALE = [1, 2, 3, 4, 5] as const;
const NOTE_MAX = 1000;

export interface RubricWorkspaceProps {
  role: "LECTURER" | "ADMIN";
  caseId?: string;
}

function errorCodeOf(error: unknown): number | undefined {
  if (isAxiosError(error)) return error.response?.status;
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) && !error.response;
}

function scoresFromEvaluation(ev: RubricEvaluation): RubricDraftScores {
  const next: RubricDraftScores = {};
  for (const c of RUBRIC_CRITERIA) {
    const found = ev.criteria.find((item) => item.id === c.id);
    if (found && Number.isInteger(found.score) && found.score >= 1 && found.score <= 5) {
      next[c.id] = found.score;
    }
  }
  return next;
}

export function RubricWorkspace({ role, caseId }: RubricWorkspaceProps) {
  return <RubricWorkspaceContent key={`${role}:${caseId ?? ""}`} role={role} caseId={caseId} />;
}

function RubricWorkspaceContent({ role, caseId }: RubricWorkspaceProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const casesPath = rubricCasesPath(role);

  // Case header state (when caseId is present)
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCase, setLoadingCase] = useState(Boolean(caseId));
  const [caseError, setCaseError] = useState<{ code?: number; at: Date } | null>(null);
  const [caseReloadTick, setCaseReloadTick] = useState(0);

  // Figma 10.8 header: back button + "Case Study › Rubric nghiên cứu" when a case is open.
  // Without a case (sidebar entry, D3a) the screen is a top-level page: no back, no breadcrumb.
  useShellHeader(
    caseId
      ? {
          back: { to: rubricBackPath(role, caseId, caseError?.code), label: t("shell.back") },
          crumbs: [
            { label: t(role === "ADMIN" ? "nav.admin.cases" : "nav.lecturer.cases"), to: casesPath },
            { label: t("rubric.breadcrumb.current") },
          ],
        }
      : null,
  );

  // Saved evaluations list state (always all visible evaluations via GET /evaluation/rubrics)
  const [savedEvaluations, setSavedEvaluations] = useState<RubricEvaluation[]>([]);
  const [loadingRubrics, setLoadingRubrics] = useState(true);
  const [rubricsError, setRubricsError] = useState<{ code?: number; at: Date } | null>(null);
  const [rubricsReloadTick, setRubricsReloadTick] = useState(0);

  // Scoring form state (D3d: starts unselected)
  const [scores, setScores] = useState<RubricDraftScores>({});
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<RubricEvaluation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ type: ToastType; title: string } | null>(null);

  // Prevents overwriting user edits or re-entering edit mode after explicit cancel
  const userInteractedRef = useRef(false);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Load case + optional course metadata when a caseId is open
  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    caseService
      .getCaseById(caseId)
      .then((c) => {
        if (cancelled) return;
        setCaseData(c);
        if (c.courseId) {
          courseService
            .getCourseById(c.courseId)
            .then((co) => {
              if (!cancelled) setCourse(co);
            })
            .catch(() => {
              if (!cancelled) setCourse(null);
            });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCaseData(null);
          setCaseError({ code: errorCodeOf(error), at: new Date() });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCase(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId, caseReloadTick]);

  const retryCase = () => {
    setLoadingCase(true);
    setCaseError(null);
    setCaseReloadTick((k) => k + 1);
  };

  // Load all saved evaluations the user can see (D3b: without caseId)
  // D3d: if the user already has their own evaluation for the open case, open in edit mode
  useEffect(() => {
    let cancelled = false;
    rubricService
      .getRubrics()
      .then((list) => {
        if (cancelled) return;
        setSavedEvaluations(list);
        if (caseId && !userInteractedRef.current) {
          const activeUserId = useAuthStore.getState().user?.id;
          const own = list.find(
            (ev) => ev.caseId === caseId && canModifyRubricEvaluation(ev, activeUserId),
          );
          if (own) {
            setEditingId(own.id);
            setScores(scoresFromEvaluation(own));
            setNote(own.notes ?? "");
          }
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setRubricsError({ code: errorCodeOf(error), at: new Date() });
      })
      .finally(() => {
        if (!cancelled) setLoadingRubrics(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId, rubricsReloadTick]);

  const retryRubrics = () => {
    setLoadingRubrics(true);
    setRubricsError(null);
    setRubricsReloadTick((k) => k + 1);
  };

  const refreshEvaluations = useCallback(async (): Promise<RubricEvaluation[]> => {
    setLoadingRubrics(true);
    setRubricsError(null);
    try {
      const list = await rubricService.getRubrics();
      setSavedEvaluations(list);
      return list;
    } catch (error: unknown) {
      setRubricsError({ code: errorCodeOf(error), at: new Date() });
      return [];
    } finally {
      setLoadingRubrics(false);
    }
  }, []);

  const formComplete = useMemo(() => isRubricFormComplete(scores), [scores]);
  const draftAverage = useMemo(() => {
    if (!formComplete) return null;
    return calculateAverageScore(
      RUBRIC_CRITERIA.map((c) => ({ score: scores[c.id]! })),
    );
  }, [formComplete, scores]);

  const handleScoreChange = (criterionId: RubricCriterionId, value: number) => {
    userInteractedRef.current = true;
    setSubmitError(null);
    setScores((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleNoteChange = (value: string) => {
    userInteractedRef.current = true;
    setSubmitError(null);
    setNote(value);
  };

  const handleCancelEdit = () => {
    userInteractedRef.current = true;
    setEditingId(null);
    setScores({});
    setNote("");
    setSubmitError(null);
  };

  const handleStartEdit = (ev: RubricEvaluation) => {
    if (ev.caseId !== caseId) {
      navigate(rubricCasePath(role, ev.caseId));
      return;
    }
    userInteractedRef.current = true;
    setEditingId(ev.id);
    setScores(scoresFromEvaluation(ev));
    setNote(ev.notes ?? "");
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!caseId || !caseData || !formComplete) return;

    setSaving(true);
    setSubmitError(null);
    try {
      const payloadScores = toRubricScores(
        RUBRIC_CRITERIA.map((c) => ({ id: c.id, score: scores[c.id] })),
      );
      const trimmedNote = note.trim();

      if (editingId) {
        const updated = await rubricService.updateRubric(editingId, {
          ...payloadScores,
          notes: trimmedNote,
        });
        setSavedEvaluations((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );
        setNote(updated.notes ?? "");
        setScores(scoresFromEvaluation(updated));
        setToast({ type: "success", title: t("rubric.scoring.updateSuccess") });
      } else {
        const created = await rubricService.createRubric({
          caseId,
          ...payloadScores,
          notes: trimmedNote || undefined,
        });
        setSavedEvaluations((prev) => [created, ...prev]);
        setEditingId(created.id);
        setNote(created.notes ?? "");
        setScores(scoresFromEvaluation(created));
        setToast({ type: "success", title: t("rubric.scoring.saveSuccess") });
      }
    } catch (error: unknown) {
      const status = errorCodeOf(error);
      if (status === 409) {
        setSubmitError(t("rubric.scoring.duplicateError"));
        const freshList = await refreshEvaluations();
        const own = freshList.find(
          (ev) => ev.caseId === caseId && canModifyRubricEvaluation(ev, currentUserId),
        );
        if (own) {
          userInteractedRef.current = true;
          setEditingId(own.id);
          setScores(scoresFromEvaluation(own));
          setNote(own.notes ?? "");
        }
      } else if (status === 403) {
        setSubmitError(t("rubric.scoring.forbiddenError"));
      } else if (status === 400) {
        setSubmitError(t("rubric.scoring.validationError"));
      } else if (isNetworkError(error)) {
        setSubmitError(t("rubric.scoring.networkError"));
      } else {
        setSubmitError(t("rubric.scoring.saveError"));
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setDeleting(true);
    setDeleteError(null);
    try {
      await rubricService.deleteRubric(targetId);
      setSavedEvaluations((prev) => prev.filter((item) => item.id !== targetId));
      if (editingId === targetId) {
        userInteractedRef.current = true;
        setEditingId(null);
        setScores({});
        setNote("");
        setSubmitError(null);
      }
      setDeleteTarget(null);
      setToast({ type: "success", title: t("rubric.scoring.deleteSuccess") });
    } catch {
      setDeleteError(t("rubric.deleteDialog.error"));
    } finally {
      setDeleting(false);
    }
  };

  const courseLabel = course ? [course.courseCode, course.name].filter(Boolean).join(" · ") : "";
  const canShowScoringForm = Boolean(caseId && !loadingCase && !caseError && caseData);

  return (
    <div className="flex flex-col gap-5 pb-4">
      {toast && (
        <ToastRegion>
          <Toast
            type={toast.type}
            title={toast.title}
            closeLabel={t("caseReview.toast.close")}
            onClose={() => setToast(null)}
          />
        </ToastRegion>
      )}

      {/* Top Case Header / Guidance Card */}
      {!caseId ? (
        <section
          aria-label={t("rubric.case.regionLabel")}
          className="flex flex-wrap items-center justify-between gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-eb-lg bg-primary-subtle text-primary">
              <ClipboardList aria-hidden="true" size={24} absoluteStrokeWidth strokeWidth={1.7} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="text-[16px] leading-6 font-medium tracking-normal text-ink">
                {t("rubric.case.noneTitle")}
              </h2>
              <p className="text-[14px] leading-5 text-ink-secondary">
                {t(role === "ADMIN" ? "rubric.case.noneDescriptionAdmin" : "rubric.case.noneDescriptionLecturer")}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" to={casesPath} className="shrink-0 whitespace-nowrap">
            {t("rubric.case.goToCases")}
          </Button>
        </section>
      ) : loadingCase ? (
        <section
          aria-label={t("rubric.case.regionLabel")}
          className="flex flex-wrap items-center justify-between gap-6 rounded-eb-xl bg-surface p-5 shadow-eb-card"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <SkeletonBlock width={48} height={48} className="rounded-eb-lg bg-selected" />
            <SkeletonRegion label={t("rubric.case.loading")} className="flex min-w-0 flex-1 flex-col gap-2">
              <SkeletonLine width="60%" />
              <SkeletonLine width={220} size="sm" />
            </SkeletonRegion>
          </div>
          <div aria-hidden="true" className="hidden h-14 w-px shrink-0 bg-line sm:block" />
          <div className="flex shrink-0 flex-col gap-1.5 sm:min-w-[140px] sm:items-end">
            <SkeletonLine width={96} size="sm" />
            <SkeletonLine width={72} />
          </div>
        </section>
      ) : caseError || !caseData ? (
        <section
          aria-label={t("rubric.case.regionLabel")}
          className="flex flex-col items-center gap-4 rounded-eb-xl bg-surface p-6 shadow-eb-card"
        >
          <ErrorState
            framed={false}
            title={
              caseError?.code === 404
                ? t("rubric.case.notFoundTitle")
                : caseError?.code === 403
                  ? t("rubric.case.forbiddenTitle")
                  : t("rubric.case.errorTitle")
            }
            description={
              caseError?.code === 404
                ? t("rubric.case.notFoundDescription")
                : caseError?.code === 403
                  ? t("rubric.case.forbiddenDescription")
                  : t("rubric.case.errorDescription")
            }
            onRetry={caseError?.code === 404 || caseError?.code === 403 ? undefined : retryCase}
            errorCode={caseError?.code}
            occurredAt={caseError?.at}
          />
          {(caseError?.code === 404 || caseError?.code === 403) && (
            <Button variant="secondary" size="sm" to={casesPath} className="whitespace-nowrap">
              {t("rubric.case.goToCases")}
            </Button>
          )}
        </section>
      ) : (
        <section
          aria-label={t("rubric.case.regionLabel")}
          className="flex flex-wrap items-center justify-between gap-6 rounded-eb-xl bg-surface p-5 shadow-eb-card"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-eb-lg bg-primary-subtle text-primary">
              {caseData.learningMode === "REVIEW_STUDY" ? (
                <FileCheck2 aria-hidden="true" size={24} absoluteStrokeWidth strokeWidth={1.7} />
              ) : (
                <GitBranch aria-hidden="true" size={24} absoluteStrokeWidth strokeWidth={1.7} />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <h2 className="text-[16px] leading-6 font-medium tracking-normal text-ink break-words">
                {caseData.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <LearningModeBadge mode={caseData.learningMode === "REVIEW_STUDY" ? "review" : "branching"}>
                  {t(`rubric.case.mode.${caseData.learningMode}`)}
                </LearningModeBadge>
                {courseLabel && (
                  <span className="text-[12px] leading-4 text-ink-secondary">{courseLabel}</span>
                )}
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="hidden h-14 w-px shrink-0 bg-line sm:block" />

          <div className="flex shrink-0 flex-col gap-0.5 sm:min-w-[140px] sm:items-end">
            <span className="whitespace-nowrap text-[12px] leading-4 text-ink-secondary">
              {t("rubric.average.label")}
            </span>
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-[22px] leading-7 font-medium tabular-nums text-ink">
                {draftAverage !== null ? draftAverage.toFixed(1) : "—"}
              </span>
              <span className="text-[14px] leading-5 text-ink-muted">/ 5</span>
            </div>
            <span className="whitespace-nowrap text-[12px] leading-4 text-ink-secondary">
              {draftAverage !== null
                ? t("rubric.average.fromCount", { count: RUBRIC_CRITERIA.length })
                : t("rubric.average.unavailable")}
            </span>
          </div>
        </section>
      )}

      {/* Main Content Area: Scoring Form (left) + Saved Evaluations (right or full-width when no case is open) */}
      <div className={cx("flex flex-col gap-5", caseId && "xl:flex-row xl:items-start")}>
        {caseId && loadingCase && (
          <section
            aria-label={t("rubric.scoring.title")}
            className="flex min-w-0 flex-1 flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card"
          >
            <SkeletonRegion label={t("rubric.case.loading")} className="flex flex-col gap-4">
              <SkeletonLine width={240} />
              <SkeletonLine width="75%" size="sm" />
              <SkeletonBlock height={88} className="w-full rounded-eb-lg bg-canvas" />
              <SkeletonBlock height={88} className="w-full rounded-eb-lg bg-canvas" />
              <SkeletonBlock height={88} className="w-full rounded-eb-lg bg-canvas" />
            </SkeletonRegion>
          </section>
        )}

        {canShowScoringForm && (
          <section
            aria-labelledby="rubric-scoring-title"
            className="flex min-w-0 flex-1 flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card"
          >
            <div className="flex flex-col gap-1">
              <SectionHeading id="rubric-scoring-title" title={t("rubric.scoring.title")} />
              <p className="text-[14px] leading-5 text-ink-secondary">{t("rubric.scoring.description")}</p>
            </div>

            {submitError && (
              <div
                role="alert"
                className="flex items-start justify-between gap-3 rounded-eb-md border border-error-border bg-error-bg px-3.5 py-2.5 text-[14px] leading-5 text-error-text"
              >
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <AlertCircle aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.5} className="mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  aria-label={t("rubric.scoring.closeAlert")}
                  className={cx("flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-eb-sm text-error-text hover:opacity-80", FOCUS_RING)}
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {RUBRIC_CRITERIA.map((criterion, index) => (
                <CriterionRow
                  key={criterion.id}
                  index={index}
                  criterionId={criterion.id}
                  score={scores[criterion.id] ?? null}
                  disabled={saving}
                  onChange={(value) => handleScoreChange(criterion.id, value)}
                />
              ))}
            </div>

            <Field
              multiline
              label={t("rubric.note.label")}
              placeholder={t("rubric.note.placeholder")}
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              helper={t("rubric.note.counter", { count: note.length, max: NOTE_MAX })}
              maxLength={NOTE_MAX}
              disabled={saving}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="min-w-0 flex-1 text-[12px] leading-4 text-ink-secondary">
                {!formComplete ? t("rubric.scoring.incompleteHint") : ""}
              </p>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {editingId && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="whitespace-nowrap shrink-0"
                  >
                    {t("rubric.scoring.cancelEdit")}
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="md"
                  leadingIcon={Save}
                  iconStrokeWidth={1.5}
                  onClick={() => void handleSubmit()}
                  disabled={!formComplete || saving}
                  className="whitespace-nowrap shrink-0"
                >
                  {saving
                    ? t("rubric.scoring.saving")
                    : editingId
                      ? t("rubric.scoring.update")
                      : t("rubric.scoring.save")}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Saved Evaluations Card: right column (379px) when a case is open, full width when no case is open */}
        <section
          aria-labelledby="rubric-saved-title"
          className={cx(
            "flex flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card",
            caseId ? "w-full shrink-0 xl:w-[379px]" : "w-full",
          )}
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
            <SkeletonRegion label={t("rubric.saved.loading")} className="flex flex-col gap-3">
              {Array.from({ length: 2 }, (_, idx) => (
                <div key={idx} className="flex flex-col gap-3 rounded-eb-lg bg-canvas p-4">
                  <SkeletonLine width="75%" />
                  <SkeletonLine width="45%" size="sm" />
                  <div className="flex flex-wrap gap-2">
                    <SkeletonLine width={88} size="sm" />
                    <SkeletonLine width={72} size="sm" />
                    <SkeletonLine width={96} size="sm" />
                  </div>
                </div>
              ))}
            </SkeletonRegion>
          ) : rubricsError ? (
            <ErrorState
              framed={false}
              title={rubricsError.code === 403 ? t("states.forbidden.title") : t("rubric.saved.errorTitle")}
              description={rubricsError.code === 403 ? t("states.forbidden.description") : t("rubric.saved.errorDescription")}
              onRetry={retryRubrics}
              errorCode={rubricsError.code}
              occurredAt={rubricsError.at}
            />
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
              {savedEvaluations.map((evalItem, idx) => {
                const isOwn = canModifyRubricEvaluation(evalItem, currentUserId);
                const isEditing = editingId === evalItem.id;
                const displayTitle = evalItem.caseTitle || t("rubric.saved.fallbackTitle", { index: idx + 1 });
                return (
                  <article
                    key={evalItem.id}
                    className={cx(
                      "flex flex-col gap-3 rounded-eb-lg border p-4 transition-colors duration-150",
                      isEditing
                        ? "border-primary bg-selected/30"
                        : "border-transparent bg-canvas hover:border-line hover:bg-surface-hover",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 className="text-[14px] leading-5 font-medium text-ink break-words">
                          {displayTitle}
                        </h3>
                        {evalItem.evaluatorName && (
                          <p className="text-[12px] leading-4 text-ink-secondary">
                            {t("rubric.saved.evaluator", { name: evalItem.evaluatorName })}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-selected px-2 py-0.5 text-[12px] leading-4 font-medium tabular-nums text-link">
                          {t("rubric.saved.averageBadge", { score: evalItem.averageScore.toFixed(1) })}
                        </span>
                        {isOwn && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(evalItem)}
                              aria-label={t("rubric.saved.editAria", { title: displayTitle })}
                              title={t("rubric.saved.edit")}
                              className={cx(
                                "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary transition-colors hover:bg-surface hover:text-primary",
                                FOCUS_RING,
                              )}
                            >
                              <Pencil aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.7} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null);
                                setDeleteTarget(evalItem);
                              }}
                              aria-label={t("rubric.saved.deleteAria", { title: displayTitle })}
                              title={t("rubric.saved.delete")}
                              className={cx(
                                "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary transition-colors hover:bg-surface hover:text-error-text",
                                FOCUS_RING,
                              )}
                            >
                              <Trash2 aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.7} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {evalItem.criteria.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex shrink-0 items-center whitespace-nowrap rounded-eb-sm bg-primary-subtle px-2 py-0.5 text-[12px] leading-4 font-medium tabular-nums text-primary"
                        >
                          {t(`rubric.criteria.${c.id}.name`)} {c.score}/5
                        </span>
                      ))}
                    </div>

                    {evalItem.notes && (
                      <div className="flex flex-col gap-0.5 border-t border-line/60 pt-2">
                        <span className="text-[12px] leading-4 font-medium text-ink-secondary">
                          {t("rubric.saved.noteLabel")}
                        </span>
                        <p className="text-[14px] leading-5 text-ink break-words">{evalItem.notes}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Dialog (DS Dialog, never window.confirm) */}
      <Dialog
        open={Boolean(deleteTarget)}
        type="destructive"
        title={t("rubric.deleteDialog.title")}
        description={t("rubric.deleteDialog.description", {
          title: deleteTarget?.caseTitle || t("rubric.deleteDialog.fallbackCase"),
        })}
        cancelLabel={t("rubric.deleteDialog.cancel")}
        confirmLabel={deleting ? t("rubric.deleteDialog.deleting") : t("rubric.deleteDialog.confirm")}
        confirmDisabled={deleting}
        closeOnScrim={!deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void confirmDelete()}
      >
        {deleteError && (
          <div
            role="alert"
            className="mt-2 rounded-eb-md border border-error-border bg-error-bg px-3 py-2 text-[12px] leading-4 text-error-text"
          >
            {deleteError}
          </div>
        )}
      </Dialog>
    </div>
  );
}

interface CriterionRowProps {
  index: number;
  criterionId: RubricCriterionId;
  score: number | null;
  disabled: boolean;
  onChange: (value: number) => void;
}

function CriterionRow({ index, criterionId, score, disabled, onChange }: CriterionRowProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const criterionName = t(`rubric.criteria.${criterionId}.name`);

  const handleKeyDown = (value: number, e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    let nextValue: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextValue = (value % 5) + 1;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextValue = ((value + 3) % 5) + 1;
    } else if (e.key === "Home") {
      nextValue = 1;
    } else if (e.key === "End") {
      nextValue = 5;
    }
    if (nextValue !== null) {
      e.preventDefault();
      onChange(nextValue);
      btnRefs.current[nextValue - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-eb-lg bg-canvas p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-eb-lg bg-selected sm:size-16">
        <span className="whitespace-nowrap text-[18px] leading-6 font-medium tabular-nums text-link sm:text-[20px] sm:leading-7">
          {score !== null ? `${score}/5` : "—/5"}
          {score === null && <span className="sr-only">{t("rubric.scoring.noScore")}</span>}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 id={titleId} className="text-[16px] leading-6 font-medium tracking-normal text-ink">
          {index + 1}. {criterionName}
        </h3>
        <p className="text-[14px] leading-5 text-ink-secondary">
          {t(`rubric.criteria.${criterionId}.description`)}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={titleId}
        aria-disabled={disabled || undefined}
        className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto"
      >
        {SCALE.map((value) => {
          const isSelected = score === value;
          const isTabStop = score !== null ? isSelected : value === 1;
          return (
            <button
              key={value}
              ref={(el) => {
                btnRefs.current[value - 1] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={t("rubric.scoring.scoreOptionLabel", { criterion: criterionName, value })}
              tabIndex={isTabStop ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(value)}
              onKeyDown={(e) => handleKeyDown(value, e)}
              className={cx(
                "flex size-8 shrink-0 items-center justify-center rounded-eb-md text-[14px] leading-5 font-medium tabular-nums transition-colors duration-150",
                FOCUS_RING,
                isSelected
                  ? "bg-primary font-semibold text-ink-inverse active:bg-primary-active"
                  : "border border-line-strong bg-surface text-ink-secondary hover:bg-surface-hover hover:text-ink active:bg-selected",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
