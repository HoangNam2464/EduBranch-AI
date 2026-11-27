import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toLecturerDashboard } from "@/services/mappers/lecturerDashboard";

const apiClient = (await import("@/services/apiClient")).default;
const { lecturerDashboardService } = await import("@/services/lecturerDashboardService");

describe("lecturer dashboard (FE-027 on BE-030)", () => {
  it("maps the backend aggregate without computing anything in the browser", () => {
    const d = toLecturerDashboard({
      courses: { total: 3, active: 2, archived: 1 },
      cases: { total: 9, byStatus: { DRAFT: 2, REVIEWED: 1, APPROVED: 1, PUBLISHED: 5 } },
      pendingReviews: {
        count: 7,
        items: [
          { submissionId: "s-1", caseId: "k-1", caseTitle: "Khủng hoảng", courseName: "MKT301", studentName: "Nguyễn A", submittedAt: "2026-11-26T08:00:00Z" },
        ],
      },
    });
    assert.deepEqual(
      { courses: d.courses, publishedCases: d.publishedCases, draftCases: d.draftCases, pendingReviews: d.pendingReviews },
      { courses: 3, publishedCases: 5, draftCases: 3, pendingReviews: 7 },
    );
    // The count is the backend total, not the length of the 5-item preview list.
    assert.equal(d.pendingItems.length, 1);
    assert.equal(d.pendingItems[0].submissionId, "s-1");
  });

  it("never invents data: missing or malformed numbers become 0, missing lists become empty", () => {
    const d = toLecturerDashboard({ courses: { total: "x" }, cases: { byStatus: { PUBLISHED: -4 } }, pendingReviews: {} });
    assert.deepEqual(
      { courses: d.courses, publishedCases: d.publishedCases, draftCases: d.draftCases, pendingReviews: d.pendingReviews, items: d.pendingItems },
      { courses: 0, publishedCases: 0, draftCases: 0, pendingReviews: 0, items: [] },
    );
    assert.equal(toLecturerDashboard(null).courses, 0);
  });

  it("drops pending items without a submission id (they could not be opened)", () => {
    const d = toLecturerDashboard({ pendingReviews: { count: 2, items: [{ caseTitle: "no id" }, { submissionId: "s-2" }] } });
    assert.deepEqual(d.pendingItems.map((i) => i.submissionId), ["s-2"]);
    assert.equal(d.pendingReviews, 2);
  });

  it("calls GET /lecturer/dashboard and rethrows HTTP errors", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/lecturer/dashboard");
        return { data: { status: "SUCCESS", data: { courses: { total: 1 } } } };
      }) as any;
      assert.equal((await lecturerDashboardService.getDashboard()).courses, 1);

      apiClient.get = (async () => {
        throw Object.assign(new Error("Forbidden"), { response: { status: 403 } });
      }) as any;
      await assert.rejects(() => lecturerDashboardService.getDashboard(), (e: any) => e.response?.status === 403);
    } finally {
      apiClient.get = originalGet;
    }
  });
});
