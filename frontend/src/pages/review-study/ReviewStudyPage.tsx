/**
 * Review Study · student workspace — Figma 06.1 (form) / 06.2 (submitted, awaiting feedback).
 *
 * Data: GET /cases/:id (student projection: title, context_text, problem_text, learning_mode)
 * and GET /courses/:courseId. Rules (feature-review-study.md): PUBLISHED REVIEW_STUDY cases only;
 * student_analysis optional, proposed_solution + reasoning_text required (min 10 chars); one
 * submission per student and case; no grading.
 *
 * Gap (reported, not faked): backend/src/modules/review-study has no endpoints yet, so the
 * submission cannot be sent or read back (06.2 cannot be produced); "Lưu nháp" has no API either.
 * The attached-data block (key figures + channel table) has no field in `cases` and is not shown.
 */
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";
import { ActionBar, Card, CardTitle, KeyValueList } from "@/pages/branching/components/parts";
import { loadStudentCase, useLoad, type StudentCaseContext } from "@/pages/branching/components/useStudentCase";
import { PlayerError } from "@/pages/branching/BranchingCasePlayerPage";
import { BarButton } from "@/pages/branching/ReflectionPage";

const ANSWER_MAX = 3000;

export function ReviewStudyPage() {
  const { t } = useTranslation();
  const { caseId = "" } = useParams();
  const [state, reload] = useLoad(() => loadStudentCase(caseId), [caseId]);

  if (state.status === "loading") {
    return <div role="status" aria-label={t("g5.common.loading")} className="h-[684px] rounded-eb-xl bg-surface motion-safe:animate-pulse" />;
  }
  if (state.status === "error") return <PlayerError code={state.code} at={state.at} onRetry={reload} />;
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
  onChange,
}: {
  id: string;
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card className="gap-[23px]">
      <CardTitle>
        <label htmlFor={id}>{title}</label>
      </CardTitle>
      <textarea
        id={id}
        rows={1}
        value={value}
        maxLength={ANSWER_MAX}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={`${id}-count`}
        className="min-h-11 w-full resize-y rounded-eb-md border border-line-strong bg-surface px-4 py-3 text-[14px] leading-5 text-ink outline-none placeholder:text-ink-muted focus:border-accent focus:shadow-eb-focus"
      />
      <span id={`${id}-count`} className="text-[12px] leading-4 text-ink-secondary">
        {t("g5.common.charCount", { count: value.length, max: ANSWER_MAX })}
      </span>
    </Card>
  );
}

function Workspace({ ctx }: { ctx: StudentCaseContext }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseData, course } = ctx;
  useShellTitle(caseData.title);
  const [analysis, setAnalysis] = useState("");
  const [solution, setSolution] = useState("");
  const [reasoning, setReasoning] = useState("");

  return (
    <>
      <div className="flex items-start gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Card className="gap-6">
            <CardTitle>{t("g5.reviewStudy.contextTitle")}</CardTitle>
            <p className="text-[14px] leading-5 whitespace-pre-line text-ink">{caseData.contextText ?? caseData.description ?? "—"}</p>
            {caseData.problemText && (
              <div className="flex flex-col gap-1.5 rounded-eb-lg bg-selected p-4">
                <span className="text-[12px] leading-4 font-medium text-link">{t("g5.reviewStudy.problem")}</span>
                <p className="text-[14px] leading-5 whitespace-pre-line text-ink">{caseData.problemText}</p>
              </div>
            )}
          </Card>
          <AnswerCard
            id="rs-analysis"
            title={t("g5.reviewStudy.analysis")}
            placeholder={t("g5.reviewStudy.analysisPlaceholder")}
            value={analysis}
            onChange={setAnalysis}
          />
          <AnswerCard
            id="rs-solution"
            title={t("g5.reviewStudy.solution")}
            placeholder={t("g5.reviewStudy.solutionPlaceholder")}
            value={solution}
            onChange={setSolution}
          />
          <AnswerCard
            id="rs-reasoning"
            title={t("g5.reviewStudy.reasoning")}
            placeholder={t("g5.reviewStudy.reasoningPlaceholder")}
            value={reasoning}
            onChange={setReasoning}
          />
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
          </Card>
        </div>
      </div>
      <ActionBar
        start={
          <BarButton variant="outline" onClick={() => navigate(PATHS.STUDENT.COURSES)}>
            {t("g5.reviewStudy.back")}
          </BarButton>
        }
        note={t("g5.reviewStudy.finalNote")}
        end={
          <BarButton variant="primary" disabled aria-describedby="rs-unavailable">
            {t("g5.reviewStudy.submit")}
          </BarButton>
        }
      />
      <p id="rs-unavailable" role="status" className="pt-2 text-right text-[12px] leading-4 text-ink-muted">
        {t("g5.reviewStudy.submitUnavailable")}
      </p>
    </>
  );
}
