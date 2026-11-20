/**
 * Admin · Khóa học toàn hệ thống — Figma page EduBranch AI – Screens, frame 10.5 (535:7402).
 *
 * Real data integration with BE-032 (`adminService.getCourses`).
 * Split layout: Course cards list on the left + Course detail panel on the right.
 * Features search, status filters, detailed course overview, and pagination.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  Database,
  FileText,
  GitBranch,
  Layers,
  Search,
  Shield,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { EmptyState, ErrorState, SkeletonRegion } from "@/components/feedback";
import { adminService, type AdminCourseItem } from "@/services/adminService";
import { PATHS } from "@/routes/paths";

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [totalCount, setTotalCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters & Selection
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState<AdminCourseItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminService.getCourses({
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page: currentPage,
        size: pageSize,
      });
      setCourses(res.courses);
      setTotalCount(res.total);
      if (res.courses.length > 0 && !selectedCourse) {
        setSelectedCourse(res.courses[0]);
      }
    } catch {
      setLoadError("Không tải được danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage, selectedCourse]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Client-side filtering fallback
  const filteredCourses = useMemo(() => {
    let result = [...courses];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.courseCode.toLowerCase().includes(q) ||
          c.lecturerName.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }
    return result;
  }, [courses, search, statusFilter]);

  const courseIcons = [Shield, Layers, Database, TrendingUp, BookOpen, Users];

  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      {/* Top Filter Bar (Figma 10.5) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-eb-xl bg-surface p-4 shadow-eb-card">
        <h2 className="text-[16px] leading-6 font-semibold text-ink">
          Khóa học toàn hệ thống
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex min-w-[240px] items-center">
            <Search size={16} className="absolute left-3 text-ink-muted" />
            <input
              type="text"
              placeholder="Tìm khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-eb-md border border-line bg-canvas py-1.5 pr-3 pl-9 text-[14px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Lọc theo trạng thái"
            className="rounded-eb-md border border-line bg-canvas px-3 py-1.5 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang mở</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left Courses List + Right Drawer Detail */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left Column: Course Cards List */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {loading ? (
            <SkeletonRegion label="Đang tải danh sách khóa học..." className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 w-full rounded-eb-xl bg-surface p-4 shadow-eb-card" />
              ))}
            </SkeletonRegion>
          ) : loadError ? (
            <div className="rounded-eb-xl bg-surface p-6 shadow-eb-card">
              <ErrorState title="Lỗi tải danh sách khóa học" description={loadError} onRetry={loadData} />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-eb-xl bg-surface p-8 shadow-eb-card">
              <EmptyState
                icon={BookOpen}
                title="Không có khóa học nào"
                description="Không tìm thấy khóa học nào phù hợp với điều kiện tìm kiếm."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredCourses.map((c, idx) => {
                const IconComp = courseIcons[idx % courseIcons.length];
                const isSelected = selectedCourse?.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourse(c)}
                    className={`group relative flex cursor-pointer flex-col gap-3 rounded-eb-xl bg-surface p-4.5 transition-all shadow-eb-card border ${
                      isSelected
                        ? "border-primary ring-1 ring-primary/20"
                        : "border-transparent hover:border-line hover:shadow-eb-hover"
                    }`}
                  >
                    {/* Top Row: Code and Status */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[12px] font-medium text-success-text">
                        <span className="size-1.5 rounded-full bg-success" />
                        Đang dạy
                      </span>
                      <span className="rounded bg-canvas px-2 py-0.5 text-[12px] font-semibold text-ink-secondary">
                        {c.courseCode}
                      </span>
                    </div>

                    {/* Middle Row: Icon & Info */}
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-eb-lg bg-selected text-primary">
                        <IconComp size={22} strokeWidth={1.75} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 className="truncate text-[15px] font-semibold text-ink group-hover:text-primary transition-colors">
                          {c.name}
                        </h3>
                        <p className="text-[13px] text-ink-secondary">
                          {c.lecturerName}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Stats and warnings */}
                    <div className="flex flex-wrap items-center justify-between border-t border-line/60 pt-2.5 text-[12px] text-ink-secondary">
                      <div className="flex items-center gap-4">
                        <span>
                          {c.materialsReady}/{c.materialsCount} tài liệu sẵn sàng
                        </span>
                        <span>{c.casesCount} case</span>
                      </div>
                      {c.errorCount && c.errorCount > 0 ? (
                        <span className="font-medium text-error-text">
                          {c.errorCount} tệp lỗi lập chỉ mục
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              <div className="flex items-center justify-between rounded-eb-xl bg-surface px-4 py-3 text-[13px] text-ink-secondary shadow-eb-card">
                <span>
                  Hiển thị {filteredCourses.length} trên {totalCount} khóa học
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
                    disabled={filteredCourses.length < pageSize}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
                    aria-label="Trang sau"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Course Detail Panel (Figma 10.5) */}
        {selectedCourse && (
          <div className="w-full shrink-0 flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card lg:w-[380px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-[16px] font-semibold text-ink">Chi tiết khóa học</h3>
              <div className="flex items-center gap-2">
                <Link
                  to={PATHS.ADMIN.CASES}
                  className="text-[13px] font-medium text-link hover:underline"
                >
                  Xem chi tiết
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="rounded p-1 text-ink-muted hover:bg-canvas hover:text-ink"
                  aria-label="Đóng chi tiết"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Course Brand Banner Card */}
            <div className="relative mt-4 flex h-36 flex-col justify-between overflow-hidden rounded-eb-xl bg-primary p-4 text-white">
              <span className="self-start rounded bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white uppercase backdrop-blur-xs">
                {selectedCourse.courseCode}
              </span>
              <div className="flex items-center justify-center">
                <Shield size={48} strokeWidth={1.5} className="text-white/80" />
              </div>
            </div>

            {/* Course Title & Lecturer */}
            <div className="mt-3 flex flex-col gap-1">
              <h4 className="text-[16px] font-bold text-ink">
                {selectedCourse.name}
              </h4>
              <p className="text-[13px] text-ink-secondary">
                {selectedCourse.lecturerName}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[12px] font-medium text-success-text">
                  <span className="size-1.5 rounded-full bg-success" />
                  Đang dạy
                </span>
              </div>
            </div>

            {/* 3 Metric Tiles (Figma 10.5) */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-eb-lg bg-canvas p-3 text-center">
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-secondary">Lượt làm bài</span>
                <span className="text-[16px] font-bold text-ink">
                  {selectedCourse.attemptsCount ?? 58}
                </span>
              </div>
              <div className="flex flex-col border-x border-line/60">
                <span className="text-[11px] text-ink-secondary">Tài liệu</span>
                <span className="text-[16px] font-bold text-ink">
                  {selectedCourse.materialsCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-secondary">Case Study</span>
                <span className="text-[16px] font-bold text-ink">
                  {selectedCourse.casesCount}
                </span>
              </div>
            </div>

            {/* Section: Về khóa học */}
            {selectedCourse.description && (
              <div className="mt-4 flex flex-col gap-1.5">
                <h5 className="text-[13px] font-semibold text-ink">Về khóa học</h5>
                <p className="text-[13px] leading-5 text-ink-secondary">
                  {selectedCourse.description}
                </p>
              </div>
            )}

            {/* Section: Thông tin khóa học */}
            <div className="mt-4 flex flex-col gap-2 border-t border-line/60 pt-3 text-[13px]">
              <h5 className="font-semibold text-ink">Thông tin khóa học</h5>
              <div className="flex flex-col gap-1.5 text-ink-secondary">
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted">Mã học phần:</span>
                  <span className="font-medium text-ink">{selectedCourse.courseCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted">Trạng thái:</span>
                  <span className="font-medium text-ink">Đang mở cho sinh viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted">Giảng viên phụ trách:</span>
                  <span className="font-medium text-ink">{selectedCourse.lecturerName}</span>
                </div>
              </div>
            </div>

            {/* Section: Đi tới */}
            <div className="mt-4 flex flex-col gap-2 border-t border-line/60 pt-3 text-[13px]">
              <h5 className="font-semibold text-ink">Đi tới</h5>
              <div className="flex flex-col gap-2">
                <Link
                  to={PATHS.ADMIN.CASES}
                  className="flex items-center justify-between rounded-eb-lg bg-canvas p-3 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-ink">Tài liệu môn học</span>
                      <span className="text-[11px] text-ink-secondary">
                        {selectedCourse.materialsCount} tệp - {selectedCourse.materialsReady} sẵn sàng
                        {selectedCourse.errorCount ? `, ${selectedCourse.errorCount} lỗi` : ""}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-ink-muted" />
                </Link>

                <Link
                  to={PATHS.ADMIN.CASES}
                  className="flex items-center justify-between rounded-eb-lg bg-canvas p-3 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch size={18} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-ink">Case Study</span>
                      <span className="text-[11px] text-ink-secondary">
                        {selectedCourse.casesCount} case
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-ink-muted" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
