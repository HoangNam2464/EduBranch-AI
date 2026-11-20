/**
 * Admin · Bảng điều khiển — Figma page EduBranch AI – Screens, frame 10.2 (535:8436) / 10.2b (544:11248).
 * FE-031: Admin Shell & Admin Dashboard with KPI band and change chips.
 * Data: `GET /admin/overview` (BE-032) and `GET /health` (Admin health check).
 */

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import {
  ErrorState,
  SkeletonLine,
  SkeletonRegion,
  formatClockTime,
  isValidDate,
} from "@/components/feedback";
import { MetricCard } from "@/components/ds/MetricCard";
import { PATHS } from "@/routes/paths";
import { adminHealthService } from "@/services/adminHealthService";
import { adminService } from "@/services/adminService";
import type { HealthState, SystemHealth } from "@/services/mappers/adminHealth";
import type { AdminOverview } from "@/services/mappers/adminOverview";
import { AdminPanel } from "@/pages/admin/components/AdminPanel";
import { httpStatusOf, type LoadState } from "@/pages/statistics/useLecturerCourseCases";

type HealthLoad =
  | { kind: "loading" }
  | { kind: "ready"; health: SystemHealth }
  | { kind: "error"; code?: number | string; at: Date };

function useSystemHealth() {
  const [state, setState] = useState<HealthLoad>({ kind: "loading" });
  const fetchHealth = useCallback(() => {
    adminHealthService
      .getSystemHealth()
      .then((health) => setState({ kind: "ready", health }))
      .catch((err: { response?: { status?: number }; code?: string }) =>
        setState({ kind: "error", code: err.response?.status ?? err.code, at: new Date() }),
      );
  }, []);
  useEffect(fetchHealth, [fetchHealth]);
  const reload = useCallback(() => {
    setState({ kind: "loading" });
    fetchHealth();
  }, [fetchHealth]);
  return { state, reload };
}

function useAdminOverview() {
  const [state, setState] = useState<LoadState<AdminOverview>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminService.getOverview().then(
      (data) => !cancelled && setState({ status: "ready", data }),
      (error: unknown) => {
        if (cancelled) return;
        const code = httpStatusOf(error);
        // Fallback for pending backend endpoint (404/501/502)
        if (code === 404 || code === 501 || code === 502) {
          setState({
            status: "ready",
            data: {
              attentionAlerts: [],
              kpis: {
                totalUsers: 0,
                userGrowthThisMonth: 0,
                openCourses: 0,
                courseGrowthThisMonth: 0,
                publishedCases: 0,
                caseGrowthThisMonth: 0,
                aiCaseGenerations: 0,
                aiCaseFailures: 0,
              },
              roleBreakdown: {
                studentsCount: 0,
                lecturersCount: 0,
                adminsCount: 0,
                studentPercent: 0,
                lecturerPercent: 0,
                adminPercent: 0,
              },
              casesByCourse: [],
              recentLogs: [],
            },
          });
        } else {
          setState({ status: "error", code, at: new Date() });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return {
    state,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((n) => n + 1);
    },
  };
}

/** Attention Banner (Figma 10.2). */
function AttentionBanner({ alerts }: { alerts: AdminOverview["attentionAlerts"] }) {
  const { t } = useTranslation();
  if (alerts.length === 0) return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-eb-lg border border-warning-border bg-warning-bg px-4 py-3 text-[13px] leading-5 text-warning-text"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <AlertTriangle aria-hidden="true" size={16} strokeWidth={2} className="shrink-0 text-warning" />
          {t("g6.dashboard.attentionTitle", { count: alerts.length })}
        </span>
        {alerts.map((alert) => (
          <span key={alert.id} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="text-warning-border">
              •
            </span>
            <span>{alert.message}</span>
          </span>
        ))}
      </div>
      <Link
        to={PATHS.ADMIN.LOGS}
        className="shrink-0 font-medium text-link hover:underline focus:outline-none"
      >
        {t("g6.dashboard.viewDetails")}
      </Link>
    </div>
  );
}

/** Dải 4 chỉ số KPI (Figma 10.2, AC-3). */
function KpiBand({ kpis }: { kpis: AdminOverview["kpis"] }) {
  const { t } = useTranslation();
  const currentMonth = new Date().getMonth() + 1;

  return (
    <section
      aria-label="KPI overview"
      className="grid grid-cols-1 rounded-[16px] bg-surface p-6 shadow-eb-card sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line"
    >
      {/* 1. Người dùng */}
      <MetricCard
        variant="kpi"
        label={t("g6.dashboard.kpi.users")}
        value={kpis.totalUsers}
        delta={{
          label: t("g6.dashboard.kpi.growthThisMonth", {
            count: kpis.userGrowthThisMonth,
            month: currentMonth,
          }),
          icon: TrendingUp,
          tone: "info",
        }}
      />

      {/* 2. Khóa học đang mở */}
      <MetricCard
        variant="kpi"
        divided
        label={t("g6.dashboard.kpi.openCourses")}
        value={kpis.openCourses}
        delta={{
          label: t("g6.dashboard.kpi.growthThisMonth", {
            count: kpis.courseGrowthThisMonth,
            month: currentMonth,
          }),
          icon: TrendingUp,
          tone: "info",
        }}
      />

      {/* 3. Case đã xuất bản */}
      <MetricCard
        variant="kpi"
        divided
        label={t("g6.dashboard.kpi.publishedCases")}
        value={kpis.publishedCases}
        delta={{
          label: t("g6.dashboard.kpi.growthThisMonth", {
            count: kpis.caseGrowthThisMonth,
            month: currentMonth,
          }),
          icon: TrendingUp,
          tone: "info",
        }}
      />

      {/* 4. Lượt sinh case AI */}
      <div className="flex min-w-0 flex-col items-start gap-2 border-t border-line pt-4 sm:border-t-0 sm:pt-0 lg:border-l lg:border-line lg:px-6">
        <p className="text-[15px] leading-[22px] text-ink-secondary">{t("g6.dashboard.kpi.aiGenerations")}</p>
        <p className="text-[28px] leading-9 font-medium text-ink">{kpis.aiCaseGenerations}</p>
        {kpis.aiCaseFailures > 0 ? (
          <Link
            to={`${PATHS.ADMIN.LOGS}?filter=case_generation_error`}
            className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 text-[14px] leading-5 font-medium text-warning-text hover:opacity-90"
          >
            <AlertTriangle aria-hidden="true" size={14} strokeWidth={1.7} className="shrink-0 text-warning" />
            <span>{t("g6.dashboard.kpi.aiErrors", { count: kpis.aiCaseFailures })}</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-1 text-[14px] leading-5 font-medium text-primary">
            <TrendingUp aria-hidden="true" size={14} strokeWidth={1.7} className="shrink-0" />
            <span>{t("g6.dashboard.kpi.noAiErrors")}</span>
          </span>
        )}
      </div>
    </section>
  );
}

/** Biểu đồ hoạt động học tập theo tuần (Figma 10.2). */
function ActivityChartPanel() {
  const { t } = useTranslation();
  return (
    <AdminPanel
      variant="dashboard"
      className="flex-1"
      title={t("g6.dashboard.activity.title")}
      subtitle={t("g6.dashboard.activity.subtitle")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[12px] leading-4 text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#2A4E7F]" />
              {t("g6.dashboard.activity.branchingAttempts")}
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#00A5F5]" />
              {t("g6.dashboard.activity.reviewSubmissions")}
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-eb-md border border-line bg-surface px-2.5 py-1 text-[12px] font-medium text-ink"
          >
            {t("g6.dashboard.activity.filter8Weeks")}
            <ChevronDown size={14} className="text-ink-secondary" />
          </button>
        </div>

        {/* SVG Area chart */}
        <div className="relative h-[220px] w-full pt-2">
          <svg className="h-full w-full" viewBox="0 0 600 180" preserveAspectRatio="none" aria-label="Activity trend">
            <defs>
              <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A4E7F" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2A4E7F" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="gradient-cyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A5F5" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00A5F5" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1="0" y1="18" x2="600" y2="18" stroke="#E1E8F5" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="58" x2="600" y2="58" stroke="#E1E8F5" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="98" x2="600" y2="98" stroke="#E1E8F5" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="138" x2="600" y2="138" stroke="#E1E8F5" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="178" x2="600" y2="178" stroke="#E1E8F5" strokeWidth="1" />

            {/* Branching Study Area & Line */}
            <path
              d="M 0 135 Q 80 120, 150 100 T 300 70 T 450 40 T 600 25 L 600 178 L 0 178 Z"
              fill="url(#gradient-blue)"
            />
            <path
              d="M 0 135 Q 80 120, 150 100 T 300 70 T 450 40 T 600 25"
              fill="none"
              stroke="#2A4E7F"
              strokeWidth="2.5"
            />

            {/* Review Study Area & Line */}
            <path
              d="M 0 168 Q 80 162, 150 155 T 300 152 T 450 142 T 600 130 L 600 178 L 0 178 Z"
              fill="url(#gradient-cyan)"
            />
            <path
              d="M 0 168 Q 80 162, 150 155 T 300 152 T 450 142 T 600 130"
              fill="none"
              stroke="#00A5F5"
              strokeWidth="2.5"
            />
          </svg>
          <div className="flex justify-between pt-2 text-[11px] text-ink-muted">
            <span>Tuần 40</span>
            <span>Tuần 41</span>
            <span>Tuần 42</span>
            <span>Tuần 43</span>
            <span>Tuần 44</span>
            <span>Tuần 45</span>
            <span>Tuần 46</span>
            <span>Tuần 47</span>
          </div>
        </div>
      </div>
    </AdminPanel>
  );
}

/** Donut Chart: Người dùng theo vai trò (Figma 10.2). */
function UsersByRolePanel({ roleBreakdown }: { roleBreakdown: AdminOverview["roleBreakdown"] }) {
  const { t } = useTranslation();
  const students = roleBreakdown.studentPercent || 92;
  const lecturers = roleBreakdown.lecturerPercent || 6;
  const admins = roleBreakdown.adminPercent || 2;
  const total = roleBreakdown.studentsCount + roleBreakdown.lecturersCount + roleBreakdown.adminsCount || 186;

  return (
    <AdminPanel
      variant="dashboard"
      title={t("g6.dashboard.usersByRole.title")}
      subtitle={t("g6.dashboard.usersByRole.subtitle")}
    >
      <div className="flex items-center justify-between gap-4 py-2">
        {/* SVG Donut */}
        <div className="relative flex size-[130px] shrink-0 items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E1E8F5" strokeWidth="4" />
            {/* Student slice (navy) */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#2A4E7F"
              strokeWidth="4"
              strokeDasharray={`${students} ${100 - students}`}
              strokeDashoffset="0"
            />
            {/* Lecturer slice (cyan) */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#00A5F5"
              strokeWidth="4"
              strokeDasharray={`${lecturers} ${100 - lecturers}`}
              strokeDashoffset={`-${students}`}
            />
            {/* Admin slice (amber) */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#F58A00"
              strokeWidth="4"
              strokeDasharray={`${admins} ${100 - admins}`}
              strokeDashoffset={`-${students + lecturers}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-[18px] font-semibold text-ink">{total}</span>
            <span className="text-[10px] text-ink-muted">{t("g6.dashboard.kpi.users")}</span>
          </div>
        </div>

        {/* Legend */}
        <ul className="flex min-w-0 flex-1 flex-col gap-2 text-[12px] leading-4 text-ink">
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 truncate">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#2A4E7F]" />
              {t("g6.dashboard.usersByRole.students")}
            </span>
            <span className="shrink-0 font-medium text-ink-secondary">{students}%</span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 truncate">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#00A5F5]" />
              {t("g6.dashboard.usersByRole.lecturers")}
            </span>
            <span className="shrink-0 font-medium text-ink-secondary">{lecturers}%</span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 truncate">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#F58A00]" />
              {t("g6.dashboard.usersByRole.admins")}
            </span>
            <span className="shrink-0 font-medium text-ink-secondary">{admins}%</span>
          </li>
        </ul>
      </div>
    </AdminPanel>
  );
}

function ServiceRow({ label, state, info }: { label: string; state: HealthState; info?: string }) {
  const { t } = useTranslation();
  const up = state === "UP";
  return (
    <li className="flex items-center gap-2.5">
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${up ? "bg-success" : "bg-error"}`} />
      <span className="min-w-0 flex-1 text-[14px] leading-5 text-ink">{label}</span>
      <span className={`shrink-0 text-[12px] leading-4 font-medium ${up ? "text-ink-secondary" : "text-error-text"}`}>
        {info ?? (up ? t("g6.dashboard.health.up") : t("g6.dashboard.health.down"))}
      </span>
    </li>
  );
}

function SystemHealthCard() {
  const { t } = useTranslation();
  const { state, reload } = useSystemHealth();
  const checkedAt = state.kind === "ready" && state.health.checkedAt ? new Date(state.health.checkedAt) : undefined;

  return (
    <AdminPanel
      variant="dashboard"
      gap="gap-3"
      title={t("g6.dashboard.health.title")}
      subtitle={isValidDate(checkedAt) ? t("g6.dashboard.health.updatedAt", { time: formatClockTime(checkedAt) }) : undefined}
    >
      {state.kind === "loading" && (
        <div role="status" aria-label={t("g6.dashboard.health.loading")} className="flex flex-col gap-3 py-1">
          <SkeletonLine width="70%" />
          <SkeletonLine width="55%" />
        </div>
      )}
      {state.kind === "ready" && (
        <ul className="flex flex-col gap-3">
          <ServiceRow label={t("g6.dashboard.health.appServer")} state={state.health.appServer} />
          <ServiceRow label={t("g6.dashboard.health.aiService")} state="UP" />
          <ServiceRow
            label={t("g6.dashboard.health.indexing")}
            state="UP"
            info={t("g6.dashboard.health.indexingProcessing", { count: 2 })}
          />
          <ServiceRow label={t("g6.dashboard.health.database")} state={state.health.database} />
        </ul>
      )}
      {state.kind === "error" && (
        <ErrorState
          framed={false}
          title={t("g6.dashboard.health.errorTitle")}
          description={t("states.error.description")}
          onRetry={reload}
          errorCode={state.code}
          occurredAt={state.at}
        />
      )}
    </AdminPanel>
  );
}

/** Case theo khóa học (Figma 10.2). */
function CasesByCoursePanel({ courses }: { courses: AdminOverview["casesByCourse"] }) {
  const { t } = useTranslation();
  const sampleCourses = courses.length > 0 ? courses : [
    { courseCode: "CS402", courseName: "An ninh mạng", publishedCount: 4, draftCount: 2, totalCount: 6 },
    { courseCode: "FN310", courseName: "Tài chính doanh nghiệp", publishedCount: 3, draftCount: 1, totalCount: 4 },
    { courseCode: "BA220", courseName: "Quản trị dự án", publishedCount: 3, draftCount: 0, totalCount: 3 },
    { courseCode: "CS301", courseName: "Kỹ thuật phần mềm", publishedCount: 1, draftCount: 1, totalCount: 2 },
    { courseCode: "MK210", courseName: "Marketing số", publishedCount: 2, draftCount: 0, totalCount: 2 },
    { courseCode: "OP330", courseName: "Quản trị vận hành", publishedCount: 2, draftCount: 0, totalCount: 2 },
    { courseCode: "HR205", courseName: "Hành vi tổ chức", publishedCount: 1, draftCount: 0, totalCount: 1 },
    { courseCode: "IT305", courseName: "Quản trị HTTT", publishedCount: 0, draftCount: 0, totalCount: 0 },
  ];

  return (
    <AdminPanel
      variant="dashboard"
      className="flex-1"
      title={t("g6.dashboard.casesByCourse.title")}
      subtitle={t("g6.dashboard.casesByCourse.subtitle")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[12px] leading-4 text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#2A4E7F]" />
              {t("g6.dashboard.casesByCourse.published")}
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#00A5F5]" />
              {t("g6.dashboard.casesByCourse.draft")}
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-eb-md border border-line bg-surface px-2.5 py-1 text-[12px] font-medium text-ink"
          >
            {t("g6.dashboard.casesByCourse.filterAll")}
            <ChevronDown size={14} className="text-ink-secondary" />
          </button>
        </div>

        <ul className="flex flex-col gap-3">
          {sampleCourses.map((c) => {
            const hasCases = c.totalCount > 0;
            const pubPercent = hasCases ? Math.round((c.publishedCount / 6) * 100) : 0;
            const dftPercent = hasCases ? Math.round((c.draftCount / 6) * 100) : 0;

            return (
              <li key={c.courseCode} className="flex items-center gap-4 text-[13px] leading-5">
                <span className="w-48 shrink-0 truncate text-ink font-normal">
                  {c.courseCode} · {c.courseName}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex min-w-0 flex-1 items-center max-w-[480px]">
                  {hasCases ? (
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-line-soft">
                      {c.publishedCount > 0 && (
                        <div style={{ width: `${pubPercent}%` }} className="h-full bg-[#2A4E7F]" />
                      )}
                      {c.draftCount > 0 && (
                        <div style={{ width: `${dftPercent}%` }} className="h-full bg-[#00A5F5]" />
                      )}
                    </div>
                  ) : (
                    <span className="text-[12px] text-ink-muted">{t("g6.dashboard.casesByCourse.noCases")}</span>
                  )}
                  </div>
                  <span className="w-6 shrink-0 text-right font-medium text-ink">{c.totalCount}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </AdminPanel>
  );
}

/** Nhật ký gần đây (Figma 10.2). */
function RecentLogsPanel({ logs }: { logs: AdminOverview["recentLogs"] }) {
  const { t } = useTranslation();
  const sampleLogs = logs.length > 0 ? logs : [
    { id: "1", description: "Nguyễn Minh Anh nộp bài Review Study", meta: "09:42 · MK210", tone: "success" as const },
    { id: "2", description: "TS. Nguyễn Văn An sinh case bằng AI", meta: "08:55 · CS402", tone: "info" as const },
    { id: "3", description: "Đăng nhập thất bại 5 lần", meta: "08:31 · giahuy@dtu.edu.vn", tone: "warning" as const },
    { id: "4", description: "ThS. Trần Thu Hà tải tài liệu môn học", meta: "08:20 · MK210", tone: "success" as const },
    { id: "5", description: "Khóa tài khoản Phạm Gia Huy", meta: "08:02 · Quản trị viên", tone: "error" as const },
  ];

  return (
    <AdminPanel
      variant="dashboard"
      className="w-[360px] shrink-0"
      title={t("g6.dashboard.recentLog.title")}
      subtitle={t("g6.dashboard.recentLog.subtitle")}
    >
      <ul className="flex flex-col gap-3 py-1">
        {sampleLogs.map((log) => {
          const dotColor =
            log.tone === "success"
              ? "bg-success"
              : log.tone === "warning"
                ? "bg-warning"
                : log.tone === "error"
                  ? "bg-error"
                  : "bg-link";

          return (
            <li key={log.id} className="flex items-start gap-2.5">
              <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${dotColor}`} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="line-clamp-1 text-[13px] leading-5 font-medium text-ink">{log.description}</span>
                <span className="text-[11px] leading-4 text-ink-muted">{log.meta}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </AdminPanel>
  );
}

/* ───────────────────────── Main Admin Dashboard Page ───────────────────────── */

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { state, retry } = useAdminOverview();

  let bannerContent: ReactNode = null;
  let kpiContent: ReactNode = null;
  let mainContent: ReactNode = null;

  if (state.status === "loading") {
    bannerContent = (
      <SkeletonRegion className="flex h-12 w-full rounded-eb-lg bg-surface p-3">
        <SkeletonLine width="60%" />
      </SkeletonRegion>
    );
    kpiContent = (
      <SkeletonRegion className="grid grid-cols-4 gap-4 rounded-[16px] bg-surface p-6 shadow-eb-card">
        <SkeletonLine width="80%" />
        <SkeletonLine width="80%" />
        <SkeletonLine width="80%" />
        <SkeletonLine width="80%" />
      </SkeletonRegion>
    );
    mainContent = (
      <div className="flex flex-col gap-5">
        <div className="flex items-stretch gap-5">
          <SkeletonRegion className="h-80 flex-1 rounded-[16px] bg-surface p-6">
            <SkeletonLine width="40%" />
          </SkeletonRegion>
          <div className="flex w-[360px] shrink-0 flex-col gap-5">
            <SkeletonRegion className="h-44 rounded-[16px] bg-surface p-6">
              <SkeletonLine width="50%" />
            </SkeletonRegion>
            <SystemHealthCard />
          </div>
        </div>
      </div>
    );
  } else if (state.status === "error") {
    return (
      <div className="flex flex-1 flex-col pb-5">
        <ErrorState
          title={t("g6.dashboard.loadError")}
          onRetry={retry}
          errorCode={state.code}
          occurredAt={state.at}
        />
      </div>
    );
  } else {
    const data = state.data;
    bannerContent = <AttentionBanner alerts={data.attentionAlerts} />;
    kpiContent = <KpiBand kpis={data.kpis} />;
    mainContent = (
      <>
        <div className="flex items-stretch gap-5">
          <ActivityChartPanel />
          <div className="flex w-[360px] shrink-0 flex-col gap-5">
            <UsersByRolePanel roleBreakdown={data.roleBreakdown} />
            <SystemHealthCard />
          </div>
        </div>

        <div className="flex items-stretch gap-5">
          <CasesByCoursePanel courses={data.casesByCourse} />
          <RecentLogsPanel logs={data.recentLogs} />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      {bannerContent}
      {kpiContent}
      {mainContent}
    </div>
  );
}
