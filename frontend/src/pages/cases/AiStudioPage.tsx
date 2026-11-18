/**
 * AiStudioPage — Giảng viên · AI Studio (3-step wizard, OPD-006)
 * - 07.6 Bước 1 Khóa học và chế độ [483:16515]
 * - 07.5 Bước 2 Chủ đề và tài liệu [483:16602]
 * - 07.7 Bước 3 Xác nhận cấu hình [483:16702]
 * Route: /lecturer/ai-studio. Data: GET /courses, GET /courses/:id/materials.
 * "Sinh bản nháp" hands the request to the Case Study list (03.2 / 03.3), which calls
 * POST /cases/generate and opens the editor of the created DRAFT.
 */
import { useEffect, useId, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Check, FileText, Info } from "lucide-react";
import { AiOriginBadge, Field, OptionCard, cx } from "@/components/ds";
import { ErrorState, SkeletonBlock, SkeletonLine, SkeletonRegion } from "@/components/feedback";
import { courseService } from "@/services/courseService";
import { materialService } from "@/services/materialService";
import { PATHS } from "@/routes/paths";
import type { Course, TeachingMaterial } from "@/types";
import type { CaseGenerationState } from "@/pages/cases/CasesPage";
import { ConfigRow, StepRow, StudioCard, WizardActions, type StepState } from "@/pages/cases/components/StudioParts";

type Step = 1 | 2 | 3;
/** Only Branching Study can be generated today: POST /cases/generate always creates BRANCHING_STUDY. */
type StudioMode = "BRANCHING" | "REVIEW" | "MANUAL";

function stepState(index: number, step: Step): StepState {
  if (index < step) return "done";
  return index === step ? "current" : "upcoming";
}

export function AiStudioPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = (location.state as { courseId?: string } | null)?.courseId ?? "";
  const courseSelectId = useId();
  const modeNoteId = useId();

  const [step, setStep] = useState<Step>(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [courseId, setCourseId] = useState(preselected);
  const [mode] = useState<StudioMode>("BRANCHING");
  const [topic, setTopic] = useState("");
  const [materials, setMaterials] = useState<TeachingMaterial[] | null>(null);
  const [materialsError, setMaterialsError] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  async function loadCourses() {
    setLoading(true);
    setLoadError(false);
    try {
      setCourses(await courseService.getMyCourses());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  useEffect(() => {
    setSelected([]);
    setMaterials(null);
    setMaterialsError(false);
    if (!courseId) return;
    let active = true;
    materialService
      .getMaterialsByCourse(courseId)
      .then((list) => active && setMaterials(list))
      .catch(() => active && setMaterialsError(true));
    return () => {
      active = false;
    };
  }, [courseId]);

  const course = courses.find((c) => c.id === courseId);
  const selectedMaterials = useMemo(() => (materials ?? []).filter((m) => selected.includes(m.id)), [materials, selected]);
  const stepLabels = [t("g3.studio.step1"), t("g3.studio.step2"), t("g3.studio.step3")];

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function generate() {
    if (!course) return;
    const state: CaseGenerationState = {
      generate: {
        request: { courseId: course.id, materialIds: selected, topicHint: topic.trim() || undefined },
        materialCount: selected.length,
      },
    };
    navigate(PATHS.LECTURER.CASES, { state });
  }

  if (loading) {
    return (
      <SkeletonRegion label={t("g3.studio.loading")}>
        <div className="grid grid-cols-[minmax(0,678fr)_minmax(0,478fr)] gap-5">
          <div className="flex flex-col gap-4 rounded-eb-xl bg-surface p-5">
            <SkeletonLine width="40%" />
            <SkeletonBlock height={40} />
            <SkeletonBlock height={78} />
            <SkeletonBlock height={78} />
          </div>
          <div className="flex flex-col gap-4 rounded-eb-xl bg-surface p-5">
            <SkeletonLine width="50%" />
            <SkeletonBlock height={52} />
            <SkeletonBlock height={52} />
          </div>
        </div>
      </SkeletonRegion>
    );
  }
  if (loadError) return <ErrorState className="self-center" title={t("g3.studio.loadError")} onRetry={() => void loadCourses()} />;

  const modeLabel = t("g3.mode.BRANCHING_STUDY");
  const topicValue = topic.trim();

  const config = (
    <StudioCard title={t("g3.studio.config")}>
      <dl className="flex flex-col gap-[23px]">
        <ConfigRow label={t("g3.studio.configCourse")}>{course?.name ?? t("g3.studio.notSelected")}</ConfigRow>
        <ConfigRow label={t("g3.studio.configMode")}>{modeLabel}</ConfigRow>
        <ConfigRow label={t("g3.studio.configTopic")}>{step >= 2 && topicValue ? topicValue : t("g3.studio.notEntered")}</ConfigRow>
        <ConfigRow label={t("g3.studio.configMaterials")}>
          {selected.length > 0 ? t("g3.studio.materialsSelected", { count: selected.length }) : t("g3.studio.notSelected")}
        </ConfigRow>
      </dl>
      <AiDraftNote />
    </StudioCard>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[minmax(0,678fr)_minmax(0,478fr)] items-start gap-5">
        <div className="flex flex-col gap-5">
          {step === 1 && (
            <StudioCard title={t("g3.studio.step1")} gap="gap-6">
              <p className="text-[14px] leading-5 text-ink-secondary">{t("g3.studio.intro")}</p>
              {/* Forms/Field look (Input, leading book-open 1.7) around a native select: the DS Field has no select type. */}
              <div className="flex flex-col gap-2">
                <label htmlFor={courseSelectId} className="text-[14px] leading-5 text-ink">
                  {t("g3.studio.course")} *
                </label>
                <div className="flex h-10 items-center gap-2 rounded-eb-md border border-line-strong bg-surface px-3 transition-[box-shadow,border-color] focus-within:border-accent focus-within:shadow-eb-focus">
                  <BookOpen aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.7} className="shrink-0 text-ink-secondary" />
                  <select
                    id={courseSelectId}
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className={cx(
                      "min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-[14px] leading-5 outline-none",
                      courseId ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    <option value="" disabled>
                      {t("g3.studio.coursePlaceholder")}
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div role="radiogroup" aria-label={t("g3.studio.modeLabel")} aria-describedby={modeNoteId} className="flex flex-col gap-6">
                <p className="text-[12px] leading-4 font-medium text-ink">{t("g3.studio.modeLabel")} *</p>
                <OptionCard optionKey="A" selected={mode === "BRANCHING"}>
                  {t("g3.studio.modeBranching")}
                </OptionCard>
                <OptionCard optionKey="B" selected={false} disabled>
                  {t("g3.studio.modeReview")}
                </OptionCard>
                <OptionCard optionKey="C" selected={false} disabled>
                  {t("g3.studio.modeManual")}
                </OptionCard>
                <p id={modeNoteId} className="sr-only">
                  {t("g3.studio.modeUnavailable")}
                </p>
              </div>
            </StudioCard>
          )}

          {step === 2 && (
            <>
              <StudioCard title={t("g3.studio.step2")} gap="gap-6">
                <Field
                  multiline
                  label={`${t("g3.studio.topic")} *`}
                  placeholder={t("g3.studio.topicPlaceholder")}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </StudioCard>
              <StudioCard title={t("g3.studio.materials")}>
                <p className="text-[12px] leading-4 text-ink-secondary">{t("g3.studio.materialsSelected", { count: selected.length })}</p>
                {materialsError ? (
                  <ErrorState framed={false} className="self-center" title={t("g3.studio.materialsError")} />
                ) : materials && materials.length === 0 ? (
                  <p className="text-[14px] leading-5 text-ink-secondary">{t("g3.studio.materialsEmpty")}</p>
                ) : (
                  <ul className="flex flex-col gap-[23px]">
                    {(materials ?? []).map((m) => (
                      <MaterialRow key={m.id} material={m} checked={selected.includes(m.id)} onToggle={() => toggle(m.id)} />
                    ))}
                  </ul>
                )}
                <p className="flex gap-2 rounded-eb-lg bg-canvas p-3 text-[12px] leading-4 text-ink-secondary">
                  <Info aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.3} className="shrink-0" />
                  {t("g3.studio.note")}
                </p>
              </StudioCard>
            </>
          )}

          {step === 3 && (
            <>
              <StudioCard title={t("g3.studio.confirmTitle")} gap="gap-6">
                <dl className="flex flex-col gap-6">
                  <ConfigRow label={t("g3.studio.configCourse")}>{course?.name}</ConfigRow>
                  <ConfigRow label={t("g3.studio.configMode")}>{modeLabel}</ConfigRow>
                  <ConfigRow label={t("g3.studio.configTopic")}>{topicValue || t("g3.studio.notEntered")}</ConfigRow>
                  <ConfigRow label={t("g3.studio.configMaterials")}>
                    {selectedMaterials.length > 0
                      ? t("g3.studio.materialsSummary", {
                          count: selectedMaterials.length,
                          names: selectedMaterials.map((m) => m.originalFilename).join(", "),
                        })
                      : t("g3.studio.noMaterials")}
                  </ConfigRow>
                </dl>
              </StudioCard>
              <StudioCard title={t("g3.studio.after")}>
                <ol className="flex flex-col gap-[23px]">
                  {[t("g3.studio.after1"), t("g3.studio.after2"), t("g3.studio.after3"), t("g3.studio.after4")].map((label, i) => (
                    <StepRow key={label} index={i + 1} state="plain">
                      {label}
                    </StepRow>
                  ))}
                </ol>
              </StudioCard>
            </>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <StudioCard title={t("g3.studio.steps")}>
            <ol aria-label={t("g3.studio.steps")} className="flex flex-col gap-[23px]">
              {stepLabels.map((label, i) => (
                <StepRow key={label} index={i + 1} state={stepState(i + 1, step)}>
                  {label}
                </StepRow>
              ))}
            </ol>
            {step === 3 && <AiDraftNote />}
          </StudioCard>
          {step < 3 && config}
        </div>
      </div>

      <WizardActions
        status={t(`g3.studio.footer${step}`)}
        secondaryLabel={step === 1 ? t("g3.studio.cancel") : t("g3.studio.previous")}
        onSecondary={() => (step === 1 ? navigate(PATHS.LECTURER.CASES) : setStep((s) => (s - 1) as Step))}
        primaryLabel={step === 3 ? t("g3.studio.generate") : t("g3.studio.next")}
        primaryDisabled={(step === 1 && !course) || (step === 2 && topicValue === "")}
        onPrimary={() => (step === 3 ? generate() : setStep((s) => (s + 1) as Step))}
      />
    </div>
  );
}

/** "Note" of the config / steps card: #DFEDF9, radius 12, padding 12, gap 8, AI Draft badge + 12/16 #2A4E7F text. */
function AiDraftNote() {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2 rounded-eb-lg bg-selected p-3">
      <AiOriginBadge type="draft">{t("g3.aiDraft")}</AiOriginBadge>
      <p className="min-w-0 flex-1 text-[12px] leading-4 text-link">{t("g3.studio.aiDraftNote")}</p>
    </div>
  );
}

/**
 * "Source" row of 07.5: h46, padding 12/14, gap 12, radius 12.
 * Selected: #DFEDF9 + 1px #2A4E7F stroke, checkbox #2A4E7F with check 12 (stroke 2.09).
 * Ready: white + 1px #E8EDF6, empty checkbox 1.5px #D1D9E8. Only COMPLETED (indexed) materials
 * can be chosen; others show their processing state on the right and the name in #696A70.
 */
function MaterialRow({ material, checked, onToggle }: { material: TeachingMaterial; checked: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const ready = material.processingStatus === "COMPLETED";
  const id = useId();
  return (
    <li>
      <label
        htmlFor={id}
        className={cx(
          "flex items-center gap-3 rounded-eb-lg border px-3.5 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
          checked ? "border-primary bg-selected" : "border-line-soft bg-surface",
          ready ? "cursor-pointer" : "cursor-not-allowed",
        )}
      >
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} disabled={!ready} onChange={onToggle} />
        <span
          aria-hidden="true"
          className={cx(
            "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px]",
            checked ? "border-primary bg-primary text-ink-inverse" : "border-line-strong bg-surface",
          )}
        >
          {checked && <Check size={12} absoluteStrokeWidth strokeWidth={2.09} />}
        </span>
        <FileText aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.7} className="shrink-0 text-link" />
        <span className={cx("min-w-0 flex-1 truncate text-[14px] leading-5", ready ? "text-ink" : "text-ink-secondary")}>
          {material.originalFilename}
        </span>
        {!ready && (
          <span className="shrink-0 text-[12px] leading-4 text-ink-secondary">
            {material.processingStatus === "FAILED" ? t("g3.studio.materialFailed") : t("g3.studio.materialNotReady")}
          </span>
        )}
      </label>
    </li>
  );
}
