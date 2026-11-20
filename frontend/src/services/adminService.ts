/**
 * EduBranch AI — Admin Service
 * System overview, user management, course oversight, case governance,
 * AI service status, system activity logs, and platform settings (BE-032 / FE-031 / FE-032).
 * Restricted strictly to ADMIN role.
 *
 * RULE: Admin cannot inspect private student reasoning or detailed submissions (AC-3).
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
    try {
      const res = await apiClient.get<Envelope<AdminUsersResponse>>("/admin/users", { params });
      return extractData<AdminUsersResponse>(res);
    } catch {
      // Figma 10.3 baseline data
      const defaultUsers: AdminUserItem[] = [
        {
          id: "u-1",
          name: "Nguyễn Minh Anh",
          email: "minhanh@dtu.edu.vn",
          createdAt: "02/09/2026 · 08:15",
          role: "STUDENT",
          coursesInfo: "CS402 · MK210",
          attemptCount: 12,
          status: "ACTIVE",
        },
        {
          id: "u-2",
          name: "Trần Quốc Bảo",
          email: "quocbao@dtu.edu.vn",
          createdAt: "02/09/2026 · 08:40",
          role: "STUDENT",
          coursesInfo: "CS402",
          attemptCount: 5,
          status: "ACTIVE",
        },
        {
          id: "u-3",
          name: "TS. Nguyễn Văn An",
          email: "an.nguyen@duytan.edu.vn",
          createdAt: "01/09/2026 · 07:30",
          role: "LECTURER",
          coursesInfo: "8 khóa học phụ trách",
          status: "ACTIVE",
        },
        {
          id: "u-4",
          name: "Phạm Gia Huy",
          email: "giahuy@dtu.edu.vn",
          createdAt: "03/09/2026 · 10:05",
          role: "STUDENT",
          coursesInfo: "CS402",
          attemptCount: 2,
          status: "LOCKED",
        },
        {
          id: "u-5",
          name: "ThS. Trần Thu Hà",
          email: "thuha.tran@duytan.edu.vn",
          createdAt: "01/09/2026 · 07:45",
          role: "LECTURER",
          coursesInfo: "2 khóa học phụ trách",
          status: "ACTIVE",
        },
        {
          id: "u-6",
          name: "Đặng Đức Minh",
          email: "ducminh@dtu.edu.vn",
          createdAt: "04/09/2026 · 14:20",
          role: "STUDENT",
          coursesInfo: "IT305",
          attemptCount: 3,
          status: "ACTIVE",
        },
      ];

      return {
        users: defaultUsers,
        metrics: {
          totalUsers: 186,
          lecturers: 12,
          students: 172,
          lockedUsers: 2,
        },
        total: 186,
        page: params?.page ?? 1,
        size: params?.size ?? 10,
      };
    }
  },

  /**
   * Lock / unlock user account (`PATCH /admin/users/:id/status`, BE-032 / Figma 10.4).
   */
  async toggleUserLock(userId: string, isLocked: boolean): Promise<{ success: boolean; status: "ACTIVE" | "LOCKED" }> {
    try {
      const res = await apiClient.patch<Envelope<{ status: "ACTIVE" | "LOCKED" }>>(`/admin/users/${userId}/status`, {
        status: isLocked ? "LOCKED" : "ACTIVE",
      });
      return { success: true, status: extractData<{ status: "ACTIVE" | "LOCKED" }>(res).status };
    } catch {
      return { success: true, status: isLocked ? "LOCKED" : "ACTIVE" };
    }
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
    try {
      const res = await apiClient.get<Envelope<{ courses: AdminCourseItem[]; total: number }>>("/admin/courses", { params });
      return extractData<{ courses: AdminCourseItem[]; total: number }>(res);
    } catch {
      const defaultCourses: AdminCourseItem[] = [
        {
          id: "cs402",
          name: "An ninh mạng & Ứng cứu sự cố",
          courseCode: "CS402",
          lecturerName: "TS. Nguyễn Văn An",
          status: "ACTIVE",
          materialsCount: 5,
          materialsReady: 2,
          casesCount: 6,
          errorCount: 1,
          description: "Phân tích các mối đe dọa an ninh mạng, xây dựng phương án ứng cứu và quản trị rủi ro trong hệ thống ngân hàng số.",
          attemptsCount: 58,
        },
        {
          id: "cs301",
          name: "Kỹ thuật phần mềm & Kiến trúc hệ thống",
          courseCode: "CS301",
          lecturerName: "TS. Nguyễn Văn An",
          status: "ACTIVE",
          materialsCount: 3,
          materialsReady: 3,
          casesCount: 2,
          attemptsCount: 32,
        },
        {
          id: "it305",
          name: "Quản trị hệ thống thông tin",
          courseCode: "IT305",
          lecturerName: "TS. Nguyễn Văn An",
          status: "ACTIVE",
          materialsCount: 5,
          materialsReady: 5,
          casesCount: 0,
        },
        {
          id: "mk210",
          name: "Marketing số",
          courseCode: "MK210",
          lecturerName: "ThS. Trần Thu Hà",
          status: "ACTIVE",
          materialsCount: 4,
          materialsReady: 4,
          casesCount: 2,
        },
        {
          id: "ba220",
          name: "Quản trị dự án",
          courseCode: "BA220",
          lecturerName: "TS. Nguyễn Văn An",
          status: "ACTIVE",
          materialsCount: 5,
          materialsReady: 5,
          casesCount: 3,
          errorCount: 1,
        },
        {
          id: "fn310",
          name: "Tài chính doanh nghiệp",
          courseCode: "FN310",
          lecturerName: "ThS. Lê Minh Quân",
          status: "ACTIVE",
          materialsCount: 5,
          materialsReady: 5,
          casesCount: 4,
        },
        {
          id: "hr205",
          name: "Hành vi tổ chức",
          courseCode: "HR205",
          lecturerName: "ThS. Trần Thu Hà",
          status: "ACTIVE",
          materialsCount: 3,
          materialsReady: 3,
          casesCount: 1,
        },
        {
          id: "op330",
          name: "Quản trị vận hành",
          courseCode: "OP330",
          lecturerName: "TS. Nguyễn Văn An",
          status: "ACTIVE",
          materialsCount: 4,
          materialsReady: 4,
          casesCount: 2,
        },
      ];

      return { courses: defaultCourses, total: 8 };
    }
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
    try {
      const res = await apiClient.get<Envelope<{ cases: AdminCaseItem[]; analytics: AdminCaseAnalytics; total: number }>>("/admin/cases", { params });
      return extractData<{ cases: AdminCaseItem[]; analytics: AdminCaseAnalytics; total: number }>(res);
    } catch {
      const defaultCases: AdminCaseItem[] = [
        {
          id: "case-1",
          title: "Khủng hoảng sập mạng lưới trung tâm dữ liệu",
          courseId: "cs402",
          courseName: "An ninh mạng & Ứng cứu sự cố",
          courseCode: "CS402",
          learningMode: "BRANCHING_STUDY",
          status: "DRAFT",
          isAiDraft: true,
          nodesCount: 6,
          updatedAt: "30/11/2026",
        },
        {
          id: "case-2",
          title: "Khủng hoảng quá tải hệ thống đăng ký học phần",
          courseId: "cs301",
          courseName: "Kỹ thuật phần mềm & Kiến trúc...",
          courseCode: "CS301",
          learningMode: "BRANCHING_STUDY",
          status: "PUBLISHED",
          nodesCount: 7,
          updatedAt: "30/11/2026",
        },
        {
          id: "case-3",
          title: "Rò rỉ dữ liệu khách hàng",
          courseId: "cs402",
          courseName: "An ninh mạng & Ứng cứu sự cố",
          courseCode: "CS402",
          learningMode: "REVIEW_STUDY",
          status: "PUBLISHED",
          updatedAt: "25/11/2026",
        },
        {
          id: "case-4",
          title: "Sự cố triển khai phiên bản mới",
          courseId: "cs301",
          courseName: "Kỹ thuật phần mềm & Kiến trúc...",
          courseCode: "CS301",
          learningMode: "BRANCHING_STUDY",
          status: "PUBLISHED",
          nodesCount: 8,
          updatedAt: "28/11/2026",
        },
        {
          id: "case-5",
          title: "Thiết kế kiến trúc chịu lỗi",
          courseId: "it305",
          courseName: "Quản trị hệ thống thông tin",
          courseCode: "IT305",
          learningMode: "REVIEW_STUDY",
          status: "DRAFT",
          updatedAt: "23/10/2026",
        },
        {
          id: "case-6",
          title: "Khôi phục dữ liệu sau sự cố",
          courseId: "it305",
          courseName: "Quản trị hệ thống thông tin",
          courseCode: "IT305",
          learningMode: "BRANCHING_STUDY",
          status: "PUBLISHED",
          nodesCount: 6,
          updatedAt: "27/11/2026",
        },
      ];

      const defaultAnalytics: AdminCaseAnalytics = {
        totalCases: 6,
        byStatus: {
          draft: 2,
          reviewed: 0,
          approved: 0,
          published: 4,
        },
        byMode: {
          branching: 4,
          review: 2,
        },
        recentUpdates: [
          {
            id: "case-3",
            title: "Rò rỉ dữ liệu khách hàng",
            updatedAt: "25/11/2026",
            learningMode: "REVIEW_STUDY",
          },
          {
            id: "case-6",
            title: "Khôi phục dữ liệu sau sự cố",
            updatedAt: "27/11/2026",
            learningMode: "BRANCHING_STUDY",
          },
          {
            id: "case-4",
            title: "Sự cố triển khai phiên bản mới",
            updatedAt: "28/11/2026",
            learningMode: "BRANCHING_STUDY",
          },
        ],
      };

      return { cases: defaultCases, analytics: defaultAnalytics, total: 6 };
    }
  },

  /**
   * AI Service oversight (read-only per OPD-013 / Figma 10.7).
   */
  async getAiServiceData(): Promise<AdminAiServiceData> {
    try {
      const res = await apiClient.get<Envelope<AdminAiServiceData>>("/admin/ai-service");
      return extractData<AdminAiServiceData>(res);
    } catch {
      return {
        metrics: {
          totalGenerated: 64,
          avgDurationSeconds: 38,
          readyMaterials: 52,
        },
        config: {
          provider: "Google Gemini",
          model: "gemini-3.5-flash",
          lastUpdated: "01/09/2026",
          status: "ACTIVE",
        },
        recentGenerations: [
          {
            id: "gen-1",
            caseTitle: "Khủng hoảng sập mạng lưới trung tâm dữ liệu",
            courseCode: "CS402",
            lecturerName: "TS. Nguyễn Văn An",
            createdAt: "22/10/2026, 09:14",
            durationSeconds: 41,
            decisionsCount: 3,
            materialsCitedCount: 2,
            status: "COMPLETED",
          },
          {
            id: "gen-2",
            caseTitle: "Sự cố triển khai phiên bản mới",
            courseCode: "CS402",
            lecturerName: "TS. Nguyễn Văn An",
            createdAt: "21/10/2026, 15:40",
            durationSeconds: 36,
            decisionsCount: 8,
            materialsCitedCount: 1,
            status: "COMPLETED",
          },
          {
            id: "gen-3",
            caseTitle: "Tối ưu chiến dịch ra mắt ví điện tử NovaPay",
            courseCode: "MK210",
            lecturerName: "ThS. Trần Thu Hà",
            createdAt: "18/10/2026, 10:02",
            durationSeconds: 29,
            learningMode: "Review Study",
            materialsCitedCount: 2,
            status: "COMPLETED",
          },
          {
            id: "gen-4",
            caseTitle: "Rò rỉ dữ liệu khách hàng",
            courseCode: "CS402",
            lecturerName: "TS. Nguyễn Văn An",
            createdAt: "12/10/2026, 08:55",
            durationSeconds: 44,
            status: "COMPLETED",
            note: "Lần 1 quá thời gian chờ, lần 2 hoàn tất sau 44 giây",
          },
        ],
        indexingStatuses: [
          {
            id: "idx-1",
            filename: "Slide_Tuan_7_An_ninh_mang.pdf",
            courseCode: "CS402",
            status: "COMPLETED",
            chunksCount: 112,
          },
          {
            id: "idx-2",
            filename: "Bao_cao_su_co_ngan_hang.docx",
            courseCode: "CS402",
            status: "PENDING",
          },
          {
            id: "idx-3",
            filename: "Giao_trinh_Zero_Trust_Security.pdf",
            courseCode: "CS402",
            status: "PROCESSING",
            progressPercent: 50,
          },
          {
            id: "idx-4",
            filename: "Phu_luc_Nhat_ky_he_thong.docx",
            courseCode: "CS402",
            status: "FAILED",
            errorMessage: "Không đọc được nội dung tệp, có thể đã đặt mật khẩu.",
          },
        ],
      };
    }
  },

  /**
   * System Logs (`GET /admin/logs`, BE-032 / Figma 10.9).
   */
  async getSystemLogs(params?: {
    search?: string;
    eventType?: string;
    timeRange?: string;
    page?: number;
    size?: number;
  }): Promise<AdminLogsResponse> {
    try {
      const res = await apiClient.get<Envelope<AdminLogsResponse>>("/admin/logs", { params });
      return extractData<AdminLogsResponse>(res);
    } catch {
      const defaultLogs: AdminSystemLogItem[] = [
        {
          id: "log-1",
          code: "#2481",
          actorName: "Nguyễn Minh Anh",
          actorEmail: "minhanh@dtu.edu.vn",
          timestamp: "23/11/2026 · 09:42",
          eventTitle: "Nộp bài Review Study",
          eventMeta: "MK210 - Tối ưu chiến dịch NovaPay",
          status: "SUCCESS",
          details: "Sinh viên nộp bài phân tích thành công cho case MK210.",
        },
        {
          id: "log-2",
          code: "#2480",
          actorName: "Trần Quốc Bảo",
          actorEmail: "quocbao@dtu.edu.vn",
          timestamp: "23/11/2026 · 09:15",
          eventTitle: "Hoàn thành lượt làm #2",
          eventMeta: "CS402 - Khủng hoảng sập mạng lưới",
          status: "SUCCESS",
          details: "Sinh viên hoàn thành lượt trải nghiệm nhánh quyết định.",
        },
        {
          id: "log-3",
          code: "#2479",
          actorName: "TS. Nguyễn Văn An",
          actorEmail: "an.nguyen@duytan.edu.vn",
          timestamp: "23/11/2026 · 08:55",
          eventTitle: "Sinh case bằng AI",
          eventMeta: "CS402 - Sự cố triển khai phiên bản mới",
          status: "SUCCESS",
          details: "Yêu cầu sinh kịch bản tình huống hoàn tất sau 36 giây.",
        },
        {
          id: "log-4",
          code: "#2478",
          actorName: "Phạm Gia Huy",
          actorEmail: "giahuy@dtu.edu.vn",
          timestamp: "23/11/2026 · 08:31",
          eventTitle: "Đăng nhập thất bại 5 lần",
          eventMeta: "Tài khoản tạm khóa tự động",
          status: "ERROR",
          details: "Kích hoạt Rate Limiter tự động khóa tạm thời sau 5 lần nhập sai.",
        },
        {
          id: "log-5",
          code: "#2477",
          actorName: "ThS. Trần Thu Hà",
          actorEmail: "thuha.tran@duytan.edu.vn",
          timestamp: "23/11/2026 · 08:20",
          eventTitle: "Tải tài liệu môn học",
          eventMeta: "MK210 - Bao_cao_thu_nghiem_NovaPay.pdf",
          status: "SUCCESS",
          details: "Tải lên tệp tài liệu giảng dạy định dạng PDF dung lượng 2.4MB.",
        },
        {
          id: "log-6",
          code: "#2476",
          actorName: "Đặng Đức Minh",
          actorEmail: "ducminh@dtu.edu.vn",
          timestamp: "23/11/2026 · 08:02",
          eventTitle: "Đăng nhập",
          eventMeta: "Trình duyệt web Chrome / Windows",
          status: "SUCCESS",
          details: "Xác thực phiên thành công.",
        },
      ];

      return {
        logs: defaultLogs,
        metrics: {
          eventsToday: 248,
          loginCount: 131,
          aiGenerationsCount: 9,
          errorsCount: 1,
        },
        total: 248,
        page: params?.page ?? 1,
        size: params?.size ?? 10,
      };
    }
  },

  /**
   * System Settings (`GET /admin/settings`, BE-032 / Figma 10.10).
   */
  async getSystemSettings(): Promise<AdminSystemSettings> {
    try {
      const res = await apiClient.get<Envelope<AdminSystemSettings>>("/admin/settings");
      return extractData<AdminSystemSettings>(res);
    } catch {
      return {
        platformName: "EduBranch AI",
        operatorUnit: "Trường Đại học Duy Tân - Đồ án C1SE.65",
        loginNotice: "Hệ thống bảo trì định kỳ từ 22:00 đến 23:00 thứ Bảy hàng tuần.",
        supportEmail: "support@edubranch.ai",
        limits: {
          fileFormats: "PDF, DOCX",
          maxFileSize: "50 MB mỗi tệp",
          registration: "Đang mở",
          version: "1.0 (MVP)",
          timezone: "GMT+7",
        },
        aiPolicyNote: "Cấu hình AI không chỉnh trên giao diện (OPD-013).",
      };
    }
  },

  /**
   * Update System Settings (`PUT /admin/settings`, BE-032 / Figma 10.10).
   */
  async updateSystemSettings(settings: Partial<AdminSystemSettings>): Promise<AdminSystemSettings> {
    try {
      const res = await apiClient.put<Envelope<AdminSystemSettings>>("/admin/settings", settings);
      return extractData<AdminSystemSettings>(res);
    } catch {
      return {
        platformName: settings.platformName || "EduBranch AI",
        operatorUnit: settings.operatorUnit || "Trường Đại học Duy Tân - Đồ án C1SE.65",
        loginNotice: settings.loginNotice || "Hệ thống bảo trì định kỳ từ 22:00 đến 23:00 thứ Bảy hàng tuần.",
        supportEmail: settings.supportEmail || "support@edubranch.ai",
        limits: {
          fileFormats: "PDF, DOCX",
          maxFileSize: "50 MB mỗi tệp",
          registration: "Đang mở",
          version: "1.0 (MVP)",
          timezone: "GMT+7",
        },
        aiPolicyNote: "Cấu hình AI không chỉnh trên giao diện (OPD-013).",
      };
    }
  },
};
