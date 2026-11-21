/**
 * Student desk — Figma 07.2 "Bàn học".
 *
 * Real data: GET /student/dashboard returns enrolled courses, ongoing attempts,
 * published cases and statistics for the signed-in student.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronDown, ChevronRight, ChevronUp, Clock, GitBranch, Play, School } from "lucide-react";
import { Button, cx, FOCUS_RING } from "@/components/ds";
import { EmptyState, ErrorState } from "@/components/feedback";
import { PATHS, buildPath } from "@/routes/paths";
import { Card, CardTitle } from "@/pages/branching/components/parts";
import { courseService, type StudentDashboardData } from "@/services/courseService";

export function StudentDeskPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await courseService.getStudentDashboard();
      setData(res);
    } catch {
      setError(t("states.serverError.description"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const hasContent =
    data &&
    (data.stats.totalEnrolled > 0 ||
      data.stats.totalActiveCases > 0 ||
      data.stats.totalPublishedCases > 0);

  return (
    <div className="flex items-start gap-5 pt-2">
      <div className="flex min-w-0 flex-1 flex-col gap-5 self-stretch">
        {loading ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 animate-pulse rounded-eb-lg bg-surface-muted" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-eb-xl bg-surface-muted" />
          </div>
        ) : error ? (
          <ErrorState
            title={t("states.serverError.title")}
            description={error}
            onRetry={loadDashboard}
            className="self-center"
          />
        ) : !hasContent ? (
          <EmptyState
            icon={BookOpen}
            title={t("g5.desk.emptyTitle")}
            description={t("g5.desk.emptyBody")}
            action={{ label: t("g5.desk.toCourses"), to: PATHS.STUDENT.COURSES }}
          />
        ) : (
          <>
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricTile
                icon={School}
                label={t("g5.desk.stats.enrolledCourses")}
                value={data.stats.totalEnrolled}
              />
              <MetricTile
                icon={Clock}
                label={t("g5.desk.stats.activeCases")}
                value={data.stats.totalActiveCases}
              />
              <MetricTile
                icon={GitBranch}
                label={t("g5.desk.stats.publishedCases")}
                value={data.stats.totalPublishedCases}
              />
            </div>

            {/* In-Progress Cases Section */}
            {data.activeCases.length > 0 && (
              <Card className="gap-4">
                <CardTitle>{t("g5.desk.activeCasesTitle")}</CardTitle>
                <div className="flex flex-col gap-3">
                  {data.activeCases.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between rounded-eb-md border border-line bg-surface p-4 transition-shadow hover:shadow-eb-card"
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-[15px] font-medium text-ink">
                          {attempt.case_title}
                        </span>
                        <div className="flex items-center gap-2 text-[12px] text-ink-secondary">
                          <span className="rounded bg-surface-muted px-1.5 py-0.5 font-medium text-ink">
                            {attempt.course_name}
                          </span>
                          <span>·</span>
                          <span>Lượt làm #{attempt.attempt_number}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        leadingIcon={Play}
                        to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId: attempt.case_id })}
                      >
                        {t("g5.desk.continueCase")}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Enrolled Courses Section */}
            <Card className="gap-4">
              <div className="flex items-center justify-between">
                <CardTitle>{t("g5.desk.myCoursesTitle")}</CardTitle>
                <Button variant="ghost" size="sm" trailingIcon={ChevronRight} to={PATHS.STUDENT.COURSES}>
                  {t("g5.desk.toCourses")}
                </Button>
              </div>

              {data.enrolledCourses.length === 0 ? (
                <p className="text-[14px] text-ink-secondary">{t("g5.desk.noEnrolledCourses")}</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {data.enrolledCourses.map((c) => (
                    <Link
                      key={c.id}
                      to={PATHS.STUDENT.COURSES}
                      className={cx(
                        "flex items-center justify-between rounded-eb-md border border-line p-3 transition-colors hover:bg-surface-hover",
                        FOCUS_RING,
                      )}
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-[14px] font-medium text-ink">{c.name}</span>
                        {c.courseCode && (
                          <span className="font-mono text-[12px] text-ink-secondary">
                            {c.courseCode}
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-ink-secondary" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      <aside className="flex w-80 shrink-0 flex-col gap-5 rounded-eb-xl bg-surface p-2 shadow-eb-card">
        <MonthCalendar />
        <div className="px-3 pt-2.5">
          <h2 className="text-[16px] leading-6 font-normal text-ink">{t("g5.desk.newCases")}</h2>
        </div>
        {data && data.recentCases.length > 0 ? (
          <div className="flex flex-col gap-2 px-3 pb-3">
            {data.recentCases.slice(0, 5).map((cs) => (
              <Link
                key={cs.id}
                to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId: cs.id })}
                className={cx(
                  "flex flex-col rounded-eb-sm p-2 transition-colors hover:bg-surface-hover",
                  FOCUS_RING,
                )}
              >
                <span className="line-clamp-1 text-[13px] font-medium text-ink">{cs.title}</span>
                <span className="text-[11px] text-ink-secondary">{cs.course_name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="px-3 pb-3 text-[14px] leading-5 text-ink-secondary">{t("g5.desk.newCasesEmpty")}</p>
        )}
      </aside>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-eb-lg border border-line bg-surface p-4 shadow-eb-card">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-eb-md bg-selected text-link">
        <Icon size={22} />
      </span>
      <div className="flex flex-col">
        <span className="text-[12px] text-ink-secondary">{label}</span>
        <span className="text-[22px] font-semibold text-ink">{value}</span>
      </div>
    </div>
  );
}

/**
 * "Calendar" (07.2): #DFEDF9, radius 14, padding 12, gap 20. Month 16/24 + two carets (gap 16);
 * weekday row 12/16 #696A70 (padding-top 10); 6 weeks of 40x36 cells, gap 6; today = 32px #2A4E7F circle.
 */
function MonthCalendar() {
  const { t, i18n } = useTranslation();
  const today = new Date();
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1).getDay(); // 0 = Sunday ("CN") — Figma weeks start on Sunday
  const cells = Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - first + i));
  const weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  const weekdays = t("g5.desk.weekdays", { returnObjects: true }) as string[];
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const monthLabel = t("g5.desk.month", { month: month + 1, year });
  const caret = "inline-flex h-[7px] w-3 cursor-pointer items-center justify-center rounded-sm text-ink";

  return (
    <section aria-label={t("g5.desk.calendar")} className="flex flex-col gap-5 rounded-[14px] bg-selected p-3">
      <div className="flex items-center justify-between">
        <h2 aria-live="polite" className="text-[16px] leading-6 font-normal text-ink">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-4">
          <button type="button" aria-label={t("g5.desk.nextMonth")} onClick={() => setView(new Date(year, month + 1, 1))} className={cx(caret, FOCUS_RING)}>
            <ChevronDown aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={3} />
          </button>
          <button type="button" aria-label={t("g5.desk.previousMonth")} onClick={() => setView(new Date(year, month - 1, 1))} className={cx(caret, FOCUS_RING)}>
            <ChevronUp aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={3} />
          </button>
        </div>
      </div>
      <table className="w-full table-fixed border-separate border-spacing-y-1.5" lang={i18n.language}>
        <thead>
          <tr>
            {weekdays.map((d) => (
              <th key={d} scope="col" className="h-[26px] pt-2.5 text-center text-[12px] leading-4 font-normal text-ink-secondary">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((day) => {
                const isToday = sameDay(day, today);
                const outside = day.getMonth() !== month;
                return (
                  <td key={day.toISOString()} className="h-9 p-0 text-center">
                    <span
                      aria-current={isToday ? "date" : undefined}
                      className={cx(
                        "inline-flex size-8 items-center justify-center rounded-full text-[12px] leading-4",
                        isToday ? "bg-primary text-ink-inverse" : outside ? "text-ink-muted" : "text-ink",
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
