import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { default: apiClient } = await import("@/services/apiClient");
const { adminService } = await import("@/services/adminService");

describe("adminService (BE-032 / FE-031 Overview API)", () => {
  it("getOverview calls GET /admin/overview and returns mapped AdminOverview (AC-2)", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/admin/overview");
        return {
          data: {
            status: "SUCCESS",
            data: {
              total_users: 186,
              user_growth_this_month: 14,
              open_courses: 8,
              course_growth_this_month: 1,
              published_cases: 23,
              case_growth_this_month: 5,
              ai_case_generations: 64,
              ai_case_failures: 2,
            },
          },
        };
      }) as any;

      const overview = await adminService.getOverview();
      assert.equal(overview.kpis.totalUsers, 186);
      assert.equal(overview.kpis.openCourses, 8);
      assert.equal(overview.kpis.publishedCases, 23);
      assert.equal(overview.kpis.aiCaseGenerations, 64);
      assert.equal(overview.kpis.aiCaseFailures, 2);
    } finally {
      apiClient.get = originalGet;
    }
  });
});
