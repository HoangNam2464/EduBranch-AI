/**
 * Admin · Khóa học toàn hệ thống — Figma page EduBranch AI – Screens, frame 10.5 (535:7402).
 *
 * Real data integration with BE-032 (`adminService.getCourses`).
 * Split layout: Course cards list on the left + Course detail panel on the right.
 * Features search, status filters, detailed course overview, and pagination.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { mapAdminHttpErrorToKey } from "@/pages/admin/adminErrorHelper";
import { PATHS } from "@/routes/paths";
import { cx } from "@/components/ds";

export function AdminCoursesPage() {
  const { t } = useTranslation();

  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Filters & Selection
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState<AdminCourseItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const reload = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setReloadToken((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getCourses({
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page: currentPage,
        size: pageSize,
      })
      .then((res) => {
        if (cancelled) return;
        setCourses(res.courses ?? []);
        setTotalCount(res.total ?? 0);
        setSelectedCourse((prev) => {
          if (prev && res.courses?.some((c) => c.id === prev.id)) {
            return res.courses.find((c) => c.id === prev.id) ?? null;
          }
          return res.courses?.[0] ?? null;
        });
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
  }, [search, statusFilter, currentPage, reloadToken]);

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
          {t("g6.courses.header")}
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex min-w-[240px] items-center">
            <Search size={16} className="absolute left-3 text-ink-muted" />
            <input
              type="text"
              placeholder={t("g6.courses.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-eb-md border border-line bg-canvas py-1.5 pr-3 pl-9 text-[14px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={t("g6.courses.filterStatusAria")}
            className="rounded-eb-md border border-line bg-canvas px-3 py-1.5 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="ALL">{t("g6.courses.filterStatus.all")}</option>
            <option value="ACTIVE">{t("g6.courses.filterStatus.active")}</option>
            <option value="ARCHIVED">{t("g6.courses.filterStatus.archived")}</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left Courses List + Right Drawer Detail */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left Column: Course Cards List */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {loading ? (
            <SkeletonRegion label={t("g6.courses.loading")} className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 w-full rounded-eb-xl bg-surface p-4 shadow-eb-card" />
              ))}
            </SkeletonRegion>
          ) : loadError ? (
            <div className="rounded-eb-xl bg-surface p-6 shadow-eb-card">
              <ErrorState title={t("g6.courses.loadErrorTitle")} description={t(loadError)} onRetry={reload} />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-eb-xl bg-surface p-8 shadow-eb-card">
              <EmptyState
                icon={BookOpen}
                title={t("g6.courses.emptyFilteredTitle")}
                description={t("g6.courses.emptyFilteredDescription")}
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
                      <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap", c.status === "ARCHIVED" ? "bg-canvas text-ink-secondary" : "bg-success-bg text-success-text")}>
                        <span className={cx("size-1.5 rounded-full", c.status === "ARCHIVED" ? "bg-ink-muted" : "bg-success")} />
                        {c.status === "ARCHIVED" ? t("g6.courses.status.archived") : t("g6.courses.status.teaching")}
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
                          {t("g6.courses.stats.materials", {
                            ready: c.materialsReady,
                            total: c.materialsCount,
                          })}
                        </span>
                        <span>{t("g6.courses.stats.cases", { count: c.casesCount })}</span>
                      </div>
                      {c.errorCount && c.errorCount > 0 ? (
                        <span className="font-medium text-error-text">
                          {t("g6.courses.stats.indexingError", { count: c.errorCount })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              <div className="flex items-center justify-between rounded-eb-xl bg-surface px-4 py-3 text-[13px] text-ink-secondary shadow-eb-card">
                <span>
                  {t("g6.courses.pagination.showing", {
                    shown: filteredCourses.length,
                    total: totalCount,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
                    aria-label={t("g6.courses.pagination.prev")}
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
                    aria-label={t("g6.courses.pagination.next")}
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
              <h3 className="text-[16px] font-semibold text-ink">{t("g6.courses.detail.title")}</h3>
              <div className="flex items-center gap-2">
                <Link
                  to={PATHS.ADMIN.CASES}
                  className="text-[13px] font-medium text-link hover:underline"
                >
                  {t("g6.courses.detail.viewDetail")}
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="rounded p-1 text-ink-muted hover:bg-canvas hover:text-ink"
                  aria-label={t("g6.courses.detail.close")}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Course Brand Banner Card */}
            <div className="relative mt-4 flex h-36 flex-col justify-between overflow-hidden rounded-eb-xl bg-primary p-4 text-white">
              <span className="self-start rounded bg-white/20 px-2 py-0.5 text-[12px] font-bold text-white uppercase backdrop-blur-xs">
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
                <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap", selectedCourse.status === "ARCHIVED" ? "bg-canvas text-ink-secondary" : "bg-success-bg text-success-text")}>
                        <span className={cx("size-1.5 rounded-full", selectedCourse.status === "ARCHIVED" ? "bg-ink-muted" : "bg-success")} />
                  {selectedCourse.status === "ARCHIVED" ? t("g6.courses.status.archived") : t("g6.courses.status.teaching")}
                </span>
              </div>
            </div>

            {/* 3 Metric Tiles (Figma 10.5) */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-eb-lg bg-canvas p-3 text-center">
              <div className="flex flex-col">
                <span className="text-[12px] text-ink-secondary">{t("g6.courses.detail.attempts")}</span>
                <span className="text-[16px] font-bold text-ink">
                  {selectedCourse.attemptsCount ?? 0}
                </span>
              </div>
              <div className="flex flex-col border-x border-line/60">
                <span className="text-[12px] text-ink-secondary">{t("g6.courses.detail.materials")}</span>
                <span className="text-[16px] font-bold text-ink">
                  {selectedCourse.materialsCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-ink-secondary">{t("g6.courses.detail.cases")}</span>
                <span className="text-[16px] font-bold text-ink">
                  {selectedCourse.casesCount}
                </span>
              </div>
            </div>

            {/* Section: Về khóa học */}
            {selectedCourse.description && (
              <div className="mt-4 flex flex-col gap-1.5">
                <h5 className="text-[13px] font-semibold text-ink">{t("g6.courses.detail.about")}</h5>
                <p className="text-[13px] leading-5 text-ink-secondary">
                  {selectedCourse.description}
                </p>
              </div>
            )}

            {/* Section: Thông tin khóa học */}
            <div className="mt-4 flex flex-col gap-2 border-t border-line/60 pt-3 text-[13px]">
              <h5 className="font-semibold text-ink">{t("g6.courses.detail.infoTitle")}</h5>
              <div className="flex flex-col gap-1.5 text-ink-secondary">
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted">{t("g6.courses.detail.courseCode")}</span>
                  <span className="font-medium text-ink">{selectedCourse.courseCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted">{t("g6.courses.detail.statusLabel")}</span>
                  <span className="font-medium text-ink">
                    {selectedCourse.status === "ARCHIVED" ? t("g6.courses.detail.statusArchived") : t("g6.courses.detail.statusOpen")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted">{t("g6.courses.detail.lecturerLabel")}</span>
                  <span className="font-medium text-ink">{selectedCourse.lecturerName}</span>
                </div>
              </div>
            </div>

            {/* Section: Đi tới */}
            <div className="mt-4 flex flex-col gap-2 border-t border-line/60 pt-3 text-[13px]">
              <h5 className="font-semibold text-ink">{t("g6.courses.detail.navTitle")}</h5>
              <div className="flex flex-col gap-2">
                <Link
                  to={PATHS.ADMIN.CASES}
                  className="flex items-center justify-between rounded-eb-lg bg-canvas p-3 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-ink">{t("g6.courses.detail.navMaterials")}</span>
                      <span className="text-[12px] text-ink-secondary">
                        {t("g6.courses.detail.navMaterialsSub", {
                          count: selectedCourse.materialsCount,
                          ready: selectedCourse.materialsReady,
                          errorPart: selectedCourse.errorCount
                            ? t("g6.courses.detail.navMaterialsError", { count: selectedCourse.errorCount })
                            : "",
                        })}
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
                      <span className="font-medium text-ink">{t("g6.courses.detail.navCases")}</span>
                      <span className="text-[12px] text-ink-secondary">
                        {t("g6.courses.detail.navCasesSub", { count: selectedCourse.casesCount })}
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
