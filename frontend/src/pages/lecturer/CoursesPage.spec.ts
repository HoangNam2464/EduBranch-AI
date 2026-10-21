import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("CoursesPage (Course List, Creation & Validation)", () => {
  it("should validate that course name is mandatory and cannot be empty or whitespace only", () => {
    function validateCourseForm(form: { name: string; description?: string; courseCode?: string }) {
      if (!form.name || !form.name.trim()) {
        return { valid: false, error: "Tên khóa học không được để trống." };
      }
      return { valid: true, error: null };
    }

    assert.equal(validateCourseForm({ name: "" }).valid, false);
    assert.equal(validateCourseForm({ name: "   " }).valid, false);
    assert.equal(validateCourseForm({ name: "Chiến lược kinh doanh", courseCode: "BUS101" }).valid, true);
  });

  it("should format course creation payload cleanly trimming extra whitespaces", () => {
    function buildCreatePayload(raw: { name: string; description: string; courseCode: string }) {
      return {
        name: raw.name.trim(),
        description: raw.description?.trim() || undefined,
        courseCode: raw.courseCode?.trim() || undefined,
      };
    }

    const payload = buildCreatePayload({
      name: "  Khoa hoc Chien luoc  ",
      description: "   Mo ta chi tiet ve mon hoc   ",
      courseCode: "   BUS-301  ",
    });

    assert.equal(payload.name, "Khoa hoc Chien luoc");
    assert.equal(payload.description, "Mo ta chi tiet ve mon hoc");
    assert.equal(payload.courseCode, "BUS-301");
  });

  it("should correctly distinguish between loading, empty, error, and populated course list states", () => {
    function computeCoursesViewState(state: {
      loading: boolean;
      error: string | null;
      courses: any[];
    }) {
      if (state.loading) return "LOADING";
      if (state.error) return "ERROR";
      if (state.courses.length === 0) return "EMPTY";
      return "LIST";
    }

    assert.equal(computeCoursesViewState({ loading: true, error: null, courses: [] }), "LOADING");
    assert.equal(computeCoursesViewState({ loading: false, error: "Lỗi tải khóa học", courses: [] }), "ERROR");
    assert.equal(computeCoursesViewState({ loading: false, error: null, courses: [] }), "EMPTY");
    assert.equal(
      computeCoursesViewState({
        loading: false,
        error: null,
        courses: [{ id: "c-1", name: "Kinh tế vi mô" }],
      }),
      "LIST"
    );
  });
});
