/**
 * Student desk — Figma 07.2 "Bàn học".
 *
 * FE-028 / Jira: EBA-92 / OPD-001 -> A:
 * - AC-1: Bàn học và Khóa học của tôi chỉ hiển thị khóa học sinh viên đã tham gia và case ở trạng thái PUBLISHED.
 * - AC-3: Tuyệt đối không cho phép duyệt hoặc tìm kiếm khóa học mà sinh viên chưa tham gia.
 * - AC-4: Hỗ trợ đầy đủ trạng thái Loading (Skeleton), EmptyState và ErrorState.
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronDown, ChevronUp, AlertCircle, FolderKanban, Play } from "lucide-react";
import { Button, cx, FOCUS_RING } from "@/components/ds";
import { EmptyState, ErrorState, SkeletonBlock } from "@/components/feedback";
import { PATHS, buildPath, withQuery } from "@/routes/paths";
import { courseService, type StudentDeskData } from "@/services/courseService";

export function StudentDeskPage() {
  const { t } = useTranslation();
  const [deskData, setDeskData] = useState<StudentDeskData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeskData = async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        const res = await courseService.getStudentDeskData();
        setDeskData(res);
      } catch (err: any) {
        // Fallback to student enrolled courses list
        const courses = await courseService.getStudentCourses();
        setDeskData({
          enrolledCourses: courses,
          activeCases: [],
          recentCases: [],
        });
      }
    } catch (err: any) {
      setError(err?.message || t("g5.desk.errorTitle"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDeskData();
  }, []);

  const enrolled = deskData?.enrolledCourses || [];
  const recentCases = (deskData?.recentCases || []).filter(
    (c: any) => !c.status || c.status === "PUBLISHED"
  );

  return (
    <div className="flex flex-col gap-6 pt-2 lg:flex-row lg:items-start">
      {/* Main Content Column (Figma 07.2: 836 content column) */}
      <div className="flex min-w-0 flex-1 flex-col gap-6 self-stretch">
        {loading ? (
          <div className="flex flex-col gap-4 py-3">
            <SkeletonBlock className="h-32 w-full rounded-eb-xl" />
            <SkeletonBlock className="h-48 w-full rounded-eb-xl" />
          </div>
        ) : error ? (
          <ErrorState
            icon={AlertCircle}
            title={t("g5.desk.errorTitle")}
            description={error}
            onRetry={fetchDeskData}
          />
        ) : enrolled.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t("g5.desk.emptyTitle")}
            description={t("g5.desk.emptyBody")}
            action={{
              label: t("g5.courses.join"),
              to: withQuery(PATHS.STUDENT.COURSES, { join: true }),
            }}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {/* My Courses Section */}
            <div className="flex flex-col gap-3 rounded-eb-xl border border-line-subtle bg-surface p-5 shadow-eb-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] leading-6 font-semibold text-ink">
                    {t("g5.desk.enrolledCoursesTitle")}
                  </h2>
                  <p className="text-[13px] leading-5 text-ink-secondary">
                    {t("g5.courses.enrolledSummary", { count: enrolled.length })}
                  </p>
                </div>
                <Button variant="secondary" size="sm" to={PATHS.STUDENT.COURSES}>
                  {t("g5.desk.toCourses")}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {enrolled.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between rounded-eb-lg border border-line-subtle bg-canvas p-3.5 transition-shadow hover:shadow-xs"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="self-start rounded-eb-xs bg-accent-subtle px-1.5 py-0.5 text-[10px] font-semibold text-accent-text">
                        {c.courseCode || c.id.slice(0, 6).toUpperCase()}
                      </span>
                      <h3 className="text-[14px] font-semibold text-ink line-clamp-1">{c.name}</h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-2">
                      <span className="flex items-center gap-1 text-[11px] text-ink-secondary">
                        <FolderKanban size={13} className="text-accent" />
                        {t("g5.courses.publishedCases")}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        to={withQuery(PATHS.STUDENT.COURSES, { courseId: c.id })}
                      >
                        {t("g5.courses.viewCases")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active & Newly Opened Published Cases Section */}
            <div className="flex flex-col gap-3 rounded-eb-xl border border-line-subtle bg-surface p-5 shadow-eb-card">
              <h2 className="text-[16px] leading-6 font-semibold text-ink">
                {t("g5.desk.newCases")}
              </h2>
              {recentCases.length === 0 ? (
                <p className="text-[14px] leading-5 text-ink-secondary">
                  {t("g5.desk.newCasesEmpty")}
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {recentCases.map((cs: any) => (
                    <div
                      key={cs.id}
                      className="flex items-center justify-between rounded-eb-lg border border-line-subtle bg-canvas p-3 transition-colors hover:bg-surface"
                    >
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-[14px] font-medium text-ink">{cs.title || cs.name}</h4>
                        <span className="text-[12px] text-ink-secondary">
                          {cs.courseName || t("g5.courses.publishedCases")}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId: cs.id })}
                      >
                        <Play size={13} className="mr-1" />
                        {t("g5.desk.toCourses")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Aside Calendar Column (Figma 07.2: 320 side column) */}
      <aside className="flex w-full shrink-0 flex-col gap-5 rounded-eb-xl bg-surface p-3 shadow-eb-card lg:w-80">
        <MonthCalendar />
        <div className="px-2 pt-1">
          <h2 className="text-[15px] leading-6 font-semibold text-ink">{t("g5.desk.newCases")}</h2>
          <p className="mt-1 text-[13px] leading-5 text-ink-secondary">
            {recentCases.length > 0
              ? t("g5.courses.enrolledSummary", { count: recentCases.length })
              : t("g5.desk.newCasesEmpty")}
          </p>
        </div>
      </aside>
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
