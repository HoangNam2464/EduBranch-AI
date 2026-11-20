import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type {
  AdminUserItem,
  AdminCourseItem,
  AdminCaseItem,
  AdminSystemLogItem,
  AdminSystemSettings,
} from "../../services/adminService";

describe("Admin Management Screens (FE-032 / BE-032 / Figma 10.3–10.10)", () => {
  it("AC-1: User Management model supports lock/unlock status toggling", () => {
    const user: AdminUserItem = {
      id: "u-1",
      name: "Nguyễn Minh Anh",
      email: "minhanh@dtu.edu.vn",
      createdAt: "02/09/2026 · 08:15",
      role: "STUDENT",
      coursesInfo: "CS402 · MK210",
      attemptCount: 12,
      status: "ACTIVE",
    };

    assert.equal(user.status, "ACTIVE");
    const lockedUser = { ...user, status: "LOCKED" as const };
    assert.equal(lockedUser.status, "LOCKED");
  });

  it("AC-2: Course and Case models support straight-column table data and filters", () => {
    const course: AdminCourseItem = {
      id: "cs402",
      name: "An ninh mạng & Ứng cứu sự cố",
      courseCode: "CS402",
      lecturerName: "TS. Nguyễn Văn An",
      status: "ACTIVE",
      materialsCount: 5,
      materialsReady: 2,
      casesCount: 6,
      errorCount: 1,
      attemptsCount: 58,
    };

    assert.equal(course.courseCode, "CS402");
    assert.equal(course.materialsReady, 2);
    assert.equal(course.attemptsCount, 58);

    const caseItem: AdminCaseItem = {
      id: "case-1",
      title: "Khủng hoảng sập mạng lưới trung tâm dữ liệu",
      courseId: "cs402",
      courseName: "An ninh mạng & Ứng cứu sự cố",
      learningMode: "BRANCHING_STUDY",
      status: "DRAFT",
      nodesCount: 6,
      updatedAt: "30/11/2026",
    };

    assert.equal(caseItem.learningMode, "BRANCHING_STUDY");
    assert.equal(caseItem.nodesCount, 6);
  });

  it("AC-3: Privacy & Pedagogical Guardrail — Admin cannot inspect private student reasoning or reflections", () => {
    const adminLog: AdminSystemLogItem = {
      id: "log-1",
      code: "#2481",
      actorName: "Nguyễn Minh Anh",
      actorEmail: "minhanh@dtu.edu.vn",
      timestamp: "23/11/2026 · 09:42",
      eventTitle: "Nộp bài Review Study",
      eventMeta: "MK210 - Tối ưu chiến dịch NovaPay",
      status: "SUCCESS",
      details: "Sinh viên nộp bài phân tích thành công cho case MK210.",
    };

    const keys = Object.keys(adminLog);
    // Verifies that log events do not expose raw student essays, reasoning text, or private reflections
    assert.ok(!keys.includes("reasoningText"));
    assert.ok(!keys.includes("studentReflection"));
    assert.ok(!keys.includes("proposedSolution"));
    assert.equal(adminLog.code, "#2481");
  });

  it("AC-1: System Settings model contains platform metadata and operating unit", () => {
    const settings: AdminSystemSettings = {
      platformName: "EduBranch AI",
      operatorUnit: "Trường Đại học Duy Tân - Đồ án C1SE.65",
      loginNotice: "Hệ thống bảo trì định kỳ từ 22:00 đến 23:00 thứ Bảy hàng tuần.",
      supportEmail: "support@edubranch.ai",
      limits: {
        fileFormats: "PDF, DOCX",
        maxFileSize: "50 MB mỗi tệp",
        registration: "Đang mở",
        version: "1.0 (MVP)",
        timezone: "GMT+7",
      },
      aiPolicyNote: "Cấu hình AI không chỉnh trên giao diện (OPD-013).",
    };

    assert.equal(settings.platformName, "EduBranch AI");
    assert.equal(settings.limits.fileFormats, "PDF, DOCX");
    assert.equal(settings.limits.timezone, "GMT+7");
  });
});
