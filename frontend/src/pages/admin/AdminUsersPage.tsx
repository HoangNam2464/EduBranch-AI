/**
 * Admin · Quản lý người dùng — Figma page EduBranch AI – Screens, frames 10.3 (533:7204) and 10.4 (534:7373, lock dialog).
 *
 * Real data integration with BE-032 (`adminService.getUsers`, `adminService.toggleUserLock`).
 * Includes KPI metrics cards, filter by search/role/status, straight column alignment,
 * lock/unlock confirmation dialog (10.4), loading/empty/error states, and pagination.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Lock,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { Dialog, MetricCard, Toast, ToastRegion, cx } from "@/components/ds";
import { EmptyState, ErrorState, SkeletonRegion, formatDateTime, isValidDate } from "@/components/feedback";
import { adminService, type AdminUserItem } from "@/services/adminService";
import { mapAdminHttpErrorToKey } from "@/pages/admin/adminErrorHelper";

export function AdminUsersPage() {
  const { t } = useTranslation();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    lecturers: 0,
    students: 0,
    lockedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Rule F2: KPI cards show "—" until real metrics arrive, and again after a failed load — never a placeholder 0.
  const [metricsReady, setMetricsReady] = useState(false);
  const kpi = (value: number) => (metricsReady && !loadError ? value : "—");
  const [reloadToken, setReloadToken] = useState(0);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dialog State (Figma 10.4)
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [actionType, setActionType] = useState<"LOCK" | "UNLOCK">("LOCK");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setReloadToken((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page: currentPage,
        size: pageSize,
      })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.users ?? []);
        if (res.metrics) {
          setMetrics(res.metrics);
          setMetricsReady(true);
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
  }, [search, roleFilter, statusFilter, currentPage, reloadToken]);

  // Client-side filtering when mock/local data is active
  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (statusFilter !== "ALL") {
      result = result.filter((u) => u.status === statusFilter);
    }
    return result;
  }, [users, search, roleFilter, statusFilter]);

  const handleOpenDialog = (user: AdminUserItem) => {
    setSelectedUser(user);
    setActionType(user.status === "LOCKED" ? "UNLOCK" : "LOCK");
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    const newIsLocked = actionType === "LOCK";
    try {
      await adminService.toggleUserLock(selectedUser.id, newIsLocked);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, status: newIsLocked ? "LOCKED" : "ACTIVE" }
            : u,
        ),
      );
      setToastMessage(
        newIsLocked
          ? t("g6.users.toast.lockSuccess", { name: selectedUser.name })
          : t("g6.users.toast.unlockSuccess", { name: selectedUser.name }),
      );
    } catch {
      setToastMessage(t("g6.users.toast.actionError"));
    } finally {
      setIsDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      {/* Toast Region */}
      {toastMessage && (
        <ToastRegion>
          <Toast
            type="info"
            title={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        </ToastRegion>
      )}

      {/* KPI Cards (Figma 10.3) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label={t("g6.users.kpi.totalUsers")}
          value={kpi(metrics.totalUsers)}
        />
        <MetricCard
          icon={GraduationCap}
          label={t("g6.users.kpi.lecturers")}
          value={kpi(metrics.lecturers)}
        />
        <MetricCard
          icon={UserCheck}
          label={t("g6.users.kpi.students")}
          value={kpi(metrics.students)}
        />
        <MetricCard
          icon={Lock}
          label={t("g6.users.kpi.lockedUsers")}
          value={kpi(metrics.lockedUsers)}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-eb-xl bg-surface p-4 shadow-eb-card">
        {/* Search */}
        <div className="relative flex min-w-[280px] flex-1 items-center">
          <Search size={16} className="absolute left-3 text-ink-muted" />
          <input
            type="text"
            placeholder={t("g6.users.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-eb-md border border-line bg-canvas py-2 pr-3 pl-9 text-[14px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label={t("g6.users.filterRoleAria")}
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="ALL">{t("g6.users.filterRole.all")}</option>
            <option value="LECTURER">{t("g6.users.filterRole.lecturer")}</option>
            <option value="STUDENT">{t("g6.users.filterRole.student")}</option>
            <option value="ADMIN">{t("g6.users.filterRole.admin")}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={t("g6.users.filterStatusAria")}
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="ALL">{t("g6.users.filterStatus.all")}</option>
            <option value="ACTIVE">{t("g6.users.filterStatus.active")}</option>
            <option value="LOCKED">{t("g6.users.filterStatus.locked")}</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label={t("g6.users.sortAria")}
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="NEWEST">{t("g6.users.sort.newest")}</option>
            <option value="NAME">{t("g6.users.sort.name")}</option>
          </select>
        </div>
      </div>

      {/* User Table (Figma 10.3) */}
      <div className="overflow-hidden rounded-eb-xl bg-surface shadow-eb-card">
        {loading ? (
          <div className="p-6">
            <SkeletonRegion label={t("g6.users.loading")} className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 w-full rounded-eb-md bg-canvas/60" />
              ))}
            </SkeletonRegion>
          </div>
        ) : loadError ? (
          <div className="p-6">
            <ErrorState title={t("g6.users.loadErrorTitle")} description={t(loadError)} onRetry={reload} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title={t("g6.users.emptyFilteredTitle")}
              description={t("g6.users.emptyFilteredDescription")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-line bg-canvas text-[12px] font-medium text-ink-secondary">
                <tr>
                  <th className="py-3 pr-4 pl-5">{t("g6.users.columns.user")}</th>
                  <th className="px-4 py-3">{t("g6.users.columns.createdAt")}</th>
                  <th className="px-4 py-3">{t("g6.users.columns.role")}</th>
                  <th className="px-4 py-3 text-center">{t("g6.users.columns.attempts")}</th>
                  <th className="px-4 py-3 text-center">{t("g6.users.columns.action")}</th>
                  <th className="py-3 pr-5 pl-4 text-right">{t("g6.users.columns.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredUsers.map((user) => {
                  const isLocked = user.status === "LOCKED";
                  const initials = user.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(-2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase() || "ND";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-surface-hover/50 transition-colors"
                    >
                      {/* Column 1: User */}
                      <td className="py-3.5 pr-4 pl-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-eb-full bg-primary-subtle text-[13px] font-semibold text-primary">
                            {initials}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-ink">{user.name}</span>
                            <span className="text-[12px] text-ink-secondary">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Created Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-ink-secondary">
                        {isValidDate(new Date(user.createdAt)) ? formatDateTime(new Date(user.createdAt)) : "—"}
                      </td>

                      {/* Column 3: Role & Courses */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-ink">
                            {user.role === "LECTURER"
                              ? t("g6.users.role.lecturer")
                              : user.role === "ADMIN"
                              ? t("g6.users.role.admin")
                              : t("g6.users.role.student")}
                          </span>
                          {user.coursesInfo && (
                            <span className="text-[12px] text-ink-secondary">
                              {user.coursesInfo}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Attempts */}
                      <td className="px-4 py-3.5 text-center font-medium text-ink">
                        {user.attemptCount !== undefined ? user.attemptCount : "—"}
                      </td>

                      {/* Column 5: Action Button */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDialog(user)}
                          className={cx(
                            "rounded-eb-md px-3 py-1 text-[13px] font-medium transition-colors border",
                            isLocked
                              ? "border-primary text-primary hover:bg-primary-subtle"
                              : "border-line text-ink hover:bg-canvas hover:text-error",
                          )}
                        >
                          {isLocked ? t("g6.users.action.unlock") : t("g6.users.action.lock")}
                        </button>
                      </td>

                      {/* Column 6: Status Pill */}
                      <td className="py-3.5 pr-5 pl-4 text-right">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium",
                            isLocked
                              ? "bg-error-bg text-error-text"
                              : "bg-success-bg text-success-text",
                          )}
                        >
                          <span
                            className={cx(
                              "size-1.5 rounded-full",
                              isLocked ? "bg-error" : "bg-success",
                            )}
                          />
                          {isLocked ? t("g6.users.status.locked") : t("g6.users.status.active")}
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
            {t("g6.users.pagination.showing", {
              shown: Math.min(filteredUsers.length, pageSize),
              total: metrics.totalUsers,
            })}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
              aria-label={t("g6.users.pagination.prev")}
            >
              &lt;
            </button>
            <span className="flex size-7 items-center justify-center rounded bg-primary text-[12px] font-semibold text-white">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={filteredUsers.length < pageSize}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
              aria-label={t("g6.users.pagination.next")}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* User Lock / Unlock Confirmation Dialog (Figma 10.4) */}
      {selectedUser && (
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type={actionType === "LOCK" ? "destructive" : "confirm"}
          title={
            actionType === "LOCK"
              ? t("g6.users.dialog.lockTitle", { name: selectedUser.name })
              : t("g6.users.dialog.unlockTitle", { name: selectedUser.name })
          }
          description={
            actionType === "LOCK"
              ? t("g6.users.dialog.lockDescription")
              : t("g6.users.dialog.unlockDescription")
          }
          confirmLabel={
            actionType === "LOCK"
              ? t("g6.users.dialog.lockConfirm")
              : t("g6.users.dialog.unlockConfirm")
          }
          cancelLabel={t("g6.users.dialog.cancel")}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
