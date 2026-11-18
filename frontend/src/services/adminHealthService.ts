/**
 * EduBranch AI — Admin system health (Figma 10.2 "Tình trạng hệ thống").
 * Reads the public backend health check `GET /health` (200 = all UP, 503 = DEGRADED with the same body).
 */
import apiClient from "@/services/apiClient";
import { toSystemHealth, type HealthResponseBody, type SystemHealth } from "@/services/mappers/adminHealth";

export const adminHealthService = {
  async getSystemHealth(): Promise<SystemHealth> {
    const res = await apiClient.get<HealthResponseBody>("/health", {
      validateStatus: (status) => status === 200 || status === 503,
    });
    return toSystemHealth(res.data);
  },
};
