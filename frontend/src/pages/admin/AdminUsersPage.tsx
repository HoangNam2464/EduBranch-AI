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
import { EmptyState, ErrorState, SkeletonRegion } from "@/components/feedback";
import { adminService, type AdminUserItem } from "@/services/adminService";

export function AdminUsersPage() {
  const { t } = useTranslation();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 186,
    lecturers: 12,
    students: 172,
    lockedUsers: 2,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminService.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page: currentPage,
        size: pageSize,
      });
      setUsers(res.users);
      if (res.metrics) {
        setMetrics(res.metrics);
      }
    } catch {
      setLoadError(t("g6.users.emptyDescription"));
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, currentPage, t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
          ? `Đã khóa tài khoản ${selectedUser.name}`
          : `Đã mở khóa tài khoản ${selectedUser.name}`,
      );
    } catch {
      setToastMessage("Có lỗi xảy ra khi thay đổi trạng thái tài khoản.");
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
          label="Tổng người dùng"
          value={metrics.totalUsers}
        />
        <MetricCard
          icon={GraduationCap}
          label="Giảng viên"
          value={metrics.lecturers}
        />
        <MetricCard
          icon={UserCheck}
          label="Sinh viên"
          value={metrics.students}
        />
        <MetricCard
          icon={Lock}
          label="Tài khoản bị khóa"
          value={metrics.lockedUsers}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-eb-xl bg-surface p-4 shadow-eb-card">
        {/* Search */}
        <div className="relative flex min-w-[280px] flex-1 items-center">
          <Search size={16} className="absolute left-3 text-ink-muted" />
          <input
            type="text"
            placeholder="Tìm hoặc email người dùng..."
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
            aria-label="Lọc theo vai trò"
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="ALL">Mọi vai trò</option>
            <option value="LECTURER">Giảng viên</option>
            <option value="STUDENT">Sinh viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Lọc theo trạng thái"
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sắp xếp"
            className="rounded-eb-md border border-line bg-canvas px-3 py-2 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            <option value="NEWEST">Sắp xếp: Mới tạo</option>
            <option value="NAME">Sắp xếp: Tên A-Z</option>
          </select>
        </div>
      </div>

      {/* User Table (Figma 10.3) */}
      <div className="overflow-hidden rounded-eb-xl bg-surface shadow-eb-card">
        {loading ? (
          <div className="p-6">
            <SkeletonRegion label="Đang tải danh sách người dùng..." className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 w-full rounded-eb-md bg-canvas/60" />
              ))}
            </SkeletonRegion>
          </div>
        ) : loadError ? (
          <div className="p-6">
            <ErrorState title="Lỗi tải dữ liệu người dùng" description={loadError} onRetry={loadData} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="Không tìm thấy người dùng"
              description="Không có tài khoản người dùng nào khớp với bộ lọc hiện tại."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-line bg-canvas text-[12px] font-medium text-ink-secondary">
                <tr>
                  <th className="py-3 pr-4 pl-5">Người dùng</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Vai trò & Khóa học</th>
                  <th className="px-4 py-3 text-center">Lượt làm</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                  <th className="py-3 pr-5 pl-4 text-right">Trạng thái</th>
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
                      <td className="px-4 py-3.5 text-ink-secondary">
                        {user.createdAt}
                      </td>

                      {/* Column 3: Role & Courses */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-ink">
                            {user.role === "LECTURER"
                              ? "Giảng viên"
                              : user.role === "ADMIN"
                              ? "Quản trị viên"
                              : "Sinh viên"}
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
                          {isLocked ? "Mở khóa" : "Khóa tài khoản"}
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
                          {isLocked ? "Đã khóa" : "Hoạt động"}
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
            Hiển thị {Math.min(filteredUsers.length, pageSize)} trên {metrics.totalUsers} người dùng
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
              disabled={filteredUsers.length < pageSize}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex size-7 items-center justify-center rounded border border-line text-ink disabled:opacity-40"
              aria-label="Trang sau"
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
              ? `Khóa tài khoản ${selectedUser.name}?`
              : `Mở khóa tài khoản ${selectedUser.name}?`
          }
          description={
            actionType === "LOCK"
              ? "Người dùng sẽ không đăng nhập được cho tới khi được mở khóa. Lượt làm, bài nộp và suy ngẫm vẫn được giữ nguyên."
              : "Người dùng sẽ có thể đăng nhập lại và tiếp tục truy cập các học phần bình thường."
          }
          confirmLabel={actionType === "LOCK" ? "Khóa tài khoản" : "Mở khóa"}
          cancelLabel="Hủy bỏ"
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
