import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { initialsOf, resolveShellNav, resolveTitleKey } from "@/layouts/shell/shellRoutes";
import vi from "@/locales/vi.json";

const at = (pathname: string, search = "") => ({ pathname, search });
const activeIds = (nav: ReturnType<typeof resolveShellNav>) => nav.items.filter((i) => i.active).map((i) => i.id);
const ids = (nav: ReturnType<typeof resolveShellNav>) => nav.items.map((i) => i.id);

/** Reads a dotted key from the Vietnamese locale (fails the test if missing). */
function viText(key: string): string {
  const value = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], vi);
  assert.equal(typeof value, "string", `missing locale key ${key}`);
  return value as string;
}

describe("resolveShellNav — Lecturer (Figma 02.x–04.x, 07.1, 07.8)", () => {
  it("shows the four lecturer items in Figma order", () => {
    assert.deepEqual(ids(resolveShellNav("LECTURER", at("/lecturer/courses"))), ["courses", "cases", "feedback", "statistics"]);
  });

  it("marks Khóa học active on course list, course detail and material sources", () => {
    for (const p of ["/lecturer/courses", "/lecturer/courses/cs402/materials", "/lecturer/courses/cs402/materials/m1/rag"]) {
      assert.deepEqual(activeIds(resolveShellNav("LECTURER", at(p))), ["courses"], p);
    }
  });

  it("marks Case Study active on case list, editor, AI Studio and rubric (07.6, 07.8)", () => {
    for (const p of ["/lecturer/cases", "/lecturer/cases/c1/review", "/lecturer/ai-studio", "/lecturer/rubric", "/lecturer/cases/c1/rubric"]) {
      assert.deepEqual(activeIds(resolveShellNav("LECTURER", at(p))), ["cases"], p);
    }
  });

  it("has no active item on the dashboard and the profile (07.1, 09.1)", () => {
    for (const p of ["/lecturer", "/lecturer/dashboard", "/lecturer/profile"]) {
      assert.deepEqual(activeIds(resolveShellNav("LECTURER", at(p))), [], p);
    }
  });
});

describe("resolveShellNav — Student", () => {
  it("main area: Bàn học / Khóa học của tôi / Tham gia lớp học (07.2–07.4)", () => {
    assert.deepEqual(ids(resolveShellNav("STUDENT", at("/student"))), ["desk", "courses", "join"]);
    assert.deepEqual(activeIds(resolveShellNav("STUDENT", at("/student"))), ["desk"]);
    assert.deepEqual(activeIds(resolveShellNav("STUDENT", at("/student/desk"))), ["desk"]);
    assert.deepEqual(activeIds(resolveShellNav("STUDENT", at("/student/courses"))), ["courses"]);
    assert.deepEqual(activeIds(resolveShellNav("STUDENT", at("/student/courses", "?join=true"))), ["join"]);
    assert.deepEqual(activeIds(resolveShellNav("STUDENT", at("/student/profile"))), []);
  });

  it("branching case context: Tình huống / Lịch sử lần làm / Journey Review (05.x)", () => {
    const play = resolveShellNav("STUDENT", at("/student/cases/cs301/branching-play"));
    assert.deepEqual(ids(play), ["case", "history", "journey"]);
    assert.deepEqual(activeIds(play), ["case"]);
    assert.equal(play.items[0].to, "/student/cases/cs301/branching-play");
    assert.equal(play.items[1].to, "/student/cases/cs301/history");
    // No attempt in the URL yet → Journey Review cannot be opened.
    assert.equal(play.items[2].to, null);

    const review = resolveShellNav("STUDENT", at("/student/cases/cs301/attempt/a1/review"));
    assert.deepEqual(activeIds(review), ["journey"]);
    assert.equal(review.items[2].to, "/student/cases/cs301/attempt/a1/review");

    assert.deepEqual(activeIds(resolveShellNav("STUDENT", at("/student/cases/cs301/attempt/a1/reflect"))), ["journey"]);
    assert.deepEqual(activeIds(resolveShellNav("STUDENT", at("/student/cases/cs301/challenge/s1"))), ["journey"]);
    assert.deepEqual(activeIds(resolveShellNav("STUDENT", at("/student/cases/cs301/history"))), ["history"]);
  });

  it("review study context: Bài làm / Phản hồi (06.x)", () => {
    const work = resolveShellNav("STUDENT", at("/student/cases/mk210/review-study"));
    assert.deepEqual(ids(work), ["work", "feedback"]);
    assert.deepEqual(activeIds(work), ["work"]);
    assert.equal(work.items[1].to, null);

    const feedback = resolveShellNav("STUDENT", at("/student/cases/mk210/review-study/sub-9/feedback"));
    assert.deepEqual(activeIds(feedback), ["feedback"]);
    assert.equal(feedback.items[1].to, "/student/cases/mk210/review-study/sub-9/feedback");
    assert.equal(feedback.items[0].to, "/student/cases/mk210/review-study");
  });
});

describe("resolveShellNav — Admin (10.x)", () => {
  it("shows the eight admin items and highlights the current one", () => {
    assert.deepEqual(ids(resolveShellNav("ADMIN", at("/admin"))), [
      "dashboard", "users", "courses", "cases", "rubric", "logs", "aiService", "settings",
    ]);
    assert.deepEqual(activeIds(resolveShellNav("ADMIN", at("/admin"))), ["dashboard"]);
    assert.deepEqual(activeIds(resolveShellNav("ADMIN", at("/admin/ai-service"))), ["aiService"]);
    assert.deepEqual(activeIds(resolveShellNav("ADMIN", at("/admin/profile"))), []);
  });

  it("always has exactly one or zero active item for every role path", () => {
    for (const p of ["/admin/users", "/admin/logs", "/admin/settings", "/admin/rubric", "/admin/rubric/c1"]) {
      assert.equal(activeIds(resolveShellNav("ADMIN", at(p))).length, 1, p);
    }
    assert.deepEqual(activeIds(resolveShellNav("ADMIN", at("/admin/rubric/c1"))), ["rubric"]);
  });
});

describe("resolveTitleKey — header titles match Figma", () => {
  const cases: Array<[string, string, string]> = [
    ["/lecturer/courses", "", "Quản lý khóa học"],
    ["/lecturer/dashboard", "", "Tổng quan · Lịch hạn nộp"],
    ["/lecturer/cases", "", "Quản lý Case Study"],
    ["/lecturer/feedback", "", "Hàng đợi Review và phản hồi lập luận"],
    ["/lecturer/statistics", "", "Thống kê luồng học tập"],
    ["/student", "", "Bàn học"],
    ["/student/courses", "", "Khóa học của tôi"],
    ["/student/courses", "?join=true", "Tham gia lớp học"],
    ["/student/cases/c/attempt/a/reflect", "", "Suy ngẫm & đúc kết bài học"],
    ["/admin/dashboard", "", "Bảng điều khiển"],
    ["/admin/courses", "", "Khóa học toàn hệ thống"],
    ["/admin/cases", "", "Case Study toàn hệ thống"],
    ["/admin/rubric", "", "Nghiên cứu & Rubric"],
    ["/admin/rubric/c1", "", "Nghiên cứu & Rubric"],
  ];
  for (const [pathname, search, expected] of cases) {
    it(`${pathname}${search} → ${expected}`, () => {
      const key = resolveTitleKey({ pathname, search });
      assert.ok(key, "no title key");
      assert.equal(viText(key!), expected);
    });
  }

  it("returns null for unknown paths", () => {
    assert.equal(resolveTitleKey({ pathname: "/nowhere", search: "" }), null);
  });
});

describe("initialsOf", () => {
  it("uses the first and last word and skips academic titles", () => {
    assert.equal(initialsOf("TS. Nguyễn Văn An"), "NA");
    assert.equal(initialsOf("ThS. Trần Thu Hà"), "TH");
    assert.equal(initialsOf("Lê Minh Khôi"), "LK");
    assert.equal(initialsOf("Khôi"), "K");
    assert.equal(initialsOf(""), "");
    assert.equal(initialsOf(undefined), "");
  });
});
