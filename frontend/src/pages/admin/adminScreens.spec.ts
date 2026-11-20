import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { default: apiClient } = await import("@/services/apiClient");
const { adminService } = await import("@/services/adminService");
const { mapAdminHttpErrorToKey } = await import("@/pages/admin/adminErrorHelper");

describe("adminErrorHelper — pure HTTP status to i18n key mapping", () => {
  it("maps 403 to g6.noData.forbidden", () => {
    assert.equal(mapAdminHttpErrorToKey({ response: { status: 403 } }), "g6.noData.forbidden");
  });

  it("maps 404 and 501 to g6.noData.apiUnavailable", () => {
    assert.equal(mapAdminHttpErrorToKey({ response: { status: 404 } }), "g6.noData.apiUnavailable");
    assert.equal(mapAdminHttpErrorToKey({ response: { status: 501 } }), "g6.noData.apiUnavailable");
    assert.equal(mapAdminHttpErrorToKey({ status: 404 }), "g6.noData.apiUnavailable");
    assert.equal(mapAdminHttpErrorToKey({ status: 501 }), "g6.noData.apiUnavailable");
  });

  it("maps 5xx server errors to g6.noData.serverError", () => {
    assert.equal(mapAdminHttpErrorToKey({ response: { status: 500 } }), "g6.noData.serverError");
    assert.equal(mapAdminHttpErrorToKey({ response: { status: 502 } }), "g6.noData.serverError");
    assert.equal(mapAdminHttpErrorToKey({ response: { status: 503 } }), "g6.noData.serverError");
  });

  it("maps network errors without response to g6.noData.networkError", () => {
    assert.equal(mapAdminHttpErrorToKey({ code: "ERR_NETWORK" }), "g6.noData.networkError");
    assert.equal(mapAdminHttpErrorToKey(new Error("Network Error")), "g6.noData.networkError");
  });

  it("falls back to g6.noData.serverError for non-object or unknown errors", () => {
    assert.equal(mapAdminHttpErrorToKey("something went wrong"), "g6.noData.serverError");
    assert.equal(mapAdminHttpErrorToKey(null), "g6.noData.serverError");
  });
});

describe("adminService — routes, parsing, and error propagation (no fake data)", () => {
  it("getUsers calls GET /admin/users, returns data and rethrows errors", async () => {
    const originalGet = apiClient.get;
    try {
      // 1. Success case
      apiClient.get = (async (url: string, config?: any) => {
        assert.equal(url, "/admin/users");
        assert.deepEqual(config?.params, { page: 1, size: 10 });
        return {
          data: {
            status: "SUCCESS",
            data: {
              users: [
                {
                  id: "u-1",
                  name: "Nguyễn Minh Anh",
                  email: "minhanh@dtu.edu.vn",
                  createdAt: "02/09/2026 · 08:15",
                  role: "STUDENT",
                  status: "ACTIVE",
                },
              ],
              metrics: { totalUsers: 1, lecturers: 0, students: 1, lockedUsers: 0 },
              total: 1,
              page: 1,
              size: 10,
            },
          },
        };
      }) as any;

      const res = await adminService.getUsers({ page: 1, size: 10 });
      assert.equal(res.total, 1);
      assert.equal(res.users[0].name, "Nguyễn Minh Anh");

      // 2. Rethrows on 404
      apiClient.get = (async () => {
        const error = new Error("Not Found") as any;
        error.response = { status: 404 };
        throw error;
      }) as any;
      await assert.rejects(
        () => adminService.getUsers(),
        (err: any) => err.response?.status === 404,
      );

      // 3. Rethrows on 500
      apiClient.get = (async () => {
        const error = new Error("Server Error") as any;
        error.response = { status: 500 };
        throw error;
      }) as any;
      await assert.rejects(
        () => adminService.getUsers(),
        (err: any) => err.response?.status === 500,
      );

      // 4. Rethrows on network error
      apiClient.get = (async () => {
        const error = new Error("Network Disconnected") as any;
        error.code = "ERR_NETWORK";
        throw error;
      }) as any;
      await assert.rejects(
        () => adminService.getUsers(),
        (err: any) => err.code === "ERR_NETWORK",
      );
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("toggleUserLock calls PATCH /admin/users/:id/status, returns status and throws on failure", async () => {
    const originalPatch = apiClient.patch;
    try {
      // 1. Success case
      apiClient.patch = (async (url: string, data?: any) => {
        assert.equal(url, "/admin/users/u-1/status");
        assert.deepEqual(data, { status: "LOCKED" });
        return {
          data: {
            status: "SUCCESS",
            data: { status: "LOCKED" },
          },
        };
      }) as any;

      const res = await adminService.toggleUserLock("u-1", true);
      assert.equal(res.success, true);
      assert.equal(res.status, "LOCKED");

      // 2. Throws on error (no fallback)
      apiClient.patch = (async () => {
        const error = new Error("Failed to update status") as any;
        error.response = { status: 500 };
        throw error;
      }) as any;
      await assert.rejects(
        () => adminService.toggleUserLock("u-1", false),
        (err: any) => err.response?.status === 500,
      );
    } finally {
      apiClient.patch = originalPatch;
    }
  });

  it("getCourses calls GET /admin/courses, returns parsed data and rethrows errors", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string, config?: any) => {
        assert.equal(url, "/admin/courses");
        assert.deepEqual(config?.params, { status: "ACTIVE" });
        return {
          data: {
            status: "SUCCESS",
            data: {
              courses: [
                {
                  id: "cs402",
                  name: "An ninh mạng",
                  courseCode: "CS402",
                  lecturerName: "TS. Nguyễn Văn An",
                  status: "ACTIVE",
                  materialsCount: 5,
                  materialsReady: 5,
                  casesCount: 2,
                },
              ],
              total: 1,
            },
          },
        };
      }) as any;

      const res = await adminService.getCourses({ status: "ACTIVE" });
      assert.equal(res.total, 1);
      assert.equal(res.courses[0].courseCode, "CS402");

      apiClient.get = (async () => {
        const err = new Error("API Not Implemented") as any;
        err.response = { status: 501 };
        throw err;
      }) as any;
      await assert.rejects(
        () => adminService.getCourses(),
        (err: any) => err.response?.status === 501,
      );
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getCases calls GET /admin/cases, returns parsed data and rethrows errors", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/admin/cases");
        return {
          data: {
            status: "SUCCESS",
            data: {
              cases: [
                {
                  id: "case-1",
                  title: "Khủng hoảng sập mạng lưới",
                  courseId: "cs402",
                  courseName: "An ninh mạng",
                  learningMode: "BRANCHING_STUDY",
                  status: "PUBLISHED",
                  updatedAt: "2026-11-20",
                },
              ],
              analytics: {
                totalCases: 1,
                byStatus: { draft: 0, reviewed: 0, approved: 0, published: 1 },
                byMode: { branching: 1, review: 0 },
                recentUpdates: [],
              },
              total: 1,
            },
          },
        };
      }) as any;

      const res = await adminService.getCases();
      assert.equal(res.total, 1);
      assert.equal(res.cases[0].title, "Khủng hoảng sập mạng lưới");
      assert.equal(res.analytics.totalCases, 1);

      apiClient.get = (async () => {
        const err = new Error("Server down") as any;
        err.response = { status: 503 };
        throw err;
      }) as any;
      await assert.rejects(
        () => adminService.getCases(),
        (err: any) => err.response?.status === 503,
      );
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getAiServiceData calls GET /admin/ai-service, returns parsed data and rethrows errors", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/admin/ai-service");
        return {
          data: {
            status: "SUCCESS",
            data: {
              metrics: { totalGenerated: 10, avgDurationSeconds: 30, readyMaterials: 8 },
              config: { provider: "Google Gemini", model: "gemini-3.5-flash", lastUpdated: "2026-11-01", status: "ACTIVE" },
              recentGenerations: [],
              indexingStatuses: [],
            },
          },
        };
      }) as any;

      const res = await adminService.getAiServiceData();
      assert.equal(res.metrics.totalGenerated, 10);
      assert.equal(res.config.model, "gemini-3.5-flash");

      apiClient.get = (async () => {
        const err = new Error("Not Found") as any;
        err.response = { status: 404 };
        throw err;
      }) as any;
      await assert.rejects(
        () => adminService.getAiServiceData(),
        (err: any) => err.response?.status === 404,
      );
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getSystemLogs calls GET /admin/logs, returns parsed data and rethrows errors", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/admin/logs");
        return {
          data: {
            status: "SUCCESS",
            data: {
              logs: [
                {
                  id: "log-1",
                  code: "#2481",
                  actorName: "Nguyễn Minh Anh",
                  actorEmail: "minhanh@dtu.edu.vn",
                  timestamp: "23/11/2026 · 09:42",
                  eventTitle: "Nộp bài Review Study",
                  status: "SUCCESS",
                },
              ],
              metrics: { eventsToday: 1, loginCount: 0, aiGenerationsCount: 0, errorsCount: 0 },
              total: 1,
              page: 1,
              size: 10,
            },
          },
        };
      }) as any;

      const res = await adminService.getSystemLogs();
      assert.equal(res.total, 1);
      assert.equal(res.logs[0].code, "#2481");

      apiClient.get = (async () => {
        const err = new Error("Forbidden") as any;
        err.response = { status: 403 };
        throw err;
      }) as any;
      await assert.rejects(
        () => adminService.getSystemLogs(),
        (err: any) => err.response?.status === 403,
      );
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getSystemSettings and updateSystemSettings call /admin/settings and propagate errors", async () => {
    const originalGet = apiClient.get;
    const originalPut = apiClient.put;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/admin/settings");
        return {
          data: {
            status: "SUCCESS",
            data: {
              platformName: "EduBranch AI",
              operatorUnit: "Đại học Duy Tân",
              loginNotice: "Bảo trì",
              supportEmail: "support@edubranch.ai",
              limits: {
                fileFormats: "PDF, DOCX",
                maxFileSize: "50 MB",
                registration: "Mở",
                version: "1.0",
                timezone: "GMT+7",
              },
              aiPolicyNote: "OPD-013",
            },
          },
        };
      }) as any;

      const settings = await adminService.getSystemSettings();
      assert.equal(settings.platformName, "EduBranch AI");

      apiClient.put = (async (url: string, data?: any) => {
        assert.equal(url, "/admin/settings");
        assert.equal(data.platformName, "EduBranch AI Updated");
        return {
          data: {
            status: "SUCCESS",
            data: {
              ...settings,
              platformName: "EduBranch AI Updated",
            },
          },
        };
      }) as any;

      const updated = await adminService.updateSystemSettings({ platformName: "EduBranch AI Updated" });
      assert.equal(updated.platformName, "EduBranch AI Updated");

      apiClient.put = (async () => {
        const err = new Error("Unauthorized") as any;
        err.response = { status: 401 };
        throw err;
      }) as any;
      await assert.rejects(
        () => adminService.updateSystemSettings({ platformName: "Fail" }),
        (err: any) => err.response?.status === 401,
      );
    } finally {
      apiClient.get = originalGet;
      apiClient.put = originalPut;
    }
  });
});
