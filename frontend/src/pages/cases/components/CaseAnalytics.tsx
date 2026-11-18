import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { FilterControl, cx, type FilterOption } from "@/components/ds";
import { PATHS, buildPath } from "@/routes/paths";
import type { Case, CaseStatus, LearningMode } from "@/types";
import { CASE_STATUSES, MODE_UI, formatDay } from "@/pages/cases/caseUi";

/*
 * 03.1 "Course analytics" row: "Case Study theo trạng thái" (478) + "Chế độ học theo case" (678),
 * gap 20, white panels radius 18, padding 20, column gap 20. Every number comes from the
 * loaded case list; nothing is drawn when the list is empty except zero values.
 */

const SWATCH: Record<CaseStatus, string> = {
  DRAFT: "bg-ink-muted",
  REVIEWED: "bg-accent",
  APPROVED: "bg-warning",
  PUBLISHED: "bg-primary",
};

// Count badges as drawn on 03.1 (fill / label). #BED9F0 has no token yet (reported to the lead).
const COUNT_BADGE: Record<CaseStatus, string> = {
  DRAFT: "bg-primary text-ink-inverse",
  REVIEWED: "bg-accent text-ink-inverse",
  APPROVED: "bg-[#BED9F0] text-ink",
  PUBLISHED: "bg-selected text-ink",
};

function percent(count: number, total: number): string {
  return total === 0 ? "0%" : `${Math.round((count / total) * 100)}%`;
}

export function CaseStatusPanel({ cases }: { cases: Case[] }) {
  const { t } = useTranslation();
  const total = cases.length;
  const counts = Object.fromEntries(CASE_STATUSES.map((s) => [s, cases.filter((c) => c.status === s).length])) as Record<
    CaseStatus,
    number
  >;
  const legend = (status: CaseStatus) => (
    <div key={status} className="flex h-7 items-center gap-1.5">
      <span aria-hidden="true" className={cx("size-3 shrink-0 rounded-[2px]", SWATCH[status])} />
      <span className="min-w-0 flex-1 truncate text-[14px] leading-5 text-ink">{t(`g3.status.${status}`)}</span>
      <span className="text-[12px] leading-4 text-ink">{percent(counts[status], total)}</span>
      <span className={cx("rounded-[20px] px-[7px] py-px text-[12px] leading-4", COUNT_BADGE[status])}>{counts[status]}</span>
    </div>
  );

  return (
    <section aria-labelledby="g3-status-panel" className="flex flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card">
      <div className="flex h-7 items-center">
        <h2 id="g3-status-panel" className="text-[16px] leading-6 font-normal text-ink">
          {t("g3.list.statusPanel")}
        </h2>
      </div>
      <p className="flex h-[34px] items-end gap-2.5 border-l-2 border-primary pl-3">
        <span className="text-[28px] leading-9 font-medium text-ink">{total}</span>
        <span className="text-[12px] leading-4 text-ink-secondary">{t("g3.list.caseUnit")}</span>
      </p>
      <div aria-hidden="true" className="flex h-[54px] gap-1.5">
        {total === 0 ? (
          <span className="flex-1 rounded-[4px] bg-canvas" />
        ) : (
          CASE_STATUSES.filter((s) => counts[s] > 0).map((s) => (
            <span key={s} style={{ flexGrow: counts[s] }} className={cx("basis-0 rounded-[4px]", SWATCH[s])} />
          ))
        )}
      </div>
      <div className="flex gap-14">
        <div className="flex min-w-0 flex-1 flex-col">{(["DRAFT", "REVIEWED", "APPROVED"] as CaseStatus[]).map(legend)}</div>
        <div className="flex min-w-0 flex-1 flex-col">{legend("PUBLISHED")}</div>
      </div>
    </section>
  );
}

const BINS = 6;

export function CaseModePanel({
  cases,
  courseOptions,
  courseId,
  onCourseChange,
}: {
  cases: Case[];
  courseOptions: FilterOption[];
  courseId: string;
  onCourseChange: (courseId: string) => void;
}) {
  const { t } = useTranslation();
  const scoped = courseId ? cases.filter((c) => c.courseId === courseId) : cases;
  const count = (mode: LearningMode) => scoped.filter((c) => c.learningMode === mode).length;
  const branching = count("BRANCHING_STUDY");
  const review = count("REVIEW_STUDY");
  // Scale 0..5 as drawn; larger counts keep 5 ticks with a wider step.
  const step = Math.max(1, Math.ceil(Math.max(branching, review) / 5));
  const ticks = [5, 4, 3, 2, 1, 0].map((n) => n * step);
  const recent = [...scoped].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  const column = (mode: LearningMode, value: number, label: string, track: string, fill: string) => {
    const filled = Math.min(BINS, Math.round(value / step));
    return (
      <div className="flex w-[140px] flex-col items-center gap-3.5">
        <div
          role="img"
          aria-label={`${t(`g3.mode.${mode}`)}: ${value}`}
          className={cx("flex h-[180px] w-full flex-col gap-1 rounded-eb-md p-1", track)}
        >
          {Array.from({ length: BINS }, (_, i) => (
            <span key={i} className={cx("h-[25px] rounded-[4px]", BINS - i <= filled ? fill : "bg-canvas")} />
          ))}
        </div>
        <span className="text-[12px] leading-4 text-ink-secondary">{label}</span>
      </div>
    );
  };

  return (
    <section aria-labelledby="g3-mode-panel" className="flex flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card">
      <div className="flex h-8 items-center justify-between">
        <h2 id="g3-mode-panel" className="text-[16px] leading-6 font-normal text-ink">
          {t("g3.list.modePanel")}
        </h2>
        <FilterControl
          variant="dense"
          label={t("g3.list.courseFilter")}
          options={courseOptions}
          value={courseId}
          onChange={(e) => onCourseChange(e.target.value)}
        />
      </div>
      <div className="flex gap-5">
        <figure aria-label={t("g3.list.chartLabel")} className="flex w-[320px] shrink-0 gap-2">
          <div aria-hidden="true" className="flex h-[184px] w-5 shrink-0 flex-col justify-between">
            {ticks.map((n) => (
              <span key={n} className="text-[12px] leading-4 text-ink-secondary">
                {n}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            {column("BRANCHING_STUDY", branching, t("g3.mode.shortBranching"), "bg-surface-hover", "bg-primary")}
            {column("REVIEW_STUDY", review, t("g3.mode.shortReview"), "bg-surface", "bg-accent")}
          </div>
        </figure>
        <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-eb-lg bg-canvas p-2">
          <h3 className="flex h-8 items-center px-2 text-[14px] leading-5 font-normal text-ink">{t("g3.list.recent")}</h3>
          {recent.length === 0 ? (
            <p className="px-2 pb-2 text-[12px] leading-4 text-ink-secondary">{t("g3.list.recentEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {recent.map((c) => (
                <li key={c.id}>
                  <Link
                    to={buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: c.id })}
                    aria-label={t("g3.list.openCase", { title: c.title })}
                    className="flex h-[50px] items-center gap-3 rounded-eb-md bg-surface p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    <span aria-hidden="true" className={cx("size-3 shrink-0 rounded-[2px]", MODE_UI[c.learningMode].marker)} />
                    <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
                      <span className="truncate text-[12px] leading-4 text-ink">{c.title}</span>
                      <span className="truncate text-[12px] leading-4 text-ink-secondary">
                        {t("g3.list.recentMeta", { date: formatDay(c.updatedAt), mode: t(`g3.mode.${c.learningMode}`) })}
                      </span>
                    </span>
                    <ChevronRight aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.33} className="shrink-0 text-control-icon" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
