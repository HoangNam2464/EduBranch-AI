/**
 * Admin · Bảng điều khiển — Figma page EduBranch AI – Screens, frame 10.2 (535:8436) / 10.2b (544:11248).
 *
 * Real data only: the backend has no admin endpoints yet, so the attention banner,
 * KPI band, charts, role split and recent log are not rendered with values; their
 * cards show the shared empty state. "Tình trạng hệ thống" reads the public
 * `GET /health` check (application server + database).
 */
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChartArea, ChartBarBig, ChartPie, ScrollText } from "lucide-react";
import { ErrorState, SkeletonLine, formatClockTime, isValidDate } from "@/components/feedback";
import { adminHealthService } from "@/services/adminHealthService";
import type { HealthState, SystemHealth } from "@/services/mappers/adminHealth";
import { AdminNoData, AdminPanel } from "@/pages/admin/components/AdminPanel";

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

/** Figma "Service" row: row gap 10, dot 8 · name Regular 14/20 #202124 (fills) · status Medium 12/16 #696A70. */
function ServiceRow({ label, state }: { label: string; state: HealthState }) {
  const { t } = useTranslation();
  const up = state === "UP";
  return (
    <li className="flex items-center gap-2.5">
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${up ? "bg-success" : "bg-error"}`} />
      <span className="min-w-0 flex-1 text-[14px] leading-5 text-ink">{label}</span>
      <span className={`shrink-0 text-[12px] leading-4 font-medium ${up ? "text-ink-secondary" : "text-error-text"}`}>
        {up ? t("g6.dashboard.health.up") : t("g6.dashboard.health.down")}
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

export function AdminDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-stretch gap-5">
        <AdminPanel
          variant="dashboard"
          className="flex-1"
          title={t("g6.dashboard.activity.title")}
          subtitle={t("g6.dashboard.activity.subtitle")}
        >
          <AdminNoData icon={ChartArea} />
        </AdminPanel>
        <div className="flex w-[360px] shrink-0 flex-col gap-5">
          <AdminPanel
            variant="dashboard"
            title={t("g6.dashboard.usersByRole.title")}
            subtitle={t("g6.dashboard.usersByRole.subtitle")}
          >
            <AdminNoData icon={ChartPie} description={false} />
          </AdminPanel>
          <SystemHealthCard />
        </div>
      </div>

      <div className="flex items-stretch gap-5">
        <AdminPanel
          variant="dashboard"
          className="flex-1"
          title={t("g6.dashboard.casesByCourse.title")}
          subtitle={t("g6.dashboard.casesByCourse.subtitle")}
        >
          <AdminNoData icon={ChartBarBig} />
        </AdminPanel>
        <AdminPanel
          variant="dashboard"
          className="w-[360px] shrink-0"
          title={t("g6.dashboard.recentLog.title")}
          subtitle={t("g6.dashboard.recentLog.subtitle")}
        >
          <AdminNoData icon={ScrollText} description={false} />
        </AdminPanel>
      </div>
    </div>
  );
}
