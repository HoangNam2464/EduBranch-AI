import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  Clock,
  CloudUpload,
  ChevronRight,
  FileText,
  GitBranch,
  Plus,
  SquarePen,
  type LucideIcon,
} from "lucide-react";
import { Button, FilterControl, MetricCard, StatusTabs, cx } from "@/components/ds";
import { ErrorState, SkeletonLine, SkeletonRegion } from "@/components/feedback";
import { PATHS, buildPath } from "@/routes/paths";
import { addMonths, buildMonthWeeks, startOfMonth } from "@/pages/profile/components/calendar";
import { MonthStepper } from "@/pages/profile/components/MonthStepper";
import { countCases, describeTodo, lecturerTodos, useLecturerCourseCases, type LecturerTodo } from "@/pages/statistics/useLecturerCourseCases";
import { usePrefersReducedMotion } from "@/pages/landing/usePrefersReducedMotion";
import type { Case } from "@/types";

/*
 * 07.1 Bảng điều khiển (giảng viên) — Figma page EduBranch AI – Screens, node 483:16309.
 * Workspace: column gap 20 under the shell header.
 *  - Metric cards: 4 × "inline" MetricCard (279x76) in a row, gap 20.
 *  - Calendar section: white, radius 18, padding 20. Controls row h52; then month view
 *    (fills) + side panels 259 wide, gap 20.
 *  - Quick Actions Hub: 4 shortcut cards for lecturer workflows.
 *  - Active Courses Portfolio: real courses, case counts and material status.
 * Data: `GET /courses` + `GET /courses/:id/cases` + `GET /courses/:id/materials` (cached 60s).
 */

const MONTH_VIEW_MIN_WEEKS = 5;

function SidePanel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx("flex flex-col gap-2 rounded-[14px] bg-selected p-2", className)} aria-label={title}>
      <div className="flex h-8 items-center px-3">
        <h2 className="truncate text-[16px] leading-6 font-normal text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function NoteRow({ children }: { children: ReactNode }) {
  return <p className="rounded-eb-lg bg-canvas px-3.5 py-3 text-[12px] leading-4 text-ink-secondary">{children}</p>;
}

function TodoList({ todos }: { todos: LecturerTodo[] }) {
  const { t } = useTranslation();
  if (todos.length === 0) return <NoteRow>{t("g4.dashboard.todoEmpty")}</NoteRow>;
  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => {
        const desc = describeTodo(todo, t, "dashboard");
        const targetUrl = todo.kind === "materialFailed" ? PATHS.LECTURER.COURSES : PATHS.LECTURER.CASES;
        return (
          <li key={todo.key}>
            <Link
              to={targetUrl}
              className="group flex items-center justify-between gap-3 rounded-eb-lg bg-canvas px-3.5 py-3 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cx(
                    "flex size-8 shrink-0 items-center justify-center rounded-eb-md text-[13px] font-semibold",
                    todo.kind === "materialFailed"
                      ? "bg-error-bg text-error-text"
                      : "bg-primary-subtle text-primary",
                  )}
                >
                  {desc.lead}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-[14px] leading-5 font-medium text-ink group-hover:text-primary transition-colors">
                    {desc.title}
                  </p>
                  <p className="truncate text-[12px] leading-4 text-ink-secondary">
                    {desc.meta}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-ink-muted group-hover:text-primary transition-colors" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function MonthView({ month, today, cases }: { month: Date; today: Date; cases: Case[] }) {
  const { t } = useTranslation();
  const weeks = useMemo(() => buildMonthWeeks(month, today, MONTH_VIEW_MIN_WEEKS), [month, today]);
  const weekdays = t("g4.calendar.weekdays", { returnObjects: true }) as string[];

  // Group cases by ISO date key (YYYY-M-D)
  const casesByDay = useMemo(() => {
    const map = new Map<string, Case[]>();
    for (const c of cases) {
      if (!c.createdAt) continue;
      const date = new Date(c.createdAt);
      if (Number.isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [cases]);

  return (
    <div className="min-w-0 flex-1 rounded-eb-lg bg-canvas px-2 pb-2 ring-1 ring-line-soft ring-inset">
      <table className="w-full table-fixed border-separate border-spacing-0" aria-label={t("g4.calendar.monthTitle", { month: month.getMonth() + 1, year: month.getFullYear() })}>
        <thead>
          <tr>
            {weekdays.map((w) => (
              <th key={w} scope="col" className="h-9 px-1 py-2.5 text-center text-[12px] leading-4 font-medium text-ink-secondary">
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].key}>
              {week.map((d) => {
                const dayCases = casesByDay.get(d.key) ?? [];
                return (
                  <td
                    key={d.key}
                    className="h-28 bg-surface p-2 align-top shadow-[inset_0_0_0_0.5px_var(--color-line-soft)] hover:bg-surface-muted/60 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        aria-current={d.isToday ? "date" : undefined}
                        className={cx(
                          "inline-flex items-center justify-center size-5 rounded-full text-[12px] leading-4 font-medium",
                          d.isToday
                            ? "bg-primary text-white"
                            : d.inMonth
                            ? "text-ink"
                            : "text-ink-muted",
                        )}
                      >
                        {d.day}
                      </span>
                      {d.isToday && (
                        <span className="text-[10px] font-medium text-primary bg-primary-subtle px-1.5 py-0.5 rounded-full">
                          {t("g4.calendar.today")}
                        </span>
                      )}
                    </div>
                    {dayCases.length > 0 && (
                      <div className="flex flex-col gap-1 overflow-hidden">
                        {dayCases.slice(0, 2).map((c) => (
                          <Link
                            key={c.id}
                            to={c.status === "PUBLISHED" ? PATHS.LECTURER.CASES : buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: c.id })}
                            className={cx(
                              "group flex flex-col gap-0.5 rounded px-2 py-1 text-[11px] leading-tight font-medium truncate transition-all duration-150",
                              c.status === "PUBLISHED"
                                ? "bg-primary text-white hover:bg-primary-hover"
                                : "bg-sky-600 text-white hover:bg-sky-700",
                            )}
                            title={`${c.title} (${c.status})`}
                          >
                            <span className="truncate">{c.title}</span>
                            <span className="text-[9px] opacity-90">{t("g4.dashboard.dueTime")}</span>
                          </Link>
                        ))}
                        {dayCases.length > 2 && (
                          <span className="text-[10px] text-ink-secondary px-1 font-medium">
                            {t("g4.dashboard.moreCases", { count: dayCases.length - 2 })}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LecturerDashboardPage() {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const { state, retry } = useLecturerCourseCases({ withMaterials: true });
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [mode, setMode] = useState("ALL");
  const [course, setCourse] = useState("ALL");

  const ready = state.status === "ready" ? state.data : null;

  // Cases filtered by selected course and learning mode for the calendar
  const filteredCases = useMemo(() => {
    if (!ready) return [];
    return ready
      .filter(({ course: c }) => course === "ALL" || c.id === course)
      .flatMap(({ cases }) => cases)
      .filter((c) => mode === "ALL" || c.learningMode === mode);
  }, [ready, course, mode]);

  if (state.status === "error") {
    return (
      <div className="flex flex-1 flex-col pb-5">
        <ErrorState title={t("g4.dashboard.loadError")} onRetry={retry} errorCode={state.code} occurredAt={state.at} />
      </div>
    );
  }

  const metricValue = (value: number | null) => (value === null ? <SkeletonLine width={16} /> : value);
  const metrics = [
    { icon: BookOpen, stroke: 1.7, label: t("g4.dashboard.metrics.courses"), value: metricValue(ready ? ready.length : null) },
    { icon: Clock, stroke: 1.5, label: t("g4.dashboard.metrics.published"), value: metricValue(ready ? countCases(ready, ["PUBLISHED"]) : null) },
    { icon: SquarePen, stroke: 1.5, label: t("g4.dashboard.metrics.drafts"), value: metricValue(ready ? countCases(ready, ["DRAFT", "REVIEWED"]) : null) },
    // No lecturer submissions endpoint yet: the count is unknown, never 0.
    { icon: FileText, stroke: 1.7, label: t("g4.dashboard.metrics.pending"), value: t("g4.common.unknownValue") },
  ];

  const quickActions: {
    icon: LucideIcon;
    title: string;
    desc: string;
    to: string;
    badge?: string;
  }[] = [
    {
      icon: FileText,
      title: t("g4.dashboard.quickActions.aiStudio.title"),
      desc: t("g4.dashboard.quickActions.aiStudio.desc"),
      to: PATHS.LECTURER.AI_STUDIO,
      badge: t("g4.dashboard.quickActions.aiStudioBadge"),
    },
    {
      icon: CloudUpload,
      title: t("g4.dashboard.quickActions.materials.title"),
      desc: t("g4.dashboard.quickActions.materials.desc"),
      to: PATHS.LECTURER.COURSES,
    },
    {
      icon: Clock,
      title: t("g4.dashboard.quickActions.cases.title"),
      desc: t("g4.dashboard.quickActions.cases.desc"),
      to: PATHS.LECTURER.CASES,
    },
    {
      icon: BarChart2,
      title: t("g4.dashboard.quickActions.stats.title"),
      desc: t("g4.dashboard.quickActions.stats.desc"),
      to: PATHS.LECTURER.STATISTICS,
    },
  ];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
      className="flex flex-col gap-6"
    >
      {/* 4 Metrics in a row */}
      <div className="grid grid-cols-4 gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} variant="inline" icon={m.icon} iconStrokeWidth={m.stroke} label={m.label} value={m.value} />
        ))}
      </div>

      {/* Main Calendar & Side Panels */}
      <section className="flex flex-col rounded-eb-xl bg-surface p-5 shadow-eb-card" aria-label={t("g4.dashboard.calendarLabel")}>
        <div className="flex h-[52px] items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="text-[16px] leading-6 text-ink" aria-live="polite">
              {t("g4.calendar.monthTitle", { month: month.getMonth() + 1, year: month.getFullYear() })}
            </p>
            <MonthStepper onPrevious={() => setMonth((m) => addMonths(m, -1))} onNext={() => setMonth((m) => addMonths(m, 1))} />
          </div>
          <div className="flex items-center gap-2">
            <StatusTabs
              label={t("g4.dashboard.modeFilter")}
              value={mode}
              onChange={setMode}
              items={[
                { value: "ALL", label: t("g4.common.all") },
                { value: "BRANCHING_STUDY", label: t("g4.common.branching"), tone: "neutral" },
                { value: "REVIEW_STUDY", label: t("g4.common.review"), tone: "neutral" },
              ]}
            />
            <FilterControl label={t("g4.dashboard.view")} options={[{ value: "MONTH", label: t("g4.dashboard.viewMonth") }]} value="MONTH" onChange={() => undefined} />
            <FilterControl
              label={t("g4.dashboard.courseFilter")}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              options={[
                { value: "ALL", label: t("g4.dashboard.filter") },
                ...(ready ?? []).map(({ course: c }) => ({ value: c.id, label: c.courseCode ? `${c.courseCode} · ${c.name}` : c.name })),
              ]}
            />
            <Button variant="primary" size="sm" leadingIcon={Plus} to={PATHS.LECTURER.AI_STUDIO}>
              {t("g4.dashboard.createCase")}
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-5">
          <MonthView month={month} today={today} cases={filteredCases} />
          <div className="flex w-[259px] shrink-0 flex-col gap-4">
            <SidePanel title={t("g4.dashboard.pendingTitle")}>
              <div className="flex flex-col gap-2 rounded-eb-lg bg-canvas px-3.5 py-3 text-[12px] leading-4 text-ink-secondary">
                <div className="flex items-center gap-2 font-medium text-ink">
                  <Clock size={16} className="text-primary shrink-0" />
                  <span>{t("g4.dashboard.trackSubmissions")}</span>
                </div>
                <p>{t("g4.dashboard.pendingUnavailable")}</p>
                <Link
                  to={PATHS.LECTURER.FEEDBACK}
                  className="mt-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <span>{t("g4.dashboard.openSubmissionsQueue")}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </SidePanel>
            <SidePanel title={t("g4.dashboard.todoTitle")}>
              {ready ? (
                <TodoList todos={lecturerTodos(ready.filter(({ course: c }) => course === "ALL" || c.id === course))} />
              ) : (
                <SkeletonRegion className="flex flex-col gap-2 rounded-eb-lg bg-canvas px-3.5 py-3">
                  <SkeletonLine width="70%" />
                  <SkeletonLine width="45%" size="sm" />
                </SkeletonRegion>
              )}
            </SidePanel>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section aria-label={t("g4.dashboard.quickActions.title")} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] leading-6 font-medium text-ink">
              {t("g4.dashboard.quickActions.title")}
            </h2>
            <p className="text-[13px] leading-5 text-ink-secondary">
              {t("g4.dashboard.quickActions.subtitle")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group flex flex-col justify-between rounded-eb-xl bg-surface p-5 shadow-eb-card hover:shadow-eb-hover border border-line-soft transition-all duration-200"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-eb-lg bg-primary-subtle text-primary group-hover:scale-105 transition-transform">
                    <action.icon size={20} strokeWidth={1.75} />
                  </div>
                  {action.badge && (
                    <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary">
                      {action.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-ink group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-5 text-ink-secondary">
                    {action.desc}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[12px] font-medium text-primary">
                <span>{t("g4.dashboard.access")}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Active Courses Portfolio */}
      <section aria-label={t("g4.dashboard.coursesSection.title")} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] leading-6 font-medium text-ink">
              {t("g4.dashboard.coursesSection.title")}
            </h2>
            <p className="text-[13px] leading-5 text-ink-secondary">
              {t("g4.dashboard.coursesSection.subtitle")}
            </p>
          </div>
          <Link
            to={PATHS.LECTURER.COURSES}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:underline"
          >
            <span>{t("g4.dashboard.coursesSection.viewAll")}</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {ready && ready.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ready.map(({ course: c, cases, materials }) => {
              const pubCount = cases.filter((x) => x.status === "PUBLISHED").length;
              const readyMaterials = materials?.filter((m) => m.processingStatus === "COMPLETED").length ?? 0;
              const totalMaterials = materials?.length ?? 0;

              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-eb-xl bg-surface p-5 shadow-eb-card hover:shadow-eb-hover border border-line-soft transition-all duration-200"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-md bg-primary-subtle px-2 py-0.5 text-[12px] font-medium text-primary">
                        {c.courseCode ?? t("g4.dashboard.courseSectionFallback")}
                      </span>
                      <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
                        <span className={cx("size-2 rounded-full", c.active ? "bg-success" : "bg-ink-muted")} />
                        {c.active ? t("g4.dashboard.statusActive") : t("g4.dashboard.statusInactive")}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[16px] leading-6 font-medium text-ink line-clamp-1">{c.name}</h3>
                      {c.description && (
                        <p className="mt-1 text-[13px] leading-5 text-ink-secondary line-clamp-2">{c.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[12px] text-ink-secondary pt-2 border-t border-line-soft">
                      <span className="flex items-center gap-1.5">
                        <GitBranch size={14} className="text-primary shrink-0" />
                        <span>{t("g4.dashboard.casesCount", { total: cases.length, published: pubCount })}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} className="text-ink-muted shrink-0" />
                        <span>{t("g4.dashboard.materialsCount", { ready: readyMaterials, total: totalMaterials })}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 mt-2">
                    <Link
                      to={buildPath(PATHS.LECTURER.COURSE_MATERIALS, { courseId: c.id })}
                      className="text-[12px] font-medium text-ink-secondary hover:text-primary transition-colors"
                    >
                      {t("g4.dashboard.materialsLink")}
                    </Link>
                    <Link
                      to={buildPath(PATHS.LECTURER.COURSE_CASES, { courseId: c.id })}
                      className="inline-flex items-center gap-1 rounded-md bg-canvas px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-primary-subtle transition-colors"
                    >
                      <span>{t("g4.dashboard.enterCourse")}</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-eb-xl bg-surface p-8 text-center shadow-eb-card border border-line-soft">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary mb-3">
              <BookOpen size={24} />
            </div>
            <h3 className="text-[16px] font-medium text-ink">{t("g4.dashboard.coursesSection.noCoursesTitle")}</h3>
            <p className="mt-1 max-w-md text-[13px] leading-5 text-ink-secondary">
              {t("g4.dashboard.coursesSection.noCoursesDesc")}
            </p>
            <div className="mt-4">
              <Button variant="primary" size="sm" leadingIcon={Plus} to={PATHS.LECTURER.COURSES}>
                {t("g4.dashboard.coursesSection.createCourse")}
              </Button>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}
