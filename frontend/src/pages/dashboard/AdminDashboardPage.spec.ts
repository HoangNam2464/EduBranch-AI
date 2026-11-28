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

  it("never shows invented data: no fallback numbers, sample courses, sample log rows or hard-coded week labels (rule F2)", async () => {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    const source = readFileSync(fileURLToPath(new URL("./AdminDashboardPage.tsx", import.meta.url)), "utf8");
    for (const invented of [
      /\|\|\s*(92|186|6|2)\b/,
      /Tu\u1ea7n\s*4\d/,
      /courseCode:\s*"[A-Z]{2}\d{3}"/,
      /state="UP"/,
      /indexingProcessing",\s*\{\s*count:\s*\d/,
      /code === 404 \|\| code === 501/,
      /description:\s*"[^"]*(n\u1ed9p b\u00e0i|sinh case|\u0110\u0103ng nh\u1eadp th\u1ea5t b\u1ea1i)/,
    ]) {
      assert.doesNotMatch(source, invented);
    }
  });

  it("health and alerts come from the overview: a missing AI/indexing status stays unknown, alert counts are kept", async () => {
    const { toAdminOverview } = await import("@/services/mappers/adminOverview");
    const o = toAdminOverview({
      attention_alerts: [{ id: "indexing_failure", type: "indexing_failure", message: "indexing_failure", count: 3 }],
      system_health: { app_server: "UP", database: "UP", indexing_processing_count: 0 },
    } as never);
    assert.equal(o.systemHealth?.aiService, undefined);
    assert.equal(o.systemHealth?.indexing, undefined);
    assert.equal(o.attentionAlerts[0].count, 3);
  });
});
