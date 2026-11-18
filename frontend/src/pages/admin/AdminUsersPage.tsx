/**
 * Admin · Quản lý người dùng — Figma page EduBranch AI – Screens, frames 10.3 (533:7204) and 10.4 (534:7373, lock dialog).
 *
 * Real data only: the backend has no admin user endpoints yet (no `@Roles("ADMIN")`
 * controller), so the KPI cards, the user table and the lock / unlock action are not
 * rendered. The list area ("Student list": white, radius 18, padding 20) shows the shared
 * empty state until `GET /admin/users` and `PATCH /admin/users/:id/status` exist.
 */
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/feedback";

export function AdminUsersPage() {
  const { t } = useTranslation();
  return (
    <EmptyState icon={Users} title={t("g6.users.emptyTitle")} description={t("g6.users.emptyDescription")} />
  );
}
