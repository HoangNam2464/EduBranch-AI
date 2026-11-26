/**
 * EduBranch AI — Admin Service
 * System overview, user management, course oversight, case governance,
 * AI service status, system activity logs, and platform settings (BE-032 / FE-031 / FE-032).
 * Restricted strictly to ADMIN role.
 *
 * RULE: Admin cannot inspect private student reasoning or detailed submissions (AC-3).
 * RULE: No fake data or mock fallbacks; errors propagate to the UI (CLAUDE.md / FE-COMMON-RULES).
 */

import apiClient from "@/services/apiClient";
import { toAdminOverview, type AdminOverview, type AdminOverviewRow } from "@/services/mappers/adminOverview";

type Envelope<T> = { status?: string; success?: boolean; data: T };

function extractData<T>(res: { data: any }): T {
  if (res.data && typeof res.data === "object" && "data" in res.data) {
    return res.data.data;
  }
  return res.data;
}

// ============================================================================
// Types
// ============================================================================

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  coursesInfo?: string;
  attemptCount?: number;
  status: "ACTIVE" | "LOCKED";
}

export interface AdminUsersResponse {
  users: AdminUserItem[];
  metrics: {
    totalUsers: number;
    lecturers: number;
    students: number;
    lockedUsers: number;
  };
  total: number;
  page: number;
  size: number;
}

export interface AdminCourseItem {
  id: string;
  name: string;
  courseCode: string;
  lecturerName: string;
  status: "ACTIVE" | "ARCHIVED";
  materialsCount: number;
  materialsReady: number;
  casesCount: number;
  errorCount?: number;
  description?: string;
  attemptsCount?: number;
  createdAt?: string;
}

export interface AdminCaseItem {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  learningMode: "BRANCHING_STUDY" | "REVIEW_STUDY";
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";
  isAiDraft?: boolean;
  nodesCount?: number;
  updatedAt: string;
}

export interface AdminCaseAnalytics {
  totalCases: number;
  byStatus: {
    draft: number;
    reviewed: number;
    approved: number;
    published: number;
  };
  byMode: {
    branching: number;
    review: number;
  };
  recentUpdates: Array<{
    id: string;
    title: string;
    updatedAt: string;
    learningMode: "BRANCHING_STUDY" | "REVIEW_STUDY";
  }>;
}

export interface AdminAiGenerationLog {
  id: string;
  caseTitle: string;
  courseCode: string;
  lecturerName: string;
  createdAt: string;
  durationSeconds: number;
  decisionsCount?: number;
  materialsCitedCount?: number;
  status: "COMPLETED" | "TIMEOUT" | "FAILED";
  learningMode?: string;
  note?: string;
}

export interface AdminAiIndexingLog {
  id: string;
  filename: string;
  courseCode: string;
  status: "COMPLETED" | "PENDING" | "PROCESSING" | "FAILED";
  progressPercent?: number;
  chunksCount?: number;
  errorMessage?: string;
}

export interface AdminAiServiceData {
  metrics: {
    totalGenerated: number;
    avgDurationSeconds: number;
    readyMaterials: number;
  };
  config: {
    provider: string;
    model: string;
    lastUpdated: string;
    status: "ACTIVE" | "DEGRADED" | "DOWN";
  };
  recentGenerations: AdminAiGenerationLog[];
  indexingStatuses: AdminAiIndexingLog[];
}

export interface AdminSystemLogItem {
  id: string;
  code: string;
  actorName: string;
  actorEmail: string;
  timestamp: string;
  eventTitle: string;
  eventMeta?: string;
  status: "SUCCESS" | "WARNING" | "ERROR";
  details?: string;
}

/** `timeRange` values accepted by `GET /admin/logs` (backend `LOG_TIME_RANGES`); any other value is a 400. */
export const ADMIN_LOG_TIME_RANGES = ["today", "7d", "30d", "all"] as const;
export type AdminLogTimeRange = (typeof ADMIN_LOG_TIME_RANGES)[number];

/** Sort order of `GET /admin/logs`, applied in SQL so every page follows it. */
export type AdminLogOrder = "newest" | "oldest";

/**
 * Event-type filter groups of 10.9 → the audit event types each one covers (backend `AUDIT_EVENT_TYPES`).
 * A group with success and failure events covers both. There is no submission event in the API yet, so
 * there is no "Nộp bài" group.
 */
export const ADMIN_LOG_EVENT_GROUPS = {
  login: ["LOGIN_SUCCEEDED", "LOGIN_FAILED"],
  aiGen: ["CASE_GENERATED", "CASE_GENERATION_FAILED"],
  material: ["MATERIAL_UPLOADED"],
} as const satisfies Record<string, readonly string[]>;
export type AdminLogEventGroup = keyof typeof ADMIN_LOG_EVENT_GROUPS;

export interface AdminLogsResponse {
  logs: AdminSystemLogItem[];
  metrics: {
    eventsToday: number;
    loginCount: number;
    aiGenerationsCount: number;
    errorsCount: number;
  };
  total: number;
  page: number;
  size: number;
}

export interface AdminSystemSettings {
  platformName: string;
  operatorUnit: string;
  loginNotice: string;
  supportEmail: string;
  limits: {
    fileFormats: string;
    maxFileSize: string;
    registration: string;
    version: string;
    timezone: string;
  };
  aiPolicyNote: string;
}

// ============================================================================
// Service
// ============================================================================

export const adminService = {
  /**
   * System overview and dashboard metrics for Admin (`GET /admin/overview`, BE-032 / FE-031).
   */
  async getOverview(): Promise<AdminOverview> {
    const res = await apiClient.get<Envelope<AdminOverviewRow>>("/admin/overview");
    return toAdminOverview(res.data.data);
  },

  /**
   * Users management (`GET /admin/users`, BE-032 / Figma 10.3).
   */
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<AdminUsersResponse> {
    const res = await apiClient.get<Envelope<AdminUsersResponse>>("/admin/users", { params });
    return extractData<AdminUsersResponse>(res);
  },

  /**
   * Lock / unlock user account (`PATCH /admin/users/:id/status`, BE-032 / Figma 10.4).
   */
  async toggleUserLock(userId: string, isLocked: boolean): Promise<{ success: boolean; status: "ACTIVE" | "LOCKED" }> {
    const res = await apiClient.patch<Envelope<{ status: "ACTIVE" | "LOCKED" }>>(`/admin/users/${userId}/status`, {
      status: isLocked ? "LOCKED" : "ACTIVE",
    });
    const data = extractData<{ status: "ACTIVE" | "LOCKED" }>(res);
    return { success: true, status: data.status };
  },

  /**
   * Courses management (`GET /admin/courses`, BE-032 / Figma 10.5).
   */
  async getCourses(params?: {
    search?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<{ courses: AdminCourseItem[]; total: number }> {
    const res = await apiClient.get<Envelope<{ courses: AdminCourseItem[]; total: number }>>("/admin/courses", { params });
    return extractData<{ courses: AdminCourseItem[]; total: number }>(res);
  },

  /**
   * Cases management & analytics (`GET /admin/cases`, BE-032 / Figma 10.6).
   */
  async getCases(params?: {
    search?: string;
    status?: string;
    courseId?: string;
    page?: number;
    size?: number;
  }): Promise<{ cases: AdminCaseItem[]; analytics: AdminCaseAnalytics; total: number }> {
    const res = await apiClient.get<Envelope<{ cases: AdminCaseItem[]; analytics: AdminCaseAnalytics; total: number }>>("/admin/cases", { params });
    return extractData<{ cases: AdminCaseItem[]; analytics: AdminCaseAnalytics; total: number }>(res);
  },

  /**
   * AI Service oversight (read-only per OPD-013 / Figma 10.7).
   */
  async getAiServiceData(): Promise<AdminAiServiceData> {
    const res = await apiClient.get<Envelope<AdminAiServiceData>>("/admin/ai-service");
    return extractData<AdminAiServiceData>(res);
  },

  /**
   * System Logs (`GET /admin/logs`, BE-032 / Figma 10.9).
   */
  async getSystemLogs(params?: {
    search?: string;
    /** Audit event types; several are sent as one comma-separated `eventType` (e.g. a filter group). */
    eventTypes?: readonly string[];
    timeRange?: AdminLogTimeRange;
    order?: AdminLogOrder;
    page?: number;
    size?: number;
  }): Promise<AdminLogsResponse> {
    const { eventTypes, ...rest } = params ?? {};
    const query = eventTypes?.length ? { ...rest, eventType: eventTypes.join(",") } : rest;
    const res = await apiClient.get<Envelope<AdminLogsResponse>>("/admin/logs", { params: query });
    return extractData<AdminLogsResponse>(res);
  },

  /**
   * System Settings (`GET /admin/settings`, BE-032 / Figma 10.10).
   */
  async getSystemSettings(): Promise<AdminSystemSettings> {
    const res = await apiClient.get<Envelope<AdminSystemSettings>>("/admin/settings");
    return extractData<AdminSystemSettings>(res);
  },

  /**
   * Update System Settings (`PUT /admin/settings`, BE-032 / Figma 10.10).
   */
  async updateSystemSettings(settings: Partial<AdminSystemSettings>): Promise<AdminSystemSettings> {
    const res = await apiClient.put<Envelope<AdminSystemSettings>>("/admin/settings", settings);
    return extractData<AdminSystemSettings>(res);
  },
};
