import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toCourse, type CourseRow } from "./course";

const row: CourseRow = {
  id: "c1",
  name: "An ninh mạng & Ứng cứu sự cố",
  description: null,
  course_code: "CS402",
  lecturer_id: "u1",
  active: true,
  is_active: true,
  created_at: "2026-11-14T15:07:14.474Z",
  updated_at: "2026-11-14T15:07:14.474Z",
};

describe("toCourse (backend snake_case row → Course)", () => {
  it("maps every column to the camelCase domain field", () => {
    assert.deepEqual(toCourse(row), {
      id: "c1",
      name: "An ninh mạng & Ứng cứu sự cố",
      description: undefined,
      courseCode: "CS402",
      lecturerId: "u1",
      active: true,
      inviteCode: undefined,
      inviteCodeActive: undefined,
      enrolledAt: undefined,
      createdAt: "2026-11-14T15:07:14.474Z",
      updatedAt: "2026-11-14T15:07:14.474Z",
    });
  });

  it("maps invite_code, invite_code_active, and enrolled_at when present", () => {
    const course = toCourse({
      ...row,
      invite_code: "ABC12345",
      invite_code_active: true,
      enrolled_at: "2026-11-19T00:00:00.000Z",
    });
    assert.equal(course.inviteCode, "ABC12345");
    assert.equal(course.inviteCodeActive, true);
    assert.equal(course.enrolledAt, "2026-11-19T00:00:00.000Z");
  });

  it("falls back to is_active and treats null course_code as absent", () => {
    const course = toCourse({ ...row, active: undefined, is_active: false, course_code: null });
    assert.equal(course.active, false);
    assert.equal(course.courseCode, undefined);
  });
});
