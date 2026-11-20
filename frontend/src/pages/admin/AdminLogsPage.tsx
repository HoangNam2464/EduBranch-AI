/**
 * Admin · Nhật ký hệ thống — Figma page EduBranch AI – Screens, frame 10.9 (536:7923).
 *
 * Real data integration with BE-032 (`adminService.getSystemLogs`).
 * 4 KPI metric cards, filters by search/eventType/timeRange, straight column alignment,
 * log detail dialog, loading/empty/error states, and pagination.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Calendar,
  LogIn,
  ScrollText,
  Search,
  Sparkles,
} from "lucide-react";
import { Dialog, MetricCard, cx } from "@/components/ds";
import { EmptyState, ErrorState, SkeletonRegion } from "@/components/feedback";
import { adminService, type AdminSystemLogItem } from "@/services/adminService";
import { mapAdminHttpErrorToKey } from "@/pages/admin/adminErrorHelper";

export function AdminLogsPage() {
  const { t } = useTranslation();

  const [logs, setLogs] = useState<AdminSystemLogItem[]>([]);
  const [metrics, setMetrics] = useState({
    eventsToday: 0,
    loginCount: 0,
    aiGenerationsCount: 0,
    errorsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("TODAY");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<AdminSystemLogItem | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setReloadToken((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getSystemLogs({
        search: search.trim() || undefined,
        eventType: eventFilter !== "ALL" ? eventFilter : undefined,
        timeRange: timeFilter !== "ALL" ? timeFilter : undefined,
        page: currentPage,
        size: pageSize,
      })
      .then((res) => {
        if (cancelled) return;
        setLogs(res.logs ?? []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(mapAdminHttpErrorToKey(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, eventFilter, timeFilter, currentPage, reloadToken]);

  // Client-side filtering fallback
  const filteredLogs = useMemo(() => {
    let result = [...logs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.actorEmail.toLowerCase().includes(q) ||
          l.eventTitle.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q),
      );
    }
    if (eventFilter !== "ALL") {
      result = result.filter((l) => l.eventTitle.includes(eventFilter));
    }
    return result;
  }, [logs, search, eventFilter]);

  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      {/* 4 KPI Cards (Figma 10.9) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Calendar}
          label={t("g6.logs.kpi.eventsToday")}
          value={metrics.eventsToday}
        />
        <MetricCard
          icon={LogIn}
          label={t("g6.logs.kpi.loginCount")}
          value={metrics.loginCount}
        />
        <MetricCard
          icon={Sparkles}
          label={t("g6.logs.kpi.aiGenerationsCount")}
          value={metrics.aiGenerationsCount}
        />
        <MetricCard
          icon={AlertTriangle}
          label={t("g6.logs.kpi.errorsCount")}
          value={metrics.errorsCount}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-eb-xl bg-surface p-4 shadow-eb-card">
        {/* Search */}
        <div className="relative flex min-w-[280px] flex-1 items-center">
          <Search size={16} className="absolute left-3 text-ink-muted" />
          <input
            type="text"
            placeholder={t("g6.logs.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-eb-md border border-line bg-canvas py-2 pr-3 pl-9 text-[14px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            aria-label={t("g6.logs.filterEventAria")}
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="ALL">{t("g6.logs.filterEvent.all")}</option>
            <option value="Đăng nhập">{t("g6.logs.filterEvent.login")}</option>
            <option value="Sinh case">{t("g6.logs.filterEvent.aiGen")}</option>
            <option value="Nộp bài">{t("g6.logs.filterEvent.submission")}</option>
            <option value="Tài liệu">{t("g6.logs.filterEvent.material")}</option>
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            aria-label={t("g6.logs.filterTimeAria")}
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="TODAY">{t("g6.logs.filterTime.today")}</option>
            <option value="7_DAYS">{t("g6.logs.filterTime.sevenDays")}</option>
            <option value="30_DAYS">{t("g6.logs.filterTime.thirtyDays")}</option>
            <option value="ALL">{t("g6.logs.filterTime.all")}</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label={t("g6.logs.sortAria")}
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="NEWEST">{t("g6.logs.sort.newest")}</option>
            <option value="OLDEST">{t("g6.logs.sort.oldest")}</option>
          </select>
        </div>
      </div>

      {/* Logs Table (Figma 10.9) */}
      <div className="overflow-hidden rounded-eb-xl bg-surface shadow-eb-card">
        {loading ? (
          <div className="p-6">
            <SkeletonRegion label={t("g6.logs.loading")} className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 w-full rounded-eb-md bg-canvas/60" />
              ))}
            </SkeletonRegion>
          </div>
        ) : loadError ? (
          <div className="p-6">
            <ErrorState title={t("g6.logs.loadErrorTitle")} description={t(loadError)} onRetry={reload} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ScrollText}
              title={t("g6.logs.emptyFilteredTitle")}
              description={t("g6.logs.emptyFilteredDescription")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-line bg-canvas text-[12px] font-medium text-ink-secondary">
                <tr>
                  <th className="py-3 pr-4 pl-5">{t("g6.logs.columns.actor")}</th>
                  <th className="px-4 py-3">{t("g6.logs.columns.time")}</th>
                  <th className="px-4 py-3">{t("g6.logs.columns.event")}</th>
                  <th className="px-4 py-3 text-center">{t("g6.logs.columns.code")}</th>
                  <th className="px-4 py-3 text-center">{t("g6.logs.columns.detail")}</th>
                  <th className="py-3 pr-5 pl-4 text-right">{t("g6.logs.columns.result")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredLogs.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
                  const isWarning = log.status === "WARNING";
                  const initials = log.actorName
                    .split(" ")
                    .filter(Boolean)
                    .slice(-2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase() || "ND";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-hover/50 transition-colors"
                    >
                      {/* Column 1: Actor */}
                      <td className="py-3.5 pr-4 pl-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-eb-full bg-primary-subtle text-[13px] font-semibold text-primary">
                            {initials}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-ink">{log.actorName}</span>
                            <span className="text-[12px] text-ink-secondary">{log.actorEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Timestamp */}
                      <td className="px-4 py-3.5 text-ink-secondary">
                        {log.timestamp}
                      </td>

                      {/* Column 3: Event */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-ink">{log.eventTitle}</span>
                          {log.eventMeta && (
                            <span className="text-[12px] text-ink-secondary">
                              {log.eventMeta}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Code */}
                      <td className="px-4 py-3.5 text-center font-mono text-[13px] text-ink-secondary">
                        {log.code}
                      </td>

                      {/* Column 5: Detail Action */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="rounded-eb-md border border-line bg-canvas px-2.5 py-1 text-[12px] font-medium text-link hover:bg-surface-hover hover:underline"
                        >
                          {t("g6.logs.action.viewDetail")}
                        </button>
                      </td>

                      {/* Column 6: Result Pill */}
                      <td className="py-3.5 pr-5 pl-4 text-right">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium",
                            isSuccess
                              ? "bg-success-bg text-success-text"
                              : isWarning
                              ? "bg-warning-bg text-warning-text"
                              : "bg-error-bg text-error-text",
                          )}
                        >
                          <span
                            className={cx(
                              "size-1.5 rounded-full",
                              isSuccess ? "bg-success" : isWarning ? "bg-warning" : "bg-error",
                            )}
                          />
                          {isSuccess
                            ? t("g6.logs.status.success")
                            : isWarning
                            ? t("g6.logs.status.warning")
                            : t("g6.logs.status.error")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13px] text-ink-secondary">
          <span>
            {t("g6.logs.pagination.showing", {
              shown: Math.min(filteredLogs.length, pageSize),
              total: metrics.eventsToday,
            })}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
              aria-label={t("g6.logs.pagination.prev")}
            >
              &lt;
            </button>
            <span className="flex size-7 items-center justify-center rounded bg-primary text-[12px] font-semibold text-white">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={filteredLogs.length < pageSize}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
              aria-label={t("g6.logs.pagination.next")}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Log Detail Dialog */}
      {selectedLog && (
        <Dialog
          open={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={t("g6.logs.dialog.title", { code: selectedLog.code })}
          confirmLabel={t("g6.logs.dialog.close")}
          onConfirm={() => setSelectedLog(null)}
        >
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-ink-secondary">{t("g6.logs.dialog.actor")}</span>
              <span className="font-semibold text-ink">{selectedLog.actorName} ({selectedLog.actorEmail})</span>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-ink-secondary">{t("g6.logs.dialog.time")}</span>
              <span className="font-medium text-ink">{selectedLog.timestamp}</span>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-ink-secondary">{t("g6.logs.dialog.action")}</span>
              <span className="font-semibold text-ink">{selectedLog.eventTitle}</span>
            </div>
            {selectedLog.eventMeta && (
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-ink-secondary">{t("g6.logs.dialog.target")}</span>
                <span className="font-medium text-ink">{selectedLog.eventMeta}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-ink-secondary">{t("g6.logs.dialog.technicalDetails")}</span>
              <p className="rounded-eb-md bg-canvas p-3 font-mono text-[12px] text-ink">
                {selectedLog.details || t("g6.logs.dialog.noDetails")}
              </p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
