/**
 * CaseRubricPage — Giảng viên · Rubric nghiên cứu chất lượng tình huống (Figma page EduBranch AI – Screens, frame 07.8).
 * Routes: /lecturer/cases/:caseId/rubric and /lecturer/rubric (no case selected).
 * The shell renders the page title; this component renders only the content area.
 *
 * Real data only: GET /cases/:id (case header) and GET /courses/:id (course code · name).
 * The backend has no rubric/evaluation API (the evaluation module is an empty skeleton), so the
 * Figma slots for scores, the average, the note, saving and the saved evaluations keep their
 * place but show "—", disabled controls or an empty state with the reason.
 */
import { useEffect, useId, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, GitBranch, Save } from "lucide-react";
import { BadgeBase, Button, Field, SectionHeading } from "@/components/ds";
import { ErrorState, SkeletonLine, SkeletonRegion, StateCard } from "@/components/feedback";
import { caseService } from "@/services/caseService";
import { courseService } from "@/services/courseService";
import type { CaseDetail, Course } from "@/types";

const CRITERIA = ["realism", "difficulty", "curriculumFit"] as const;
const SCALE = [1, 2, 3, 4, 5];
const NOTE_MAX = 1000;

const MODE_TONE: Record<CaseDetail["learningMode"], string> = {
  BRANCHING_STUDY: "bg-primary-subtle text-primary",
  REVIEW_STUDY: "bg-mode-review-bg text-mode-review-text",
};

function errorCodeOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

/** Case + course for the header card; the course is optional (its slot stays empty on failure). */
function useRubricCase(caseId: string | undefined) {
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(Boolean(caseId));
  const [loadError, setLoadError] = useState<{ code?: number; at: Date } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    caseService
      .getCaseById(caseId)
      .then((c) => {
        if (cancelled) return;
        setCaseData(c);
        courseService
          .getCourseById(c.courseId)
          .then((co) => {
            if (!cancelled) setCourse(co);
          })
          .catch(() => {
            /* course code/name are secondary: the slot stays empty */
          });
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError({ code: errorCodeOf(error), at: new Date() });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId, reloadKey]);

  const retry = () => {
    setLoading(true);
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  return { caseData, course, loading, loadError, retry };
}

/** Figma "Case header": icon tile · case info · divider · average score. */
function CaseHeader({ caseId }: { caseId: string | undefined }) {
  const { t } = useTranslation();
  const { caseData, course, loading, loadError, retry } = useRubricCase(caseId);

  let info;
  if (!caseId) {
    info = (
      <>
        <h2 className="text-[16px] leading-6 font-normal tracking-normal text-ink">{t("rubric.case.noneTitle")}</h2>
        <p className="text-[12px] leading-4 text-ink-secondary">{t("rubric.case.noneDescription")}</p>
      </>
    );
  } else if (loading) {
    info = (
      <SkeletonRegion label={t("rubric.case.loading")} className="flex flex-col gap-2">
        <SkeletonLine width="70%" />
        <SkeletonLine width={240} size="sm" />
      </SkeletonRegion>
    );
  } else if (loadError || !caseData) {
    return (
      <section className="flex justify-center rounded-eb-xl bg-surface p-5">
        <ErrorState
          framed={false}
          title={t("rubric.case.errorTitle")}
          description={t("rubric.case.errorDescription")}
          onRetry={retry}
          errorCode={loadError?.code}
          occurredAt={loadError?.at}
        />
      </section>
    );
  } else {
    const courseLabel = course ? [course.courseCode, course.name].filter(Boolean).join(" · ") : "";
    info = (
      <>
        <h2 className="text-[16px] leading-6 font-normal tracking-normal text-ink">{caseData.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <BadgeBase toneClassName={MODE_TONE[caseData.learningMode]}>{t(`rubric.case.mode.${caseData.learningMode}`)}</BadgeBase>
          {courseLabel && <span className="text-[12px] leading-4 text-ink-secondary">{courseLabel}</span>}
        </div>
      </>
    );
  }

  return (
    <section aria-label={t("rubric.case.regionLabel")} className="flex items-center gap-6 rounded-eb-xl bg-surface p-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-eb-lg bg-primary-subtle">
        <GitBranch aria-hidden="true" size={24} absoluteStrokeWidth strokeWidth={1.5} className="text-primary" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">{info}</div>
      <div aria-hidden="true" className="h-14 w-px shrink-0 bg-line" />
      <div className="flex shrink-0 flex-col gap-0.5">
        <span className="text-[12px] leading-4 text-ink-secondary">{t("rubric.average.label")}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-[22px] leading-7 font-normal text-ink">—</span>
          <span className="text-[14px] leading-5 text-ink-muted">/ 5</span>
        </div>
        <span className="text-[12px] leading-4 text-ink-muted">{t("rubric.average.unavailable")}</span>
      </div>
    </section>
  );
}

/** Figma "Enrolled course" row: score tile · criterion · 1–5 scale (disabled: no rubric API). */
function CriterionRow({ index, criterion, reasonId }: { index: number; criterion: (typeof CRITERIA)[number]; reasonId: string }) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <div className="flex items-center gap-4 rounded-eb-lg bg-canvas p-4">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-eb-lg bg-selected">
        <span className="text-[20px] leading-7 font-normal text-link">
          —/5<span className="sr-only">{t("rubric.scoring.noScore")}</span>
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
        <h3 id={titleId} className="text-[16px] leading-6 font-normal tracking-normal text-ink">
          {index + 1}. {t(`rubric.criteria.${criterion}.name`)}
        </h3>
        <p className="text-[14px] leading-5 text-ink-secondary">{t(`rubric.criteria.${criterion}.description`)}</p>
      </div>
      <div role="radiogroup" aria-labelledby={titleId} aria-describedby={reasonId} aria-disabled="true" className="flex shrink-0 items-center gap-1.5">
        {SCALE.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={false}
            disabled
            aria-describedby={reasonId}
            className="flex size-8 cursor-not-allowed items-center justify-center rounded-eb-md bg-canvas text-[14px] leading-5 font-medium text-ink-secondary"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CaseRubricPage() {
  const { t } = useTranslation();
  const { caseId } = useParams<{ caseId?: string }>();
  const reasonId = useId();

  return (
    <div className="flex flex-col gap-5 pb-1">
      <CaseHeader key={caseId ?? ""} caseId={caseId} />

      <div className="flex items-start gap-5">
        {/* Scoring card */}
        <section aria-labelledby="rubric-scoring-title" className="flex min-w-0 flex-1 flex-col gap-4 rounded-eb-xl bg-surface p-5">
          <SectionHeading id="rubric-scoring-title" title={t("rubric.scoring.title")} className="py-1.5" />
          <p className="text-[14px] leading-5 text-ink-secondary">{t("rubric.scoring.description")}</p>

          {CRITERIA.map((key, index) => (
            <CriterionRow key={key} index={index} criterion={key} reasonId={reasonId} />
          ))}

          <Field
            multiline
            label={t("rubric.note.label")}
            placeholder={t("rubric.note.placeholder")}
            helper={t("rubric.note.counter", { count: 0, max: NOTE_MAX })}
            maxLength={NOTE_MAX}
            disabled
          />

          <div className="flex items-center justify-end gap-2">
            <p id={reasonId} className="min-w-0 flex-1 text-[12px] leading-4 text-ink-muted">
              {t("rubric.scoring.unavailable")}
            </p>
            <Button leadingIcon={Save} iconStrokeWidth={1} disabled aria-describedby={reasonId} className="shrink-0">
              {t("rubric.scoring.save")}
            </Button>
          </div>
        </section>

        {/* Saved evaluations card */}
        <section aria-labelledby="rubric-saved-title" className="flex w-[379px] shrink-0 flex-col gap-5 rounded-eb-xl bg-surface p-5">
          <SectionHeading id="rubric-saved-title" title={t("rubric.saved.title")} />
          <StateCard
            tone="empty"
            icon={ClipboardList}
            titleAs="h3"
            title={t("rubric.saved.unavailableTitle")}
            description={t("rubric.saved.unavailableDescription")}
          />
        </section>
      </div>
    </div>
  );
}
