/**
 * EduBranch AI — Admin Service
 * System overview, user management, and platform analytics (BE-032 / FE-031).
 * Restricted strictly to ADMIN role.
 */

import apiClient from "@/services/apiClient";
import { toAdminOverview, type AdminOverview, type AdminOverviewRow } from "@/services/mappers/adminOverview";

type Envelope<T> = { status: string; data: T };

export const adminService = {
  /**
   * System overview and dashboard metrics for Admin (`GET /admin/overview`, BE-032 / FE-031).
   * Restricted strictly to ADMIN role.
   */
  async getOverview(): Promise<AdminOverview> {
    const res = await apiClient.get<Envelope<AdminOverviewRow>>("/admin/overview");
    return toAdminOverview(res.data.data);
  },
};
