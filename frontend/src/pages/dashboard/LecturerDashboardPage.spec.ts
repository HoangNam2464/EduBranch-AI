import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Mock localStorage and window before initializing Zustand authStore (imported by useLecturerCourseCases)
const mockStorage = new Map<string, string>();
const fakeLocalStorage = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  key: (i: number) => Array.from(mockStorage.keys())[i] ?? null,
  get length() {
    return mockStorage.size;
  },
};

(globalThis as any).localStorage = fakeLocalStorage;
if (typeof (globalThis as any).window === "undefined") {
  (globalThis as any).window = globalThis;
}
(globalThis as any).window.localStorage = fakeLocalStorage;

import {
  countCases,
  describeTodo,
  lecturerTodos,
  type CourseWithCases,
  type LecturerTodo,
} from "@/pages/statistics/useLecturerCourseCases";
import { groupCasesByDay } from "./calendarGrouping";
import type { Case, Course, TeachingMaterial } from "@/types";

describe("LecturerDashboardPage unit tests (real imports)", () => {
  const dummyCourse1: Course = {
    id: "course-1",
    name: "An ninh mạng & Ứng cứu sự cố",
    courseCode: "CS402",
    lecturerId: "lec-1",
    active: true,
    createdAt: "2026-11-01T08:00:00.000Z",
    updatedAt: "2026-11-01T08:00:00.000Z",
  };

  const dummyCourse2: Course = {
    id: "course-2",
    name: "Kỹ thuật phần mềm",
    courseCode: "CS301",
    lecturerId: "lec-1",
    active: true,
    createdAt: "2026-11-02T08:00:00.000Z",
    updatedAt: "2026-11-02T08:00:00.000Z",
  };

  const dummyCourseNoCode: Course = {
    id: "course-3",
    name: "Pháp luật đại cương",
    courseCode: "",
    lecturerId: "lec-1",
    active: true,
    createdAt: "2026-11-03T08:00:00.000Z",
    updatedAt: "2026-11-03T08:00:00.000Z",
  };

  const dummyCases: Case[] = [
    {
      id: "case-1",
      courseId: "course-1",
      title: "Sự cố DDoS cổng thanh toán",
      status: "PUBLISHED",
      learningMode: "BRANCHING_STUDY",
      createdAt: "2026-11-10T10:00:00.000Z",
      updatedAt: "2026-11-10T10:00:00.000Z",
    },
    {
      id: "case-2",
      courseId: "course-1",
      title: "Sự cố triển khai phiên bản mới",
      status: "DRAFT",
      learningMode: "BRANCHING_STUDY",
      createdAt: "2026-11-10T14:30:00.000Z",
      updatedAt: "2026-11-10T14:30:00.000Z",
    },
    {
      id: "case-3",
      courseId: "course-2",
      title: "Kiến trúc Microservices",
      status: "REVIEWED",
      learningMode: "BRANCHING_STUDY",
      createdAt: "2026-11-15T09:00:00.000Z",
      updatedAt: "2026-11-15T09:00:00.000Z",
    },
    {
      id: "case-4",
      courseId: "course-2",
      title: "Thiết kế cơ sở dữ liệu phân tán",
      status: "APPROVED",
      learningMode: "REVIEW_STUDY",
      createdAt: "2026-11-20T11:00:00.000Z",
      updatedAt: "2026-11-20T11:00:00.000Z",
    },
  ];

  const dummyMaterials: TeachingMaterial[] = [
    {
      id: "mat-1",
      courseId: "course-1",
      originalFilename: "Phu_luc_Nhat_ky_he_thong.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sizeBytes: 1024,
      processingStatus: "FAILED",
      processingError: "Indexing timeout",
      uploadedAt: "2026-11-05T08:00:00.000Z",
      updatedAt: "2026-11-05T08:00:00.000Z",
    },
    {
      id: "mat-2",
      courseId: "course-1",
      originalFilename: "Giao_trinh_Zero_Trust.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2048,
      processingStatus: "COMPLETED",
      uploadedAt: "2026-11-06T08:00:00.000Z",
      updatedAt: "2026-11-06T08:00:00.000Z",
    },
  ];

  const sampleCourseWithCases: CourseWithCases[] = [
    {
      course: dummyCourse1,
      cases: [dummyCases[0], dummyCases[1]],
      materials: dummyMaterials,
    },
    {
      course: dummyCourse2,
      cases: [dummyCases[2], dummyCases[3]],
      materials: [],
    },
  ];

  describe("countCases (real function from useLecturerCourseCases)", () => {
    it("accurately counts cases by single status", () => {
      const published = countCases(sampleCourseWithCases, ["PUBLISHED"]);
      const draft = countCases(sampleCourseWithCases, ["DRAFT"]);
      const reviewed = countCases(sampleCourseWithCases, ["REVIEWED"]);
      const approved = countCases(sampleCourseWithCases, ["APPROVED"]);

      assert.equal(published, 1);
      assert.equal(draft, 1);
      assert.equal(reviewed, 1);
      assert.equal(approved, 1);
    });

    it("accurately counts cases across multiple combined statuses", () => {
      const draftsAndReviewed = countCases(sampleCourseWithCases, ["DRAFT", "REVIEWED"]);
      assert.equal(draftsAndReviewed, 2);

      const allActive = countCases(sampleCourseWithCases, ["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED"]);
      assert.equal(allActive, 4);
    });

    it("returns 0 for empty items array or when no cases match", () => {
      assert.equal(countCases([], ["PUBLISHED"]), 0);
      assert.equal(countCases([{ course: dummyCourse1, cases: [] }], ["PUBLISHED"]), 0);
    });
  });

  describe("lecturerTodos (real function from useLecturerCourseCases)", () => {
    it("generates todo items for failed materials, drafts, and reviewed cases", () => {
      const todos = lecturerTodos(sampleCourseWithCases);

      assert.equal(todos.length, 3);
      const failedMat = todos.find((t) => t.kind === "materialFailed");
      const draftTodo = todos.find((t) => t.kind === "draft");
      const reviewedTodo = todos.find((t) => t.kind === "reviewed");

      assert.ok(failedMat && failedMat.kind === "materialFailed");
      assert.equal(failedMat.filename, "Phu_luc_Nhat_ky_he_thong.docx");
      assert.equal(failedMat.courseCode, "CS402");
      assert.equal(failedMat.key, "m-mat-1");

      assert.ok(draftTodo && draftTodo.kind === "draft");
      assert.equal(draftTodo.count, 1);
      assert.equal(draftTodo.courseCode, "CS402");
      assert.equal(draftTodo.key, "d-course-1");

      assert.ok(reviewedTodo && reviewedTodo.kind === "reviewed");
      assert.equal(reviewedTodo.count, 1);
      assert.equal(reviewedTodo.courseCode, "CS301");
      assert.equal(reviewedTodo.key, "r-course-2");
    });

    it("ignores completed materials and published/approved cases", () => {
      const items: CourseWithCases[] = [
        {
          course: dummyCourse1,
          cases: [dummyCases[0], dummyCases[3]], // PUBLISHED and APPROVED only
          materials: [dummyMaterials[1]], // COMPLETED only
        },
      ];

      const todos = lecturerTodos(items);
      assert.equal(todos.length, 0);
    });

    it("falls back to courseName if courseCode is missing or empty", () => {
      const items: CourseWithCases[] = [
        {
          course: dummyCourseNoCode,
          cases: [
            {
              id: "case-x",
              courseId: "course-3",
              title: "Tình huống pháp lý",
              status: "DRAFT",
              learningMode: "REVIEW_STUDY",
              createdAt: "2026-11-01T00:00:00.000Z",
              updatedAt: "2026-11-01T00:00:00.000Z",
            },
          ],
          materials: [
            {
              id: "mat-x",
              courseId: "course-3",
              originalFilename: "Bo_luat_Dan_su.pdf",
              mimeType: "application/pdf",
              sizeBytes: 512,
              processingStatus: "FAILED",
              uploadedAt: "2026-11-01T00:00:00.000Z",
              createdAt: "2026-11-01T00:00:00.000Z",
              updatedAt: "2026-11-01T00:00:00.000Z",
            } as TeachingMaterial,
          ],
        },
      ];

      const todos = lecturerTodos(items);
      assert.equal(todos.length, 2);

      const mockT = (_k: string, opts?: any) => `${opts?.code}`;
      const matDesc = describeTodo(todos.find((t) => t.kind === "materialFailed")!, mockT, "dashboard");
      assert.equal(matDesc.meta, "Pháp luật đại cương");

      const draftDesc = describeTodo(todos.find((t) => t.kind === "draft")!, mockT, "dashboard");
      assert.equal(draftDesc.meta, "Pháp luật đại cương");
    });

    it("returns an empty array on empty input", () => {
      assert.deepEqual(lecturerTodos([]), []);
    });
  });

  describe("describeTodo (real function from useLecturerCourseCases)", () => {
    const mockT = (key: string, opts?: any) => {
      if (key === "g4.todo.materialFailed") return `Lập chỉ mục thất bại · ${opts?.code}`;
      if (key === "g4.todo.drafts") return `${opts?.count} Bản nháp chờ rà soát`;
      if (key === "g4.todo.reviewed") return `${opts?.count} case chờ phê duyệt`;
      if (key === "g4.todo.meta") return `Case Study: ${opts?.code}`;
      return key;
    };

    it("formats materialFailed todo item cleanly", () => {
      const todo: LecturerTodo = {
        kind: "materialFailed",
        key: "m-1",
        courseId: "c-1",
        courseCode: "CS402",
        courseName: "An ninh mạng",
        filename: "Tailieu.pdf",
      };

      const desc = describeTodo(todo, mockT, "dashboard");
      assert.equal(desc.lead, "!");
      assert.equal(desc.title, "Tailieu.pdf");
      assert.equal(desc.meta, "Lập chỉ mục thất bại · CS402");
    });

    it("formats draft todo item cleanly", () => {
      const todo: LecturerTodo = {
        kind: "draft",
        key: "d-1",
        courseId: "c-1",
        courseCode: "CS402",
        courseName: "An ninh mạng",
        count: 3,
      };

      const desc = describeTodo(todo, mockT, "dashboard");
      assert.equal(desc.lead, "3");
      assert.equal(desc.title, "3 Bản nháp chờ rà soát");
      assert.equal(desc.meta, "Case Study: CS402");
    });

    it("formats reviewed todo item cleanly", () => {
      const todo: LecturerTodo = {
        kind: "reviewed",
        key: "r-1",
        courseId: "c-1",
        courseCode: "CS402",
        courseName: "An ninh mạng",
        count: 2,
      };

      const desc = describeTodo(todo, mockT, "dashboard");
      assert.equal(desc.lead, "2");
      assert.equal(desc.title, "2 case chờ phê duyệt");
      assert.equal(desc.meta, "Case Study: CS402");
    });
  });

  describe("groupCasesByDay (pure calendar grouping helper)", () => {
    it("groups cases by local date key YYYY-M-D matching buildMonthWeeks", () => {
      const cases: Case[] = [
        {
          id: "c-1",
          courseId: "course-1",
          title: "Case Alpha",
          status: "PUBLISHED",
          learningMode: "BRANCHING_STUDY",
          createdAt: "2026-05-15T10:00:00.000Z",
          updatedAt: "2026-05-15T10:00:00.000Z",
        },
        {
          id: "c-2",
          courseId: "course-1",
          title: "Case Beta",
          status: "DRAFT",
          learningMode: "BRANCHING_STUDY",
          createdAt: "2026-05-15T16:00:00.000Z",
          updatedAt: "2026-05-15T16:00:00.000Z",
        },
        {
          id: "c-3",
          courseId: "course-2",
          title: "Case Gamma",
          status: "APPROVED",
          learningMode: "REVIEW_STUDY",
          createdAt: "2026-05-20T08:00:00.000Z",
          updatedAt: "2026-05-20T08:00:00.000Z",
        },
      ];

      const grouped = groupCasesByDay(cases);
      const d1 = new Date("2026-05-15T10:00:00.000Z");
      const key1 = `${d1.getFullYear()}-${d1.getMonth() + 1}-${d1.getDate()}`;
      const d2 = new Date("2026-05-20T08:00:00.000Z");
      const key2 = `${d2.getFullYear()}-${d2.getMonth() + 1}-${d2.getDate()}`;

      assert.equal(grouped.size, 2);
      assert.equal(grouped.get(key1)?.length, 2);
      assert.equal(grouped.get(key1)?.[0].title, "Case Alpha");
      assert.equal(grouped.get(key1)?.[1].title, "Case Beta");
      assert.equal(grouped.get(key2)?.length, 1);
      assert.equal(grouped.get(key2)?.[0].title, "Case Gamma");
    });

    it("skips cases with missing or invalid createdAt", () => {
      const cases: Case[] = [
        {
          id: "c-valid",
          courseId: "course-1",
          title: "Valid Case",
          status: "PUBLISHED",
          learningMode: "BRANCHING_STUDY",
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-01T12:00:00.000Z",
        },
        {
          id: "c-no-date",
          courseId: "course-1",
          title: "No Date Case",
          status: "DRAFT",
          learningMode: "BRANCHING_STUDY",
          createdAt: undefined as unknown as string,
          updatedAt: "2026-06-01T12:00:00.000Z",
        },
        {
          id: "c-invalid-date",
          courseId: "course-1",
          title: "Invalid Date Case",
          status: "DRAFT",
          learningMode: "BRANCHING_STUDY",
          createdAt: "not-a-valid-date",
          updatedAt: "2026-06-01T12:00:00.000Z",
        },
        {
          id: "c-empty-date",
          courseId: "course-1",
          title: "Empty Date Case",
          status: "DRAFT",
          learningMode: "BRANCHING_STUDY",
          createdAt: "",
          updatedAt: "2026-06-01T12:00:00.000Z",
        },
      ];

      const grouped = groupCasesByDay(cases);
      assert.equal(grouped.size, 1);
      const d = new Date("2026-06-01T12:00:00.000Z");
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      assert.equal(grouped.get(key)?.length, 1);
      assert.equal(grouped.get(key)?.[0].id, "c-valid");
    });

    it("returns empty map on empty input", () => {
      const grouped = groupCasesByDay([]);
      assert.equal(grouped.size, 0);
    });
  });

  describe("Pedagogical Non-Grading Boundary (FND §6.1.2 / AC-4)", () => {
    it("dashboard data and models contain zero student grading, ranking, or score fields", () => {
      for (const item of sampleCourseWithCases) {
        assert.equal((item as any).score, undefined);
        assert.equal((item as any).grade, undefined);
        assert.equal((item as any).ranking, undefined);
        assert.equal((item as any).passFail, undefined);
      }
    });
  });
});
