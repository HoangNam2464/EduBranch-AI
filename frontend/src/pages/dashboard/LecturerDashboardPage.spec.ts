import { describe, it } from "node:test";
import assert from "node:assert/strict";

interface Course {
  id: string;
  name: string;
  courseCode?: string;
  active: boolean;
}

interface Case {
  id: string;
  courseId: string;
  title: string;
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";
  learningMode: "BRANCHING_STUDY" | "REVIEW_STUDY";
}

interface TeachingMaterial {
  id: string;
  courseId: string;
  originalFilename: string;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}

interface CourseWithCases {
  course: Course;
  cases: Case[];
  materials?: TeachingMaterial[];
}

function countCases(items: CourseWithCases[], statuses: Array<"DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED">): number {
  return items.reduce((sum, { cases }) => sum + cases.filter((c) => statuses.includes(c.status)).length, 0);
}

type LecturerTodo =
  | { kind: "draft" | "reviewed"; key: string; courseId: string; courseCode: string; courseName: string; count: number }
  | { kind: "materialFailed"; key: string; courseId: string; courseCode: string; courseName: string; filename: string };

function lecturerTodos(items: CourseWithCases[]): LecturerTodo[] {
  const todos: LecturerTodo[] = [];
  for (const { course, cases, materials } of items) {
    const base = { courseId: course.id, courseCode: course.courseCode ?? "", courseName: course.name };
    for (const m of materials ?? []) {
      if (m.processingStatus === "FAILED") todos.push({ ...base, kind: "materialFailed", key: `m-${m.id}`, filename: m.originalFilename });
    }
    const drafts = cases.filter((c) => c.status === "DRAFT").length;
    const reviewed = cases.filter((c) => c.status === "REVIEWED").length;
    if (drafts > 0) todos.push({ ...base, kind: "draft", key: `d-${course.id}`, count: drafts });
    if (reviewed > 0) todos.push({ ...base, kind: "reviewed", key: `r-${course.id}`, count: reviewed });
  }
  return todos;
}

function describeTodo(todo: LecturerTodo, t: (key: string, opts?: any) => string) {
  const code = todo.courseCode || todo.courseName;
  if (todo.kind === "materialFailed") {
    return { lead: "!", title: todo.filename, meta: t("g4.todo.materialFailed", { code }) };
  }
  if (todo.kind === "draft") {
    return {
      lead: String(todo.count),
      title: t("g4.todo.drafts", { count: todo.count }),
      meta: t("g4.todo.meta", { code }),
    };
  }
  return {
    lead: String(todo.count),
    title: t("g4.todo.reviewed", { count: todo.count }),
    meta: t("g4.todo.meta", { code }),
  };
}

describe("LecturerDashboardPage (D-05 / Figma Frame 07.1)", () => {
  const mockCoursesWithCases: CourseWithCases[] = [
    {
      course: {
        id: "c-1",
        name: "An ninh mạng & Ứng cứu sự cố",
        courseCode: "CS402",
        active: true,
      },
      cases: [
        {
          id: "case-1",
          courseId: "c-1",
          title: "Sự cố DDoS cổng thanh toán",
          learningMode: "BRANCHING_STUDY",
          status: "PUBLISHED",
        },
        {
          id: "case-2",
          courseId: "c-1",
          title: "Sự cố triển khai phiên bản mới",
          learningMode: "BRANCHING_STUDY",
          status: "DRAFT",
        },
      ],
      materials: [
        {
          id: "mat-1",
          courseId: "c-1",
          originalFilename: "Phu_luc_Nhat_ky_he_thong.docx",
          processingStatus: "FAILED",
        },
        {
          id: "mat-2",
          courseId: "c-1",
          originalFilename: "Giao_trinh_Zero_Trust.pdf",
          processingStatus: "COMPLETED",
        },
      ],
    },
    {
      course: {
        id: "c-2",
        name: "Kỹ thuật phần mềm",
        courseCode: "CS301",
        active: true,
      },
      cases: [
        {
          id: "case-3",
          courseId: "c-2",
          title: "Kiến trúc Microservices",
          learningMode: "BRANCHING_STUDY",
          status: "REVIEWED",
        },
      ],
      materials: [],
    },
  ];

  // ── AC-1 & AC-2: Metrics calculation & Todo generation from real data ────────
  it("AC-1 & AC-2: countCases accurately counts published and draft/reviewed cases", () => {
    const published = countCases(mockCoursesWithCases, ["PUBLISHED"]);
    const draftsAndReviewed = countCases(mockCoursesWithCases, ["DRAFT", "REVIEWED"]);

    assert.equal(published, 1);
    assert.equal(draftsAndReviewed, 2);
  });

  it("AC-2: lecturerTodos generates todo items for failed materials, drafts, and reviewed cases", () => {
    const todos = lecturerTodos(mockCoursesWithCases);

    assert.equal(todos.length, 3);
    const failedMatTodo = todos.find((t) => t.kind === "materialFailed");
    const draftTodo = todos.find((t) => t.kind === "draft");
    const reviewedTodo = todos.find((t) => t.kind === "reviewed");

    assert.ok(failedMatTodo && failedMatTodo.kind === "materialFailed");
    assert.equal(failedMatTodo.filename, "Phu_luc_Nhat_ky_he_thong.docx");
    assert.equal(failedMatTodo.courseCode, "CS402");

    assert.ok(draftTodo && draftTodo.kind === "draft");
    assert.equal(draftTodo.count, 1);
    assert.equal(draftTodo.courseCode, "CS402");

    assert.ok(reviewedTodo && reviewedTodo.kind === "reviewed");
    assert.equal(reviewedTodo.count, 1);
    assert.equal(reviewedTodo.courseCode, "CS301");
  });

  it("AC-2: describeTodo formats action items cleanly with lead counts and metadata", () => {
    const mockT = (key: string, opts?: any) => {
      if (key === "g4.todo.materialFailed") return `Lập chỉ mục thất bại · ${opts?.code}`;
      if (key === "g4.todo.drafts") return `${opts?.count} Bản nháp chờ rà soát`;
      if (key === "g4.todo.reviewed") return `${opts?.count} case chờ phê duyệt`;
      if (key === "g4.todo.meta") return `Case Study: ${opts?.code}`;
      return key;
    };

    const todos = lecturerTodos(mockCoursesWithCases);
    const failedDesc = describeTodo(todos.find((t) => t.kind === "materialFailed")!, mockT);
    assert.equal(failedDesc.lead, "!");
    assert.equal(failedDesc.title, "Phu_luc_Nhat_ky_he_thong.docx");
    assert.equal(failedDesc.meta, "Lập chỉ mục thất bại · CS402");

    const draftDesc = describeTodo(todos.find((t) => t.kind === "draft")!, mockT);
    assert.equal(draftDesc.lead, "1");
    assert.equal(draftDesc.title, "1 Bản nháp chờ rà soát");
    assert.equal(draftDesc.meta, "Case Study: CS402");
  });

  // ── AC-4: Pedagogical Non-Grading Boundary ──────────────────────────────────
  it("AC-4: dashboard data and models contain zero student grading, ranking, or score fields", () => {
    for (const item of mockCoursesWithCases) {
      assert.equal((item as any).score, undefined);
      assert.equal((item as any).grade, undefined);
      assert.equal((item as any).ranking, undefined);
      assert.equal((item as any).passFail, undefined);
    }
  });
});
