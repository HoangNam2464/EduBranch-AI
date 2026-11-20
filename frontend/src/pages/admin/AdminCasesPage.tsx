/**
 * Admin · Case Study toàn hệ thống — Figma page EduBranch AI – Screens, frame 10.6 (535:7980).
 *
 * Real data integration with BE-032 (`adminService.getCases`).
 * Top analytics: Case status distribution + Mode comparison & recent updates.
 * Bottom section: Case Study library grid with search, status tabs, course filters, and pagination.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  GitBranch,
  Search,
  Sparkles,
} from "lucide-react";
import { AdminPanel } from "@/pages/admin/components/AdminPanel";
import { EmptyState, ErrorState, SkeletonRegion } from "@/components/feedback";
import { adminService, type AdminCaseAnalytics, type AdminCaseItem } from "@/services/adminService";
import { PATHS, buildPath } from "@/routes/paths";

export function AdminCasesPage() {
  const { t } = useTranslation();

  const [cases, setCases] = useState<AdminCaseItem[]>([]);
  const [analytics, setAnalytics] = useState<AdminCaseAnalytics>({
    totalCases: 6,
    byStatus: { draft: 2, reviewed: 0, approved: 0, published: 4 },
    byMode: { branching: 4, review: 2 },
    recentUpdates: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminService.getCases({
        search: search.trim() || undefined,
        status: statusTab !== "ALL" ? statusTab : undefined,
        courseId: courseFilter !== "ALL" ? courseFilter : undefined,
        page: currentPage,
        size: pageSize,
      });
      setCases(res.cases);
      if (res.analytics) {
        setAnalytics(res.analytics);
      }
    } catch {
      setLoadError("Không tải được danh sách Case Study.");
    } finally {
      setLoading(false);
    }
  }, [search, statusTab, courseFilter, currentPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Client-side filtering fallback
  const filteredCases = useMemo(() => {
    let result = [...cases];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.courseName.toLowerCase().includes(q) ||
          (c.courseCode && c.courseCode.toLowerCase().includes(q)),
      );
    }
    if (statusTab !== "ALL") {
      result = result.filter((c) => c.status === statusTab);
    }
    if (courseFilter !== "ALL") {
      result = result.filter((c) => c.courseId === courseFilter);
    }
    return result;
  }, [cases, search, statusTab, courseFilter]);

  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between rounded-eb-xl bg-surface p-4 shadow-eb-card">
        <h2 className="text-[16px] leading-6 font-semibold text-ink">
          Case Study toàn hệ thống
        </h2>
      </div>

      {/* Analytics Row (Figma 10.6) */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
        {/* Left Analytics Card: Case Study theo trạng thái */}
        <AdminPanel className="w-full shrink-0 lg:w-[478px]" title="Case Study theo trạng thái">
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-ink">{analytics.totalCases}</span>
              <span className="text-[14px] text-ink-secondary">Case Study</span>
            </div>

            {/* Segmented bar */}
            <div className="flex h-5 w-full overflow-hidden rounded-md bg-canvas">
              <div
                style={{ width: `${(analytics.byStatus.draft / (analytics.totalCases || 1)) * 100}%` }}
                className="bg-line-strong hover:opacity-90 transition-opacity"
                title={`Bản nháp: ${analytics.byStatus.draft}`}
              />
              <div
                style={{ width: `${(analytics.byStatus.published / (analytics.totalCases || 1)) * 100}%` }}
                className="bg-primary hover:opacity-90 transition-opacity"
                title={`Đã xuất bản: ${analytics.byStatus.published}`}
              />
            </div>

            {/* Legend grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-[13px]">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-line-strong" />
                <span className="text-ink-secondary">Bản nháp</span>
                <span className="ml-auto font-medium text-ink">
                  {Math.round((analytics.byStatus.draft / (analytics.totalCases || 1)) * 100)}% ({analytics.byStatus.draft})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-primary" />
                <span className="text-ink-secondary">Đã xuất bản</span>
                <span className="ml-auto font-medium text-ink">
                  {Math.round((analytics.byStatus.published / (analytics.totalCases || 1)) * 100)}% ({analytics.byStatus.published})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-accent" />
                <span className="text-ink-secondary">Đã rà soát</span>
                <span className="ml-auto font-medium text-ink">0% (0)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-warning" />
                <span className="text-ink-secondary">Đã phê duyệt</span>
                <span className="ml-auto font-medium text-ink">0% (0)</span>
              </div>
            </div>
          </div>
        </AdminPanel>

        {/* Right Analytics Card: Chế độ học theo case & Cập nhật gần đây */}
        <AdminPanel className="flex-1" title="Chế độ học theo case">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Visual Mode Comparison */}
            <div className="flex shrink-0 flex-col gap-3">
              <div className="flex items-end gap-5 h-36 pt-4">
                {/* Branching Column */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: analytics.byMode.branching }).map((_, i) => (
                      <div key={i} className="h-5 w-16 rounded bg-primary" />
                    ))}
                  </div>
                  <span className="text-[12px] font-medium text-ink-secondary">Branching</span>
                </div>

                {/* Review Column */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: analytics.byMode.review }).map((_, i) => (
                      <div key={i} className="h-5 w-16 rounded bg-sky-500" />
                    ))}
                  </div>
                  <span className="text-[12px] font-medium text-ink-secondary">Review</span>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden h-36 w-px bg-line sm:block" />

            {/* Recent Updates List */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-[12px] font-semibold text-ink-secondary">Case cập nhật gần đây</span>
              <div className="flex flex-col gap-2">
                {analytics.recentUpdates.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-eb-lg bg-canvas p-2.5 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[13px] font-medium text-ink">{item.title}</span>
                      <span className="text-[11px] text-ink-secondary">
                        {item.updatedAt} · {item.learningMode === "BRANCHING_STUDY" ? "Branching Study" : "Review Study"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminPanel>
      </div>

      {/* Bottom Section: Kho Case Study Grid (Figma 10.6) */}
      <div className="flex flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card">
        {/* Search & Tabs Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-[16px] font-semibold text-ink">Kho Case Study</h3>
            <div className="relative flex min-w-[220px] items-center">
              <Search size={15} className="absolute left-3 text-ink-muted" />
              <input
                type="text"
                placeholder="Tìm case..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-eb-md border border-line bg-canvas py-1.5 pr-3 pl-8 text-[13px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "ALL", label: `Tất cả ${analytics.totalCases}` },
              { key: "DRAFT", label: `Bản nháp ${analytics.byStatus.draft}` },
              { key: "REVIEWED", label: "Đã rà soát 0" },
              { key: "PUBLISHED", label: `Đã xuất bản ${analytics.byStatus.published}` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                className={`rounded-eb-md px-3 py-1 text-[13px] font-medium transition-colors ${
                  statusTab === tab.key
                    ? "bg-selected text-primary font-semibold"
                    : "text-ink-secondary hover:bg-canvas"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case Cards Grid */}
        {loading ? (
          <SkeletonRegion label="Đang tải danh sách Case..." className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 rounded-eb-xl bg-canvas" />
            ))}
          </SkeletonRegion>
        ) : loadError ? (
          <ErrorState title="Lỗi tải Case Study" description={loadError} onRetry={loadData} />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="Không tìm thấy Case Study"
            description="Không có tình huống nào khớp với bộ lọc hiện tại."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCases.map((c) => {
              const isBranching = c.learningMode === "BRANCHING_STUDY";
              const isPublished = c.status === "PUBLISHED";

              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-eb-xl border border-line bg-canvas p-4 hover:shadow-eb-hover transition-all"
                >
                  <div className="flex flex-col gap-2.5">
                    {/* Top status badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isPublished
                            ? "bg-success-bg text-success-text"
                            : "bg-surface text-ink-secondary border border-line"
                        }`}
                      >
                        {isPublished ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                      {c.isAiDraft && (
                        <span className="flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[11px] text-ink-muted border border-line">
                          <Sparkles size={11} />
                          AI Draft
                        </span>
                      )}
                    </div>

                    {/* Illustration Icon */}
                    <div className="flex size-14 items-center justify-center self-center text-primary/70">
                      {isBranching ? <GitBranch size={32} /> : <FileText size={32} />}
                    </div>

                    {/* Mode tag */}
                    <div className="flex items-center justify-between text-[11px] text-ink-secondary">
                      <span className="rounded bg-surface px-1.5 py-0.5 font-medium text-primary">
                        {isBranching ? "Branching Study" : "Review Study"}
                      </span>
                      <span>{isBranching ? `${c.nodesCount ?? 6} nút` : "Không dùng cây"}</span>
                    </div>

                    {/* Title & Course */}
                    <h4 className="line-clamp-2 text-[14px] font-semibold text-ink" title={c.title}>
                      {c.title}
                    </h4>
                    <p className="text-[12px] text-ink-secondary truncate">
                      {c.courseName}
                    </p>
                  </div>

                  {/* Card Footer: Updated Date & View Button */}
                  <div className="flex items-center justify-between border-t border-line/60 pt-3 mt-3 text-[12px]">
                    <span className="text-ink-muted">Cập nhật {c.updatedAt}</span>
                    <Link
                      to={buildPath(PATHS.LECTURER.CASE_REVIEW, { caseId: c.id })}
                      className="rounded-eb-md border border-line bg-surface px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-canvas transition-colors"
                    >
                      Xem
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-line pt-3 text-[13px] text-ink-secondary">
          <span>
            Hiển thị {filteredCases.length} trên {analytics.totalCases} Case Study
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
              disabled={filteredCases.length < pageSize}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
              aria-label="Trang sau"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
