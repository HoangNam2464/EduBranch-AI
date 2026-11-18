import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, CircleCheck, MessageSquare, Plus, SquarePen } from "lucide-react";
import { Avatar, Button, FilterControl, MetricCard, StatusTabs, cx } from "@/components/ds";
import { ErrorState, SkeletonLine, SkeletonRegion } from "@/components/feedback";
import { PATHS } from "@/routes/paths";
import { addMonths, buildMonthWeeks, startOfMonth } from "@/pages/profile/components/calendar";
import { MonthStepper } from "@/pages/profile/components/MonthStepper";
import { countCases, describeTodo, lecturerTodos, useLecturerCourseCases, type LecturerTodo } from "@/pages/statistics/useLecturerCourseCases";

/*
 * 07.1 Bảng điều khiển (giảng viên) — Figma page EduBranch AI – Screens, node 483:16309.
 * Workspace: column gap 20 under the shell header.
 *  - Metric cards: 4 × "inline" MetricCard (279x76) in a row, gap 20.
 *  - Calendar section: white, radius 18, padding 20. Controls row h52; then month view
 *    (fills) + side panels 259 wide, gap 20.
 * Data: `GET /courses` + `GET /courses/:id/cases` + `GET /courses/:id/materials` (counts and to-dos). Submissions and
 * deadlines have no endpoint yet, so the pending-submission metric shows "—", the calendar
 * has no events and the submissions panel says there is no data (BE gap, see report).
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

/** "List row" of the side panels: #F3F6FC, radius 12, padding 12/14, gap 12. */
function ListRow({ lead, title, meta }: { lead: string; title: string; meta: string }) {
  return (
    <li className="flex items-center gap-3 rounded-eb-lg bg-canvas px-3.5 py-3">
      <Avatar initials={lead} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[14px] leading-5 font-medium text-ink">{title}</p>
        <p className="truncate text-[12px] leading-4 text-ink-secondary">{meta}</p>
      </div>
    </li>
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
      {todos.map((todo) => (
        <ListRow key={todo.key} {...describeTodo(todo, t, "dashboard")} />
      ))}
    </ul>
  );
}

function MonthView({ month, today }: { month: Date; today: Date }) {
  const { t } = useTranslation();
  const weeks = useMemo(() => buildMonthWeeks(month, today, MONTH_VIEW_MIN_WEEKS), [month, today]);
  const weekdays = t("g4.calendar.weekdays", { returnObjects: true }) as string[];
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
              {week.map((d) => (
                <td key={d.key} className="h-28 bg-surface p-2 align-top shadow-[inset_0_0_0_0.5px_var(--color-line-soft)]">
                  <span
                    aria-current={d.isToday ? "date" : undefined}
                    className={cx("text-[12px] leading-4 font-medium", d.inMonth ? "text-ink" : "text-ink-muted")}
                  >
                    {d.day}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LecturerDashboardPage() {
  const { t } = useTranslation();
  const { state, retry } = useLecturerCourseCases({ withMaterials: true });
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [mode, setMode] = useState("ALL");
  const [course, setCourse] = useState("ALL");

  if (state.status === "error") {
    return (
      <div className="flex flex-1 flex-col pb-5">
        <ErrorState title={t("g4.dashboard.loadError")} onRetry={retry} errorCode={state.code} occurredAt={state.at} />
      </div>
    );
  }

  const ready = state.status === "ready" ? state.data : null;
  const metricValue = (value: number | null) => (value === null ? <SkeletonLine width={16} /> : value);
  const metrics = [
    { icon: BookOpen, stroke: 1.7, label: t("g4.dashboard.metrics.courses"), value: metricValue(ready ? ready.length : null) },
    { icon: CircleCheck, stroke: 0.85, label: t("g4.dashboard.metrics.published"), value: metricValue(ready ? countCases(ready, ["PUBLISHED"]) : null) },
    { icon: SquarePen, stroke: 1.5, label: t("g4.dashboard.metrics.drafts"), value: metricValue(ready ? countCases(ready, ["DRAFT", "REVIEWED"]) : null) },
    // No lecturer submissions endpoint yet: the count is unknown, never 0.
    { icon: MessageSquare, stroke: 1.36, label: t("g4.dashboard.metrics.pending"), value: t("g4.common.unknownValue") },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} variant="inline" icon={m.icon} iconStrokeWidth={m.stroke} label={m.label} value={m.value} />
        ))}
      </div>

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
          <MonthView month={month} today={today} />
          <div className="flex w-[259px] shrink-0 flex-col gap-4">
            <SidePanel title={t("g4.dashboard.pendingTitle")}>
              <NoteRow>{t("g4.dashboard.pendingUnavailable")}</NoteRow>
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
    </div>
  );
}
