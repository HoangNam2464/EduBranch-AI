/**
 * EduBranch AI — Lecturer Dashboard Service (FE-027 on BE-030).
 * `GET /lecturer/dashboard`: aggregates limited to the courses the signed-in lecturer owns.
 */

import apiClient from "@/services/apiClient";
import { toLecturerDashboard, type LecturerDashboard, type LecturerDashboardRow } from "@/services/mappers/lecturerDashboard";

type Envelope<T> = { status: string; data: T };

export const lecturerDashboardService = {
  async getDashboard(): Promise<LecturerDashboard> {
    const res = await apiClient.get<Envelope<LecturerDashboardRow>>("/lecturer/dashboard");
    return toLecturerDashboard(res.data?.data);
  },
};
