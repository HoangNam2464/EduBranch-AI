import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("AdminDashboardPage (FE-031 / Figma 10.1–10.2)", () => {
  it("AC-1: evaluateRouteGuard restricts Admin portal exclusively to ADMIN role", async () => {
    const { evaluateRouteGuard } = await import("@/routes/guards");

    // Guest / Unauthenticated
    const guestResult = evaluateRouteGuard(false, undefined, "ADMIN");
    assert.equal(guestResult.allowed, false);
    assert.equal(guestResult.kind, "signIn");

    // Student attempting to access Admin
    const studentResult = evaluateRouteGuard(true, "STUDENT", "ADMIN");
    assert.equal(studentResult.allowed, false);
    assert.equal(studentResult.kind, "forbidden");

    // Lecturer attempting to access Admin
    const lecturerResult = evaluateRouteGuard(true, "LECTURER", "ADMIN");
    assert.equal(lecturerResult.allowed, false);
    assert.equal(lecturerResult.kind, "forbidden");

    // Admin accessing Admin
    const adminResult = evaluateRouteGuard(true, "ADMIN", "ADMIN");
    assert.equal(adminResult.allowed, true);
  });

  it("AC-2 & AC-3: KPI metrics, attention banner and change chips keys exist in both VI and EN", async () => {
    const { default: i18n } = await import("@/lib/i18n");

    const requiredKeys = [
      "g6.dashboard.attentionTitle",
      "g6.dashboard.viewDetails",
      "g6.dashboard.kpi.users",
      "g6.dashboard.kpi.openCourses",
      "g6.dashboard.kpi.publishedCases",
      "g6.dashboard.kpi.aiGenerations",
      "g6.dashboard.kpi.growthThisMonth",
      "g6.dashboard.kpi.aiErrors",
      "g6.dashboard.kpi.noAiErrors",
      "g6.dashboard.activity.title",
      "g6.dashboard.usersByRole.title",
      "g6.dashboard.health.title",
      "g6.dashboard.casesByCourse.title",
      "g6.dashboard.recentLog.title",
    ];

    for (const lang of ["vi", "en"]) {
      await i18n.changeLanguage(lang);
      for (const key of requiredKeys) {
        const text = i18n.t(key, { count: 3, month: 11 });
        assert.ok(text && text !== key, `Translation key ${key} must exist in ${lang}`);
      }
    }
  });

  it("AC-4: handles empty or zeroed metrics gracefully without crashing", async () => {
    const { toAdminOverview } = await import("@/services/mappers/adminOverview");

    const emptyOverview = toAdminOverview({});
    assert.equal(emptyOverview.kpis.totalUsers, 0);
    assert.equal(emptyOverview.kpis.openCourses, 0);
    assert.equal(emptyOverview.kpis.publishedCases, 0);
    assert.equal(emptyOverview.kpis.aiCaseGenerations, 0);
    assert.equal(emptyOverview.kpis.aiCaseFailures, 0);
    assert.deepEqual(emptyOverview.attentionAlerts, []);
    assert.deepEqual(emptyOverview.casesByCourse, []);
    assert.deepEqual(emptyOverview.recentLogs, []);
  });
});
