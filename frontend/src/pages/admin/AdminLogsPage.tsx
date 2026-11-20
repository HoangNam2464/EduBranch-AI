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
  Clock,
  LogIn,
  ScrollText,
  Search,
  Sparkles,
} from "lucide-react";
import { Dialog, MetricCard, cx } from "@/components/ds";
import { EmptyState, ErrorState, SkeletonRegion } from "@/components/feedback";
import { adminService, type AdminSystemLogItem } from "@/services/adminService";

export function AdminLogsPage() {
  const { t } = useTranslation();

  const [logs, setLogs] = useState<AdminSystemLogItem[]>([]);
  const [metrics, setMetrics] = useState({
    eventsToday: 248,
    loginCount: 131,
    aiGenerationsCount: 9,
    errorsCount: 1,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("TODAY");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<AdminSystemLogItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminService.getSystemLogs({
        search: search.trim() || undefined,
        eventType: eventFilter !== "ALL" ? eventFilter : undefined,
        timeRange: timeFilter !== "ALL" ? timeFilter : undefined,
        page: currentPage,
        size: pageSize,
      });
      setLogs(res.logs);
      if (res.metrics) {
        setMetrics(res.metrics);
      }
    } catch {
      setLoadError("Không tải được nhật ký hệ thống.");
    } finally {
      setLoading(false);
    }
  }, [search, eventFilter, timeFilter, currentPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
          label="Sự kiện hôm nay"
          value={metrics.eventsToday}
        />
        <MetricCard
          icon={LogIn}
          label="Lượt đăng nhập"
          value={metrics.loginCount}
        />
        <MetricCard
          icon={Sparkles}
          label="Lượt sinh case AI"
          value={metrics.aiGenerationsCount}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Lỗi cần xem"
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
            placeholder="Tìm trong nhật ký..."
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
            aria-label="Lọc theo loại sự kiện"
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="ALL">Mọi loại sự kiện</option>
            <option value="Đăng nhập">Đăng nhập</option>
            <option value="Sinh case">Sinh case AI</option>
            <option value="Nộp bài">Nộp bài</option>
            <option value="Tài liệu">Tài liệu</option>
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            aria-label="Lọc theo thời gian"
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="TODAY">Hôm nay</option>
            <option value="7_DAYS">7 ngày qua</option>
            <option value="30_DAYS">30 ngày qua</option>
            <option value="ALL">Tất cả thời gian</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sắp xếp"
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="NEWEST">Sắp xếp: Mới nhất</option>
            <option value="OLDEST">Sắp xếp: Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Logs Table (Figma 10.9) */}
      <div className="overflow-hidden rounded-eb-xl bg-surface shadow-eb-card">
        {loading ? (
          <div className="p-6">
            <SkeletonRegion label="Đang tải nhật ký..." className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 w-full rounded-eb-md bg-canvas/60" />
              ))}
            </SkeletonRegion>
          </div>
        ) : loadError ? (
          <div className="p-6">
            <ErrorState title="Lỗi tải nhật ký hệ thống" description={loadError} onRetry={loadData} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ScrollText}
              title="Không tìm thấy sự kiện nhật ký"
              description="Không có bản ghi nhật ký nào khớp với điều kiện lọc."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-line bg-canvas text-[12px] font-medium text-ink-secondary">
                <tr>
                  <th className="py-3 pr-4 pl-5">Người thực hiện</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Sự kiện</th>
                  <th className="px-4 py-3 text-center">Mã</th>
                  <th className="px-4 py-3 text-center">Chi tiết</th>
                  <th className="py-3 pr-5 pl-4 text-right">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredLogs.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
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
                          Xem chi tiết
                        </button>
                      </td>

                      {/* Column 6: Result Pill */}
                      <td className="py-3.5 pr-5 pl-4 text-right">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium",
                            isSuccess
                              ? "bg-success-bg text-success-text"
                              : "bg-error-bg text-error-text",
                          )}
                        >
                          <span
                            className={cx(
                              "size-1.5 rounded-full",
                              isSuccess ? "bg-success" : "bg-error",
                            )}
                          />
                          {isSuccess ? "Thành công" : "Cảnh báo"}
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
            Hiển thị {Math.min(filteredLogs.length, pageSize)} trên {metrics.eventsToday} sự kiện
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
              aria-label="Trang trước"
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
              aria-label="Trang sau"
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
          title={`Chi tiết sự kiện ${selectedLog.code}`}
          confirmLabel="Đóng"
          onConfirm={() => setSelectedLog(null)}
        >
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-ink-secondary">Người thực hiện:</span>
              <span className="font-semibold text-ink">{selectedLog.actorName} ({selectedLog.actorEmail})</span>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-ink-secondary">Thời gian:</span>
              <span className="font-medium text-ink">{selectedLog.timestamp}</span>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-ink-secondary">Hành động:</span>
              <span className="font-semibold text-ink">{selectedLog.eventTitle}</span>
            </div>
            {selectedLog.eventMeta && (
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-ink-secondary">Đối tượng liên quan:</span>
                <span className="font-medium text-ink">{selectedLog.eventMeta}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-ink-secondary">Chi tiết kỹ thuật:</span>
              <p className="rounded-eb-md bg-canvas p-3 font-mono text-[12px] text-ink">
                {selectedLog.details || "Không có chi tiết bổ sung."}
              </p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
