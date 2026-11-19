import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toAdminOverview, type AdminOverviewRow } from "./adminOverview";

describe("toAdminOverview (BE-032 / FE-031 Mapper)", () => {
  it("maps snake_case backend row cleanly to camelCase domain model", () => {
    const raw: AdminOverviewRow = {
      attention_alerts: [
        { id: "a1", message: "1 tệp lập chỉ mục thất bại (CS402)", type: "indexing_failure" },
        { id: "a2", message: "5 lần đăng nhập thất bại · giahuy@dtu.edu.vn", type: "login_failure" },
      ],
      total_users: 186,
      user_growth_this_month: 14,
      open_courses: 8,
      course_growth_this_month: 1,
      published_cases: 23,
      case_growth_this_month: 5,
      ai_case_generations: 64,
      ai_case_failures: 2,
      students_count: 172,
      lecturers_count: 12,
      admins_count: 2,
      cases_by_course: [
        { course_code: "CS402", course_name: "An ninh mạng", published_count: 4, draft_count: 2 },
      ],
      recent_logs: [
        { id: "l1", description: "Nguyễn Minh Anh nộp bài Review Study", meta: "09:42 · MK210", tone: "success" },
      ],
      system_health: {
        app_server: "UP",
        database: "UP",
        ai_service: "UP",
        indexing: "UP",
        indexing_processing_count: 2,
      },
    };

    const mapped = toAdminOverview(raw);
    assert.equal(mapped.kpis.totalUsers, 186);
    assert.equal(mapped.kpis.userGrowthThisMonth, 14);
    assert.equal(mapped.kpis.openCourses, 8);
    assert.equal(mapped.kpis.publishedCases, 23);
    assert.equal(mapped.kpis.aiCaseGenerations, 64);
    assert.equal(mapped.kpis.aiCaseFailures, 2);
    assert.equal(mapped.attentionAlerts.length, 2);
    assert.equal(mapped.casesByCourse[0].courseCode, "CS402");
    assert.equal(mapped.casesByCourse[0].totalCount, 6);
    assert.equal(mapped.recentLogs[0].id, "l1");
    assert.equal(mapped.systemHealth?.indexingProcessingCount, 2);
  });

  it("handles null or undefined row with safe defaults", () => {
    const mapped = toAdminOverview(null);
    assert.equal(mapped.kpis.totalUsers, 0);
    assert.equal(mapped.kpis.aiCaseFailures, 0);
    assert.deepEqual(mapped.attentionAlerts, []);
    assert.deepEqual(mapped.casesByCourse, []);
    assert.deepEqual(mapped.recentLogs, []);
  });
});
