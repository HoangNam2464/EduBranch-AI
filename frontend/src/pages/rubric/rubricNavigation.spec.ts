import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rubricBackPath, rubricCasePath, rubricCasesPath } from "./rubricNavigation.ts";

const CASE = "fa000000-0000-4000-8000-0000000000fa";

describe("rubric navigation (FE-029 D3c, Figma 10.8 header)", () => {
  it("breadcrumb 'Case Study' points to the role's case list", () => {
    assert.equal(rubricCasesPath("ADMIN"), "/admin/cases");
    assert.equal(rubricCasesPath("LECTURER"), "/lecturer/cases");
  });

  it("rubric of a case stays inside the role's area", () => {
    assert.equal(rubricCasePath("ADMIN", CASE), `/admin/rubric/${CASE}`);
    assert.equal(rubricCasePath("LECTURER", CASE), `/lecturer/cases/${CASE}/rubric`);
  });

  it("back returns to where the rubric was opened from", () => {
    assert.equal(rubricBackPath("ADMIN", CASE), "/admin/cases");
    assert.equal(rubricBackPath("LECTURER", CASE), `/lecturer/cases/${CASE}/review`);
  });

  it("back avoids a dead end when the case is forbidden or missing", () => {
    assert.equal(rubricBackPath("LECTURER", CASE, 403), "/lecturer/cases");
    assert.equal(rubricBackPath("LECTURER", CASE, 404), "/lecturer/cases");
    assert.equal(rubricBackPath("LECTURER", CASE, 500), `/lecturer/cases/${CASE}/review`);
    assert.equal(rubricBackPath("ADMIN", CASE, 404), "/admin/cases");
  });

  it("never sends an admin into lecturer routes", () => {
    for (const p of [rubricCasesPath("ADMIN"), rubricCasePath("ADMIN", CASE), rubricBackPath("ADMIN", CASE)]) {
      assert.ok(p.startsWith("/admin/"), p);
    }
  });
});
