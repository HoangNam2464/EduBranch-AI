import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronsUpDown, CircleCheck, Clock, FileCheck2, GitBranch, Inbox } from "lucide-react";
import { FilterControl, MetricCard, SearchField } from "@/components/ds";
import { EmptyState } from "@/components/feedback";
import { useLecturerCourseCases } from "@/pages/statistics/useLecturerCourseCases";

/*
 * 04.1 Hàng đợi Review và phản hồi lập luận — Figma page 08, node 483:14976.
 *  - Metrics: 4 × "stacked" MetricCard (279x122), gap 20.
 *  - Student list: white, radius 18, padding 20, gap 24 → toolbar (h32), table
 *    (column headings h40 #F3F6FC radius 8, padding-left 16, labels 12/16 #696A70).
 * Data: the backend has no lecturer endpoint that lists student submissions
 * (`lecturer-feedback` and `review-study` controllers are empty skeletons and
 * `GET /cases/:caseId/attempts` only returns the caller's own attempts), so the
 * queue renders its empty state and the metrics show "—" instead of invented counts.
 * The course filter lists the lecturer's real courses (`GET /courses`).
 */

const COLUMNS = [
  { key: "student", width: "w-[216px]" },
  { key: "submittedAt", width: "w-[150px]" },
  { key: "case", width: "w-[398px]" },
  { key: "attempt", width: "w-[72px]" },
  { key: "action", width: "w-[150px]" },
  { key: "status", width: "" },
] as const;

export function LecturerFeedbackPage() {
  const { t } = useTranslation();
  const { state } = useLecturerCourseCases();
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("ALL");
  const [status, setStatus] = useState("PENDING");
  const [sort, setSort] = useState("NEWEST");

  const courses = state.status === "ready" ? state.data.map(({ course: c }) => c) : [];
  const unknown = t("g4.common.unknownValue");
  const metrics = [
    { icon: FileCheck2, stroke: 1.7, label: t("g4.queue.metrics.total") },
    { icon: Clock, stroke: 1.51, label: t("g4.queue.metrics.pending") },
    { icon: CircleCheck, stroke: 0.85, label: t("g4.queue.metrics.reviewed") },
    { icon: GitBranch, stroke: 1.5, label: t("g4.queue.metrics.cases") },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} variant="stacked" icon={m.icon} iconStrokeWidth={m.stroke} label={m.label} value={unknown} />
        ))}
      </div>

      <section className="flex h-[646px] flex-col gap-6 rounded-eb-xl bg-surface p-5 shadow-eb-card" aria-label={t("g4.queue.listLabel")}>
        <div className="flex h-8 items-center justify-between gap-4">
          <SearchField
            label={t("g4.queue.searchLabel")}
            placeholder={t("g4.queue.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <FilterControl
              label={t("g4.queue.courseFilter")}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              options={[
                { value: "ALL", label: t("g4.queue.allCourses") },
                ...courses.map((c) => ({ value: c.id, label: c.courseCode ? `${c.courseCode} · ${c.name}` : c.name })),
              ]}
            />
            <FilterControl
              label={t("g4.queue.statusFilter")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "ALL", label: t("g4.queue.status.all") },
                { value: "PENDING", label: t("g4.queue.status.pending") },
                { value: "REVIEWED", label: t("g4.queue.status.reviewed") },
              ]}
            />
            <span className="text-[12px] leading-4 text-ink-secondary">{t("g4.queue.sortLabel")}</span>
            <FilterControl
              label={t("g4.queue.sortLabel")}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={[
                { value: "NEWEST", label: t("g4.queue.sort.newest") },
                { value: "OLDEST", label: t("g4.queue.sort.oldest") },
              ]}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <table className="w-full shrink-0 table-fixed border-separate border-spacing-0" aria-label={t("g4.queue.listLabel")}>
            <thead>
              <tr className="h-10">
                {COLUMNS.map((col, i) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`bg-canvas p-0 text-left text-[12px] leading-4 font-normal text-ink-secondary ${col.width} ${i === 0 ? "rounded-l-eb-md pl-4" : ""} ${i === COLUMNS.length - 1 ? "rounded-r-eb-md" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {t(`g4.queue.columns.${col.key}`)}
                      <ChevronsUpDown aria-hidden="true" size={12} absoluteStrokeWidth strokeWidth={1} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
          <EmptyState
            framed={false}
            className="m-auto"
            icon={Inbox}
            title={t("g4.queue.emptyTitle")}
            description={t("g4.queue.emptyDescription")}
          />
        </div>
      </section>
    </div>
  );
}
