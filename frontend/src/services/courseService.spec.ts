import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

const { default: apiClient } = await import("@/services/apiClient");
const { courseService } = await import("@/services/courseService");

describe("courseService (BE-029 / FE-028 API Client)", () => {
  beforeEach(() => {
    // Reset any stubbed methods
  });

  it("enrollCourse calls POST /courses/enroll and returns mapped course", async () => {
    const originalPost = apiClient.post;
    try {
      apiClient.post = (async (url: string, data: any) => {
        assert.equal(url, "/courses/enroll");
        assert.deepEqual(data, { inviteCode: "ABC12345" });
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "c-1",
              name: "Corporate Law",
              description: "Law course",
              course_code: "LAW-301",
              lecturer_id: "lec-1",
              active: true,
              invite_code: "ABC12345",
              invite_code_active: true,
              enrolled_at: "2026-11-19T06:00:00Z",
              created_at: "2026-11-14T00:00:00Z",
              updated_at: "2026-11-14T00:00:00Z",
            },
          },
        };
      }) as any;

      const course = await courseService.enrollCourse("ABC12345");
      assert.equal(course.id, "c-1");
      assert.equal(course.name, "Corporate Law");
      assert.equal(course.inviteCode, "ABC12345");
      assert.equal(course.enrolledAt, "2026-11-19T06:00:00Z");
    } finally {
      apiClient.post = originalPost;
    }
  });

  it("getStudentCourses calls GET /student/courses and returns mapped courses", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/student/courses");
        return {
          data: {
            status: "SUCCESS",
            data: [
              {
                id: "c-1",
                name: "Corporate Law",
                course_code: "LAW-301",
                lecturer_id: "lec-1",
                active: true,
                created_at: "2026-11-14T00:00:00Z",
                updated_at: "2026-11-14T00:00:00Z",
              },
            ],
          },
        };
      }) as any;

      const courses = await courseService.getStudentCourses();
      assert.equal(courses.length, 1);
      assert.equal(courses[0].id, "c-1");
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getStudentDashboard calls GET /student/dashboard and returns aggregated data", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/student/dashboard");
        return {
          data: {
            status: "SUCCESS",
            data: {
              enrolledCourses: [
                {
                  id: "c-1",
                  name: "Corporate Law",
                  course_code: "LAW-301",
                  lecturer_id: "lec-1",
                  active: true,
                  created_at: "2026-11-14T00:00:00Z",
                  updated_at: "2026-11-14T00:00:00Z",
                },
              ],
              recentCases: [
                {
                  id: "cs-1",
                  title: "Hostile Takeover",
                  description: "A business dilemma",
                  learning_mode: "BRANCHING_STUDY",
                  course_id: "c-1",
                  status: "PUBLISHED",
                  course_name: "Corporate Law",
                  course_code: "LAW-301",
                  created_at: "2026-11-15T00:00:00Z",
                  updated_at: "2026-11-15T00:00:00Z",
                },
              ],
              activeCases: [],
              stats: {
                totalEnrolled: 1,
                totalActiveCases: 0,
                totalPublishedCases: 1,
              },
            },
          },
        };
      }) as any;

      const dashboard = await courseService.getStudentDashboard();
      assert.equal(dashboard.enrolledCourses.length, 1);
      assert.equal(dashboard.recentCases.length, 1);
      assert.equal(dashboard.stats.totalEnrolled, 1);
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("getInviteCode, rotateInviteCode, disableInviteCode call correct endpoints", async () => {
    const originalGet = apiClient.get;
    const originalPost = apiClient.post;
    const originalDelete = apiClient.delete;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/courses/c-1/invite-code");
        return { data: { status: "SUCCESS", data: { inviteCode: "CODE1", isActive: true } } };
      }) as any;

      apiClient.post = (async (url: string) => {
        assert.equal(url, "/courses/c-1/invite-code");
        return { data: { status: "SUCCESS", data: { inviteCode: "NEWCODE2", isActive: true } } };
      }) as any;

      apiClient.delete = (async (url: string) => {
        assert.equal(url, "/courses/c-1/invite-code");
        return { data: { status: "SUCCESS", data: { inviteCode: "CODE1", isActive: false } } };
      }) as any;

      const code1 = await courseService.getInviteCode("c-1");
      assert.equal(code1.inviteCode, "CODE1");
      assert.equal(code1.isActive, true);

      apiClient.get = (async (url: string) => {
        assert.equal(url, "/courses/c-1/invite-code");
        return { data: { status: "SUCCESS", data: { inviteCode: null, isActive: false } } };
      }) as any;
      const codeNull = await courseService.getInviteCode("c-1");
      assert.equal(codeNull.inviteCode, null);
      assert.equal(codeNull.isActive, false);

      const code2 = await courseService.rotateInviteCode("c-1");
      assert.equal(code2.inviteCode, "NEWCODE2");
      assert.equal(code2.isActive, true);

      const code3 = await courseService.disableInviteCode("c-1");
      assert.equal(code3.isActive, false);
    } finally {
      apiClient.get = originalGet;
      apiClient.post = originalPost;
      apiClient.delete = originalDelete;
    }
  });
});
